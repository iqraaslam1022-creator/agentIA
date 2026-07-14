import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { FollowUpReminderProvider } from "@/lib/FollowUpReminderContext";
import ReminderPopup from "@/components/reminders/ReminderPopup";

export default function AppLayout() {
  return (
    <FollowUpReminderProvider>
      <div className="min-h-screen bg-[#F8F6F1]">
        <Sidebar />
        <main className="lg:ml-[260px] pt-16 lg:pt-0 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
        <ReminderPopup />
      </div>
    </FollowUpReminderProvider>
  );
}
