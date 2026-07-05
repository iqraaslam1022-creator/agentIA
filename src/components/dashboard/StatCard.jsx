import React from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
  gold: "bg-gradient-to-br from-[#C9A227] to-[#E8D48B] text-white",
  charcoal: "bg-[#1C1C1C] text-white",
  green: "bg-emerald-500 text-white",
  blue: "bg-blue-500 text-white",
};

export default function StatCard({ icon: Icon, label, value, prefix = "", color = "gold", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${COLOR_MAP[color] || COLOR_MAP.gold}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-heading font-bold text-[#1C1C1C]">
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
}
