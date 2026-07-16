// supabase/functions/lemon-webhook/index.ts
// Receives Lemon Squeezy webhook events and updates the user's subscription in Supabase.
// Deploy this function WITHOUT JWT verification (--no-verify-jwt), since Lemon Squeezy
// calls it directly and signs the payload with the webhook Signing Secret instead.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifySignature(rawBody: string, signatureHeader: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const digestHex = toHex(sigBuffer);

  if (digestHex.length !== signatureHeader.length) return false;

  // constant-time compare
  let mismatch = 0;
  for (let i = 0; i < digestHex.length; i++) {
    mismatch |= digestHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

// Lemon Squeezy variant ID -> plan name (set as secrets, must match the ones used in create-checkout-session)
function planFromVariantId(variantId: string): string | null {
  if (variantId === Deno.env.get("LEMONSQUEEZY_VARIANT_STARTER")) return "Starter";
  if (variantId === Deno.env.get("LEMONSQUEEZY_VARIANT_PROFESSIONAL")) return "Professional";
  if (variantId === Deno.env.get("LEMONSQUEEZY_VARIANT_ENTERPRISE")) return "Enterprise";
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Signature") ?? "";
  const secret = Deno.env.get("LEMONSQUEEZY_WEBHOOK_SECRET")!;

  const isValid = await verifySignature(rawBody, signature, secret);
  if (!isValid) {
    console.error("Invalid Lemon Squeezy webhook signature");
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload?.meta?.event_name;
  const customData = payload?.meta?.custom_data ?? {};
  const attributes = payload?.data?.attributes ?? {};

  // Prefer the user_id we passed in checkout_data.custom; fall back to nothing if missing.
  const userId = customData?.user_id;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
      case "subscription_unpaused": {
        const variantId = String(attributes.variant_id ?? "");
        const plan = planFromVariantId(variantId) ?? customData?.plan_name ?? null;
        const status = attributes.status; // e.g. "active", "on_trial", "past_due", "cancelled", "expired"
        const rawEndDate = attributes.renews_at ?? attributes.ends_at ?? null;

        if (userId) {
          await supabaseAdmin
            .from("users")
            .update({
              subscription_plan: plan,
              subscription_status: status === "active" || status === "on_trial" ? "active" : "inactive",
              subscription_end_date: rawEndDate ? rawEndDate.substring(0, 10) : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_paused": {
        if (userId) {
          await supabaseAdmin
            .from("users")
            .update({
              subscription_status: "inactive",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_payment_success": {
        // Renewal succeeded: keep status active, refresh end date if present
        const rawEndDate = attributes.renews_at ?? null;
        if (userId) {
          await supabaseAdmin
            .from("users")
            .update({
              subscription_status: "active",
              ...(rawEndDate ? { subscription_end_date: rawEndDate.substring(0, 10) } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_payment_failed": {
        // Optional: you could flag this separately instead of deactivating immediately
        console.log(`Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("lemon-webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
