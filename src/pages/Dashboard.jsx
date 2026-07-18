import React, { useState, useEffect } from "react";
import { Lead, Deal, FollowUp, Invoice } from "@/api/entities";
import { Users, Handshake, DollarSign, Clock, ArrowRight, Receipt, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import StatCard from "@/components/dashboard/StatCard";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import moment from "moment";
import { useAuth } from "@/lib/AuthContext";

const PIE_COLORS = ["#ffffff", "#888888", "#555555", "#bbbbbb", "#333333", "#999999"];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [l, d, f, inv] = await Promise.all([Lead.list(), Deal.list(), FollowUp.filter({ completed: false }), Invoice.list()]);
      setLeads(l); setDeals(d); setFollowUps(f); setInvoices(inv); setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="p-8"><SkeletonLoader rows={4} /></div>;

  const activeLeads = leads.filter((l) => l.status !== "Closed" && l.status !== "Lost").length;
  const thisMonth = moment().startOf("month");
  const closedThisMonth = deals.filter((d) => d.stage === "Closed" && moment(d.created_at).isAfter(thisMonth)).length;
  const commissionThisMonth = deals.filter((d) => d.stage === "Closed" && moment(d.created_at).isAfter(thisMonth)).reduce((sum, d) => sum + (d.commission_amount || 0), 0);
  const todayFollowUps = followUps.filter((f) => f.date === moment().format("YYYY-MM-DD"));
  const totalInvoicedThisMonth = invoices.filter((inv) => moment(inv.created_at).isAfter(thisMonth)).reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPending = invoices.filter((inv) => inv.status === "Pending" || inv.status === "Overdue").reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const statusCounts = {};
  leads.forEach((l) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });
  const leadsByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const m = moment().subtract(i, "months");
    const count = deals.filter((d) => d.stage === "Closed" && moment(d.created_at).isSame(m, "month")).length;
    months.push({ month: m.format("MMM"), deals: count });
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>DealFlow CRM</h1>
          <p className="text-white/30 text-sm tracking-widest uppercase mt-1">Every Lead, Every Deal, One Place.</p>
        </div>
        <p className="text-sm text-white/30">{moment().format("dddd, MMMM D, YYYY")}</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Leads" value={activeLeads} color="gold" delay={0} />
        <StatCard icon={Handshake} label="Closed This Month" value={closedThisMonth} color="charcoal" delay={0.1} />
        <StatCard icon={DollarSign} label="Commission This Month" value={commissionThisMonth} prefix="$" color="green" delay={0.2} />
        <StatCard icon={Clock} label="Today's Follow-ups" value={todayFollowUps.length} color="blue" delay={0.3} />
        <StatCard icon={Receipt} label="Invoiced This Month" value={totalInvoicedThisMonth} prefix="$" color="gold" delay={0.4} />
        <StatCard icon={AlertCircle} label="Pending Payments" value={totalPending} prefix="$" color="blue" delay={0.5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#141414] rounded-xl border border-white/8 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Deals Closed — Last 6 Months</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#666" }} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", fontSize: "13px", color: "#fff" }} />
                <Bar dataKey="deals" fill="#ffffff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#141414] rounded-xl border border-white/8 p-6">
          <h3 className="text-base font-semibold text-white mb-4">Leads by Status</h3>
          <div className="h-[250px]">
            {leadsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadsByStatus} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "#555" }}>
                    {leadsByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/30 text-sm">No leads yet</div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#141414] rounded-xl border border-white/8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Today's Follow-ups</h3>
          <Link to="/leads" className="text-white/40 text-sm hover:text-white flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {todayFollowUps.length === 0 ? (
          <p className="text-white/30 text-sm py-4">No follow-ups scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {todayFollowUps.map((f) => (
              <Link key={f.id} to={`/leads?leadId=${f.lead_id}`} className="flex items-center justify-between p-3 rounded-lg bg-white/4 hover:bg-white/8 transition-colors">
                <div>
                  <p className="font-medium text-sm text-white">{f.lead_name}</p>
                  <p className="text-xs text-white/40">{f.note || "Follow-up scheduled"}</p>
                </div>
                <span className="text-xs text-white/50 font-medium">{f.time || "—"}</span>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
