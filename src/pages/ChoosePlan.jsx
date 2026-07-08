import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/api/entities";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, Home } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";


const PLANS = [
  { name: "Starter", price: 19, features: ["Up to 50 leads", "Basic pipeline", "Email support"] },
  { name: "Professional", price: 49, features: ["Unlimited leads", "Full pipeline & invoicing", "Priority support"] },
  { name: "Enterprise", price: 99, features: ["Everything in Professional", "Dedicated account manager", "Custom branding"] },
];

export default function ChoosePlan() {
  const [selecting, setSelecting] = useState("");
  const { user, checkUserAuth } = useAuth();
  const navigate = useNavigate();

  const handleSelect = async (plan) => {
    setSelecting(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { type: "subscription", plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      alert("Payment setup failed: " + err.message);
      setSelecting("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E8D48B] flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7 text-[#1C1C1C]" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-[#1C1C1C]">Choose Your Plan</h1>
          <p className="text-gray-500 mt-2">Select a subscription to unlock your AgentIA dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-[#C9A227]/40 transition-all duration-300 flex flex-col"
            >
              <h3 className="font-heading font-bold text-xl text-[#1C1C1C]">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-heading font-bold text-[#C9A227]">${plan.price}</span>
                <span className="text-sm text-gray-400">/month</span>
              </p>
              <ul className="mt-5 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-[#C9A227] mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSelect(plan.name)}
                disabled={!!selecting}
                className="w-full mt-6 bg-[#1C1C1C] hover:bg-[#C9A227] text-white transition-colors duration-300"
              >
                {selecting === plan.name ? "Activating…" : "Select Plan"}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
