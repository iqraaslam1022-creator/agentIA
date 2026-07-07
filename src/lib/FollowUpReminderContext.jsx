import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { FollowUp } from "@/api/entities";
import { useAuth } from "@/lib/AuthContext";
import moment from "moment";

const FollowUpReminderContext = createContext();

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute
const dismissedIds = new Set();

export const FollowUpReminderProvider = ({ children }) => {
  const [activeReminders, setActiveReminders] = useState([]);
  const { user, isAuthenticated } = useAuth();

  const checkReminders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const dueTodayIncomplete = await FollowUp.filter({ completed: false });
      const now = moment();
      const due = dueTodayIncomplete.filter((f) => {
        if (dismissedIds.has(f.id)) return false;
        if (f.date !== now.format("YYYY-MM-DD")) return false;
        if (!f.time) return true; // no specific time — show it
        const scheduled = moment(`${f.date} ${f.time}`, "YYYY-MM-DD HH:mm");
        return scheduled.isSameOrBefore(now);
      });
      setActiveReminders(due);
    } catch (err) {
      console.error("Failed to check follow-up reminders:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    checkReminders();
    const interval = setInterval(checkReminders, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, checkReminders]);

  const dismissReminder = (id) => {
    dismissedIds.add(id);
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <FollowUpReminderContext.Provider value={{ activeReminders, dismissReminder }}>
      {children}
    </FollowUpReminderContext.Provider>
  );
};

export const useFollowUpReminders = () => {
  const context = useContext(FollowUpReminderContext);
  if (!context) {
    throw new Error("useFollowUpReminders must be used within a FollowUpReminderProvider");
  }
  return context;
};
