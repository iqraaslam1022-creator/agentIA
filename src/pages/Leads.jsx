import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { Plus, Search, MoreVertical, Phone, MessageCircle, Clock, Trash2, Pencil, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import LeadFormDialog from "@/components/leads/LeadFormDialog";
import FollowUpDialog from "@/components/leads/FollowUpDialog";
import CommunicationLogPanel from "@/components/leads/CommunicationLogPanel";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import { useAuth } from "@/lib/AuthContext";
import AIAssistantButton from "@/components/AIAssistantButton";

const STATUS_COLORS = {
  New: "bg-white/10 text-white/70",
  Contacted: "bg-white/10 text-white/70",
  "Site Visit Scheduled": "bg-white/10 text-white/70",
  Negotiation: "bg-white/10 text-white/70",
  Closed: "bg-white/20 text-white",
  Lost: "bg-white/5 text-white/30",
};

export default function Leads() {
  const urlParams = new URLSearchParams(window.location.search);
  const highlightLeadId = urlParams.get("leadId");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [commLead, setCommLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadLeads = async () => { const data = await Lead.list(); setLeads(data); setLoading(false); };
  useEffect(() => { if (user) loadLeads(); }, [user]);
  useEffect(() => {
    if (highlightLeadId && leads.length > 0) {
      const lead = leads.find((l) => l.id === highlightLeadId);
      if (lead) setCommLead(lead);
    }
  }, [highlightLeadId, leads.length]);

  const handleSave = async (data) => {
    if (editLead) { await Lead.update(editLead.id, data); toast({ title: "Lead updated" }); }
    else { await Lead.create(data); toast({ title: "Lead added" }); }
    setEditLead(null); loadLeads();
  };

  const confirmDelete = async () => { await Lead.delete(deleteLead.id); toast({ title: "Lead deleted" }); setDeleteLead(null); loadLeads(); };

  const filtered = leads.filter((l) => {
    const matchesSearch = l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search);
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesSource = sourceFilter === "all" || l.lead_source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  if (loading) return <div className="p-8"><SkeletonLoader rows={5} /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Leads</h1>
          <p className="text-sm text-white/40 mt-1">{leads.length} total leads</p>
        </div>
        <Button onClick={() => {
          if (user?.subscription_plan === "Starter" && leads.length >= 50) {
            toast({ title: "Lead limit reached", description: "Upgrade to Professional for unlimited leads.", variant: "destructive" }); return;
          }
          setEditLead(null); setFormOpen(true);
        }} className="bg-white hover:bg-white/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone…" className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/20" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10">
            <SelectItem value="all" className="text-white">All Statuses</SelectItem>
            {["New", "Contacted", "Site Visit Scheduled", "Negotiation", "Closed", "Lost"].map((s) => (
              <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="All Sources" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10">
            <SelectItem value="all" className="text-white">All Sources</SelectItem>
            {["Facebook", "Referral", "Walk-in", "Website", "Other"].map((s) => (
              <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <p className="text-lg">No leads found</p>
          <p className="text-sm mt-1">Add your first lead to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((lead, i) => (
              <motion.div key={lead.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                className="bg-[#141414] rounded-xl border border-white/8 p-5 hover:border-white/15 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-white/80 transition-colors">{lead.name}</h3>
                    <p className="text-xs text-white/30 mt-0.5">{lead.lead_source || "—"} · {lead.property_interest || "—"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                      <DropdownMenuItem onClick={() => { setEditLead(lead); setFormOpen(true); }} className="text-white hover:bg-white/10"><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFollowUpLead(lead)} className="text-white hover:bg-white/10"><Clock className="w-4 h-4 mr-2" /> Follow-up</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCommLead(lead)} className="text-white hover:bg-white/10"><MessageSquare className="w-4 h-4 mr-2" /> Communication</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteLead(lead)} className="text-red-400 hover:bg-white/10"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-white/50">
                  {lead.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-white/20" /> {lead.phone}</p>}
                  {lead.email && <p className="flex items-center gap-2 truncate"><MessageCircle className="w-3.5 h-3.5 text-white/20" /> {lead.email}</p>}
                  {lead.preferred_location && <p className="text-xs text-white/30">📍 {lead.preferred_location}</p>}
                  {(lead.budget_min || lead.budget_max) && (
                    <p className="text-xs text-white/30">
                      💰 {lead.budget_min ? `$${lead.budget_min.toLocaleString()}` : "—"} – {lead.budget_max ? `$${lead.budget_max.toLocaleString()}` : "—"}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge className={`${STATUS_COLORS[lead.status] || "bg-white/10 text-white/50"} text-xs font-medium border-0`}>{lead.status}</Badge>
                  <div className="flex gap-1">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
                        <Phone className="w-3.5 h-3.5 text-white/40" />
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
                        <MessageCircle className="w-3.5 h-3.5 text-white/40" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/8 flex flex-col sm:flex-row gap-2">
                  <AIAssistantButton task="follow_up" context={lead} label="AI Follow-up" />
                  <AIAssistantButton task="lead_summary" context={lead} label="AI Summary" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} lead={editLead} onSave={handleSave} />
      <FollowUpDialog open={!!followUpLead} onOpenChange={(o) => !o && setFollowUpLead(null)} lead={followUpLead} onCreated={loadLeads} />
      <CommunicationLogPanel open={!!commLead} onOpenChange={(o) => !o && setCommLead(null)} lead={commLead} />
      <DeleteConfirmDialog open={!!deleteLead} onOpenChange={(o) => !o && setDeleteLead(null)} onConfirm={confirmDelete} />
    </div>
  );
}