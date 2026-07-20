import React, { useState, useEffect } from "react";
import { Invoice, Lead } from "@/api/entities";
import { Plus, Search, Download, CheckCircle2, Receipt, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import InvoiceFormDialog from "@/components/invoices/InvoiceFormDialog";
import MarkPaidDialog from "@/components/invoices/MarkPaidDialog";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import moment from "moment";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  Paid: "bg-white/20 text-white",
  Pending: "bg-white/10 text-white/60",
  Overdue: "bg-red-500/20 text-red-400",
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = async () => { const [inv, lds] = await Promise.all([Invoice.list(), Lead.list()]); setInvoices(inv); setLeads(lds); setLoading(false); };
  useEffect(() => { if (user) loadData(); }, [user]);

  const handleCreate = async (data) => { await Invoice.create(data); toast({ title: "Invoice created" }); loadData(); };
  const handleStripePay = async (invoiceId) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", { body: { type: "invoice", invoiceId } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (err) { toast({ title: "Payment failed", description: err.message, variant: "destructive" }); }
  };
  const handleMarkPaid = async (id, paymentDate) => { await Invoice.update(id, { status: "Paid", payment_date: paymentDate }); toast({ title: "Invoice marked as paid" }); loadData(); };

  const filtered = invoices.filter((inv) => {
    const matchesSearch = inv.lead_name?.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8"><SkeletonLoader rows={5} /></div>;

  if (user?.subscription_plan === "Starter") {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-xl bg-white/8 flex items-center justify-center mx-auto mb-5"><Lock className="w-7 h-7 text-white/40" /></div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Invoicing is a Professional feature</h1>
        <p className="text-white/40 mt-2">Upgrade to Professional or Enterprise to create invoices and collect payments.</p>
        <Link to="/choose-plan"><Button className="bg-white hover:bg-white/90 text-black font-semibold mt-6">Upgrade Plan</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Billing & Invoices</h1>
          <p className="text-sm text-white/40 mt-1">{invoices.length} total invoices</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-white hover:bg-white/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by client or invoice #…" className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/20" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10">
            <SelectItem value="all" className="text-white">All Statuses</SelectItem>
            {["Paid", "Pending", "Overdue"].map((s) => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-lg">No invoices found</p>
          <p className="text-sm mt-1">Create your first invoice to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-[#141414] rounded-xl border border-white/8 p-5 hover:border-white/15 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{inv.invoice_number}</h3>
                      <Badge className={`${STATUS_COLORS[inv.status] || "bg-white/10 text-white/50"} text-xs font-medium border-0`}>{inv.status}</Badge>
                    </div>
                    <p className="text-sm text-white/50 mt-1">{inv.lead_name} · {inv.description || "—"}</p>
                    {inv.property_reference && <p className="text-xs text-white/30 mt-0.5">{inv.property_reference}</p>}
                    <p className="text-xs text-white/30 mt-0.5">
                      Due {inv.due_date ? moment(inv.due_date).format("MMM D, YYYY") : "—"}
                      {inv.status === "Paid" && inv.payment_date && ` · Paid ${moment(inv.payment_date).format("MMM D, YYYY")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-white">${Number(inv.amount || 0).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => generateInvoicePDF(inv)} className="border-white/10 text-white/40 hover:bg-white/10 hover:text-white bg-transparent"><Download className="w-4 h-4" /></Button>
                      {inv.status !== "Paid" && (
                        <>
                          <Button variant="outline" size="icon" onClick={() => handleStripePay(inv.id)} className="border-white/10 text-white/40 hover:bg-white/10 hover:text-white bg-transparent"><CreditCard className="w-4 h-4" /></Button>
                          <Button variant="outline" size="icon" onClick={() => setPayInvoice(inv)} className="border-white/10 text-white/40 hover:bg-white/10 hover:text-white bg-transparent"><CheckCircle2 className="w-4 h-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <InvoiceFormDialog open={formOpen} onOpenChange={setFormOpen} leads={leads} onSave={handleCreate} />
      <MarkPaidDialog open={!!payInvoice} onOpenChange={(o) => !o && setPayInvoice(null)} invoice={payInvoice} onConfirm={handleMarkPaid} />
    </div>
  );
}
