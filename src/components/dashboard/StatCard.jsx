import React from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
  gold: "bg-white text-black",
  charcoal: "bg-white/10 text-white",
  green: "bg-white/10 text-white",
  blue: "bg-white/10 text-white",
};

export default function StatCard({ icon: Icon, label, value, prefix = "", color = "gold", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-[#141414] rounded-xl border border-white/8 p-5 hover:border-white/15 transition-all duration-300"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${COLOR_MAP[color] || COLOR_MAP.gold}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </motion.div>
  );
}
