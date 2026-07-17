// supabase/functions/create-checkout-session/index.ts
// Creates a Lemon Squeezy Checkout for the logged-in user and returns the checkout URL.
// Frontend (ChoosePlan.jsx) already calls this with: { type: "subscription", plan: "Starter" | "Professional" | "Enterprise" }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map plan name -> Lemon Squeezy Variant ID (set these as secrets, read below)
const PLAN_VARIANTS: Record<string, string | undefined> = {
  Starter: Deno.env.get("LEMONSQUEEZY_VARIANT_STARTER"),
  Professional: Deno.env.get("LEMONSQUEEZY_VARIANT_PROFESSIONAL"),
  Enterprise: Deno.env.get("LEMONSQUEEZY_VARIANT_ENTERPRISE"),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Client scoped to the caller, so we can identify who's checking out
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const { plan } = await req.json();
    const variantId = PLAN_VARIANTS[plan];
    if (!variantId) {
      return new Response(JSON.stringify({ error: `Unknown or unconfigured plan: ${plan}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storeId = Deno.env.get("LEMONSQUEEZY_STORE_ID");
    const apiKey = Deno.env.get("LEMONSQUEEZY_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? "";

    const lsResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
                plan_name: plan,
              },
            },
            product_options: {
              redirect_url: siteUrl ? `${siteUrl}/dashboard` : undefined,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: String(storeId) } },
            variant: { data: { type: "variants", id: String(variantId) } },
          },
        },
      }),
    });

    const lsData = await lsResponse.json();

    if (!lsResponse.ok) {
      console.error("Lemon Squeezy error:", JSON.stringify(lsData));
      return new Response(JSON.stringify({ error: "Failed to create checkout", details: lsData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkoutUrl = lsData?.data?.attributes?.url;

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
