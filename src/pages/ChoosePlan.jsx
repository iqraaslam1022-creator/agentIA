import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  {
    name: "Starter",
    price: 19,
    variantEnv: "VITE_LS_STARTER_VARIANT_ID",
    features: ["Up to 50 leads", "Basic pipeline", "Email support"],
    popular: false,
  },
  {
    name: "Professional",
    price: 49,
    variantEnv: "VITE_LS_PROFESSIONAL_VARIANT_ID",
    features: ["Unlimited leads", "Full pipeline & invoicing", "Priority support", "Advanced analytics"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    variantEnv: "VITE_LS_ENTERPRISE_VARIANT_ID",
    features: ["Everything in Professional", "Dedicated account manager", "Custom branding", "API access"],
    popular: false,
  },
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

      if (!variantId || !storeId || !apiKey) {
        throw new Error("Payment configuration missing. Please contact support.");
      }

      const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/vnd.api+json",
          Accept: "application/vnd.api+json",
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                email: user?.email || "",
                custom: { user_id: user?.id || "", plan: plan.name },
              },
              product_options: {
                redirect_url: `${window.location.origin}/`,
              },
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

      const checkoutUrl = data.data?.attributes?.url;
      if (!checkoutUrl) throw new Error("No checkout URL returned");

      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message);
      setSelecting("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF4FF] via-[#F0F7FF] to-[#E8F0FE] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-[#0F2D6B]">Choose Your Plan</h1>
          <p className="text-blue-500 mt-2 font-medium">DealFlow CRM — Real Estate Made Simple</p>
          <p className="text-gray-500 text-sm mt-1">Select a subscription to unlock your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 flex flex-col transition-all duration-300 ${plan.popular
                  ? "bg-[#0F2D6B] shadow-xl border-2 border-[#2563EB] scale-105"
                  : "bg-white shadow-md border border-blue-100 hover:shadow-lg hover:border-[#2563EB]/40"
                }`}
            >
              {plan.popular && (
                <div className="bg-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                  MOST POPULAR
                </div>
              )}
              <h3 className={`font-heading font-bold text-xl ${plan.popular ? "text-white" : "text-[#0F2D6B]"}`}>
                {plan.name}
              </h3>
              <p className="mt-2">
                <span className={`text-3xl font-heading font-bold ${plan.popular ? "text-[#60A5FA]" : "text-[#2563EB]"}`}>
                  ${plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? "text-blue-300" : "text-gray-400"}`}>/month</span>
              </p>
              <ul className="mt-5 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-[#60A5FA]" : "text-[#2563EB]"}`} />
                    <span className={plan.popular ? "text-blue-100" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSelect(plan)}
                disabled={!!selecting}
                className={`w-full mt-6 font-semibold transition-colors duration-300 ${plan.popular
                    ? "bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    : "bg-[#0F2D6B] hover:bg-[#2563EB] text-white"
                  }`}
              >
                {selecting === plan.name ? "Activating…" : "Select Plan"}
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Secure payment powered by Lemon Squeezy · Cancel anytime
        </p>
      </div>
    </div>
  );
}
