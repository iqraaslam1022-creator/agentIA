import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Building2, KanbanSquare, FileText, Receipt, Settings, LogOut, Menu, X } from "lucide-react";
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

function SidebarFooter({ user, logout }) {
  return (
    <div className="p-4 border-t border-white/8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold">
          {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.full_name || "Agent"}</p>
          <p className="text-xs text-white/40 truncate">{user?.email}</p>
        </div>
      </div>
      <button onClick={() => logout()} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white transition-colors">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}

const NavItems = ({ setMobileOpen }) => (
  <nav className="flex-1 px-2 space-y-0.5 mt-4">
    {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
      <NavLink key={to} to={to} end={end}
        onClick={() => setMobileOpen && setMobileOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? "bg-white text-black font-semibold" : "text-white/50 hover:bg-white/5 hover:text-white"
          }`
        }
      >
        <Icon className="w-4 h-4" /> {label}
      </NavLink>
    ))}
  </nav>
);

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] flex items-center justify-between px-4 z-40 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          <span className="text-white font-bold text-base">DealFlow CRM</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[240px] bg-[#0A0A0A] flex flex-col h-full border-r border-white/8">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                  <span className="text-black font-bold text-sm">D</span>
                </div>
                <span className="text-white font-bold">DealFlow CRM</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/50"><X className="w-4 h-4" /></button>
            </div>
            <NavItems setMobileOpen={setMobileOpen} />
            <SidebarFooter user={user} logout={logout} />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="hidden lg:flex flex-col w-[240px] bg-[#0A0A0A] h-screen fixed left-0 top-0 border-r border-white/8">
        <div className="flex items-center gap-2.5 p-5 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow">
            <span className="text-black font-bold">D</span>
          </div>
          <div>
            <span className="text-white font-bold text-base leading-tight block">DealFlow</span>
            <span className="text-white/30 text-xs">CRM Platform</span>
          </div>
        </div>
        <NavItems />
        <SidebarFooter user={user} logout={logout} />
      </div>
    </>
  );
}
