import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import moment from "moment";

export default function SubscriptionGuard() {
  const { user } = useAuth();

  if (!user) return null;

  const isActive =
    user.subscription_status === "active" &&
    (!user.subscription_end_date || moment(user.subscription_end_date).isSameOrAfter(moment(), "day"));

  if (!isActive) {
    return <Navigate to="/choose-plan" replace />;
  }

  return <Outlet />;
}
