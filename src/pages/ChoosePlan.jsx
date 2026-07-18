import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  { name: "Starter", price: 19, variantEnv: "VITE_LS_STARTER_VARIANT_ID", features: ["Up to 50 leads", "Basic pipeline", "Email support"], popular: false },
  { name: "Professional", price: 49, variantEnv: "VITE_LS_PROFESSIONAL_VARIANT_ID", features: ["Unlimited leads", "Full pipeline & invoicing", "Priority support", "Advanced analytics"], popular: true },
  { name: "Enterprise", price: 99, variantEnv: "VITE_LS_ENTERPRISE_VARIANT_ID", features: ["Everything in Professional", "Dedicated account manager", "Custom branding", "API access"], popular: false },
];

export default function ChoosePlan() {
  const [selecting, setSelecting] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSelect = async (plan) => {
    setSelecting(plan.name);
    setError("");
    try {
      const variantId = import.meta.env[plan.variantEnv];
      const storeId = import.meta.env.VITE_LS_STORE_ID;
      const apiKey = import.meta.env.VITE_LS_API_KEY;
      if (!variantId || !storeId || !apiKey) throw new Error("Payment configuration missing.");
      const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/vnd.api+json", Accept: "application/vnd.api+json" },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: { email: user?.email || "", custom: { user_id: user?.id || "", plan: plan.name } },
              product_options: { redirect_url: `${window.location.origin}/` },
            },
            relationships: {
              store: { data: { type: "stores", id: storeId } },
              variant: { data: { type: "variants", id: variantId } },
            },
          },
        }),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0]?.detail || "Checkout failed");
      const url = data.data?.attributes?.url;
      if (!url) throw new Error("No checkout URL");
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setSelecting("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-lg">D</span>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Choose Your Plan</h1>
          <p className="text-white/40 mt-2 text-sm">Select a subscription to unlock DealFlow CRM</p>
        </div>
        {error && <div className="bg-red-950 border border-red-800 text-red-400 rounded-xl p-4 mb-6 text-center text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 flex flex-col border transition-all duration-300 ${plan.popular ? "bg-white border-white" : "bg-[#141414] border-white/10 hover:border-white/20"}`}>
              {plan.popular && <div className="text-black text-xs font-bold tracking-widest uppercase mb-3">MOST POPULAR</div>}
              <h3 className={`font-bold text-xl ${plan.popular ? "text-black" : "text-white"}`} style={{ fontFamily: 'Syne, sans-serif' }}>{plan.name}</h3>
              <p className="mt-2">
                <span className={`text-3xl font-bold ${plan.popular ? "text-black" : "text-white"}`}>${plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-black/50" : "text-white/30"}`}>/month</span>
              </p>
              <ul className="mt-5 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-black" : "text-white/50"}`} />
                    <span className={plan.popular ? "text-black/70" : "text-white/50"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleSelect(plan)} disabled={!!selecting}
                className={`w-full mt-6 font-semibold ${plan.popular ? "bg-black hover:bg-black/80 text-white" : "bg-white hover:bg-white/90 text-black"}`}>
                {selecting === plan.name ? "Activating…" : "Select Plan"}
              </Button>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-white/20 mt-8">Secure payment by Lemon Squeezy · Cancel anytime</p>
      </div>
    </div>
  );
}

