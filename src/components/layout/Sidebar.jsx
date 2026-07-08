import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  KanbanSquare,
  FileText,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const NavItems = () => (
    <nav className="flex-1 px-3 space-y-1 mt-4">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
              ? "bg-[#C9A227] text-white"
              : "text-[#D4CFC4] hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <Icon className="w-4.5 h-4.5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1C1C1C] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#E8D48B]" />
          <span className="text-white font-heading font-bold">AgentIA</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[260px] bg-[#1C1C1C] flex flex-col h-full">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#E8D48B]" />
                <span className="text-white font-heading font-bold">AgentIA</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavItems />
            <SidebarFooter user={user} logout={logout} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[260px] bg-[#1C1C1C] z-30">
        <div className="flex items-center gap-2 p-5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C9A227] to-[#E8D48B]" />
          <div>
            <p className="text-white font-heading font-bold leading-tight">AgentIA</p>
            <p className="text-[10px] text-[#9A9488] tracking-widest uppercase">
              {user?.subscription_plan === "Enterprise" && user?.agency_name ? user.agency_name : "Real Estate CRM"}
            </p>
          </div>
        </div>
        <NavItems />
        <SidebarFooter user={user} logout={logout} />
      </aside>
    </>
  );
}

function SidebarFooter({ user, logout }) {
  return (
    <div className="p-3 border-t border-white/10">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227] text-sm font-semibold shrink-0">
          {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{user?.full_name || user?.email}</p>
          <p className="text-xs text-[#9A9488] truncate">{user?.subscription_plan || "Starter"} Plan</p>
        </div>
      </div>
      <button
        onClick={() => logout(true)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#D4CFC4] hover:bg-white/10 hover:text-white transition-colors mt-1"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </div>
  );
}
