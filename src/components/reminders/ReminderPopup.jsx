import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useFollowUpReminders } from "@/lib/FollowUpReminderContext";

export default function ReminderPopup() {
  const { activeReminders, dismissReminder } = useFollowUpReminders();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {activeReminders?.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#C9A227]/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-[#C9A227]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#1C1C1C]">Follow-up: {reminder.lead_name}</p>
              {reminder.note && <p className="text-xs text-gray-500 mt-0.5">{reminder.note}</p>}
              <Link
                to={`/leads?leadId=${reminder.lead_id}`}
                className="text-xs text-[#C9A227] font-medium hover:underline mt-1 inline-flex items-center gap-1"
                onClick={() => dismissReminder(reminder.id)}
              >
                <Phone className="w-3 h-3" /> Go to lead
              </Link>
            </div>
            <button onClick={() => dismissReminder(reminder.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
