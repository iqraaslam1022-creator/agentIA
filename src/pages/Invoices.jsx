import React, { useState, useEffect } from "react";
import { Invoice, Lead } from "@/api/entities";
import { Plus, Search, Download, CheckCircle2, Receipt, CreditCard } from "lucide-react";
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
<<<<<<< HEAD
=======
import { supabase } from "@/api/supabaseClient";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
>>>>>>> bc899968ca071fe448cacbf4b8fcbcc243761cd2

const STATUS_COLORS = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
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

  const loadData = async () => {
    const [inv, lds] = await Promise.all([
      Invoice.list(),
      Lead.list(),
    ]);
    setInvoices(inv);
    setLeads(lds);
    setLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleCreate = async (data) => {
    await Invoice.create(data);
    toast({ title: "Invoice created ✓" });
    loadData();
  };
<<<<<<< HEAD
=======
  const handleStripePay = async (invoiceId) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { type: "invoice", invoiceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    }
  };


>>>>>>> bc899968ca071fe448cacbf4b8fcbcc243761cd2

  const handleMarkPaid = async (id, paymentDate) => {
    await Invoice.update(id, { status: "Paid", payment_date: paymentDate });
    toast({ title: "Invoice marked as paid" });
    loadData();
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch = inv.lead_name?.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8"><SkeletonLoader rows={5} /></div>;
<<<<<<< HEAD
=======
  if (user?.subscription_plan === "Starter") {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-xl bg-[#1C1C1C] flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-[#C9A227]" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#1C1C1C]">Invoicing is a Professional feature</h1>
        <p className="text-gray-500 mt-2">
          Upgrade to the Professional or Enterprise plan to create invoices, collect payments, and generate PDFs.
        </p>
        <Link to="/choose-plan">
          <Button className="bg-[#C9A227] hover:bg-[#b08e1f] text-white mt-6">
            Upgrade Plan
          </Button>
        </Link>
      </div>
    );
  }
>>>>>>> bc899968ca071fe448cacbf4b8fcbcc243761cd2

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#1C1C1C]">Billing & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{invoices.length} total invoices</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-[#C9A227] hover:bg-[#b08e1f] text-white shadow-md hover:shadow-lg transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by client or invoice #…" className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["Paid", "Pending", "Overdue"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Invoice list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-lg">No invoices found</p>
          <p className="text-sm mt-1">Create your first invoice to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#C9A227]/30 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1C1C1C]">{inv.invoice_number}</h3>
                      <Badge className={`${STATUS_COLORS[inv.status] || "bg-gray-100 text-gray-600"} text-xs font-medium`}>{inv.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{inv.lead_name} · {inv.description || "—"}</p>
                    {inv.property_reference && <p className="text-xs text-gray-400 mt-0.5">{inv.property_reference}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Due {inv.due_date ? moment(inv.due_date).format("MMM D, YYYY") : "—"}
                      {inv.status === "Paid" && inv.payment_date && ` · Paid ${moment(inv.payment_date).format("MMM D, YYYY")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-heading font-bold text-[#C9A227]">${Number(inv.amount || 0).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => generateInvoicePDF(inv)} title="Download PDF">
                        <Download className="w-4 h-4" />
                      </Button>
                      {inv.status !== "Paid" && (
<<<<<<< HEAD
                        <Button variant="outline" size="icon" onClick={() => setPayInvoice(inv)} title="Mark as Paid" className="text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
=======
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStripePay(inv.id)}
                            title="Pay with Stripe"
                            className="text-indigo-600"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setPayInvoice(inv)} title="Mark as Paid" className="text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </>
>>>>>>> bc899968ca071fe448cacbf4b8fcbcc243761cd2
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
