import React, { useState, useEffect } from "react";
import { Deal, Lead, Property } from "@/api/entities";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, DollarSign, Calendar, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import moment from "moment";
import { useAuth } from "@/lib/AuthContext";

const STAGES = ["New Lead", "Site Visit", "Negotiation", "Agreement", "Closed"];
const STAGE_COLORS = {
  "New Lead": "border-t-blue-400",
  "Site Visit": "border-t-purple-400",
  "Negotiation": "border-t-amber-400",
  "Agreement": "border-t-orange-400",
  "Closed": "border-t-emerald-400",
};

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [form, setForm] = useState({ lead_name: "", lead_id: "", property_title: "", property_id: "", deal_value: "", commission_percentage: "3", expected_closing_date: "", stage: "New Lead" });
  const [calcValue, setCalcValue] = useState("");
  const [calcPercent, setCalcPercent] = useState("3");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    // Row Level Security already scopes these to the logged-in user,
    // so no need to filter by created_by_id manually anymore.
    const [d, l, p] = await Promise.all([
      Deal.list(),
      Lead.list(),
      Property.list(),
    ]);
    setDeals(d);
    setLeads(l);
    setProperties(p);
    setLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const newStage = result.destination.droppableId;
    const dealId = result.draggableId;
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));
    await Deal.update(dealId, { stage: newStage });
    if (newStage === "Closed") toast({ title: "🎉 Deal closed!" });
  };

  const handleAddDeal = async (e) => {
    e.preventDefault();
    setSaving(true);
    const commAmt = (Number(form.deal_value) * Number(form.commission_percentage)) / 100;
    await Deal.create({
      ...form,
      deal_value: Number(form.deal_value),
      commission_percentage: Number(form.commission_percentage),
      commission_amount: commAmt,
    });
    toast({ title: "Deal added ✓" });
    setSaving(false);
    setFormOpen(false);
    setForm({ lead_name: "", lead_id: "", property_title: "", property_id: "", deal_value: "", commission_percentage: "3", expected_closing_date: "", stage: "New Lead" });
    loadData();
  };

  // Commission this month
  const thisMonth = moment().startOf("month");
  const monthlyCommission = deals
    .filter((d) => d.stage === "Closed" && moment(d.created_at).isAfter(thisMonth))
    .reduce((sum, d) => sum + (d.commission_amount || 0), 0);

  if (loading) return <div className="p-8"><SkeletonLoader rows={4} /></div>;

  return (
    <div className="space-y-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#1C1C1C]">Deal Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">{deals.length} active deals · <span className="text-[#C9A227] font-medium">${monthlyCommission.toLocaleString()}</span> commission this month</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCalcOpen(true)} className="border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-colors">
            <Calculator className="w-4 h-4 mr-2" /> Calculator
          </Button>
          <Button onClick={() => setFormOpen(true)} className="bg-[#C9A227] hover:bg-[#b08e1f] text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[60vh]">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            return (
              <div key={stage} className="flex-shrink-0 w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-sm text-[#1C1C1C]">{stage}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] p-2 rounded-xl transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-[#C9A227]/5" : "bg-gray-50/50"}`}
                    >
                      {stageDeals.map((deal, i) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={i}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg border-t-2 ${STAGE_COLORS[stage]} border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${snapshot.isDragging ? "shadow-lg rotate-1" : ""}`}
                            >
                              <h4 className="font-semibold text-sm text-[#1C1C1C]">{deal.lead_name}</h4>
                              {deal.property_title && <p className="text-xs text-gray-500 mt-1">{deal.property_title}</p>}
                              <div className="flex items-center justify-between mt-3">
                                <span className="flex items-center gap-1 text-sm font-heading font-bold text-[#C9A227]">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  {deal.deal_value?.toLocaleString()}
                                </span>
                                {deal.expected_closing_date && (
                                  <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    {moment(deal.expected_closing_date).format("MMM D")}
                                  </span>
                                )}
                              </div>
                              {deal.commission_amount > 0 && (
                                <p className="text-[10px] text-gray-400 mt-2">Commission: ${deal.commission_amount?.toLocaleString()}</p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* New Deal Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">New Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDeal} className="space-y-4 mt-2">
            <div>
              <Label>Client</Label>
              <Select value={form.lead_id} onValueChange={(v) => {
                const l = leads.find((l) => l.id === v);
                setForm({ ...form, lead_id: v, lead_name: l?.name || "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                <SelectContent>
                  {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Property (optional)</Label>
              <Select value={form.property_id} onValueChange={(v) => {
                const p = properties.find((p) => p.id === v);
                setForm({ ...form, property_id: v, property_title: p?.title || "" });
              }}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Deal Value *</Label>
                <Input type="number" value={form.deal_value} onChange={(e) => setForm({ ...form, deal_value: e.target.value })} required />
              </div>
              <div>
                <Label>Commission %</Label>
                <Input type="number" step="0.5" value={form.commission_percentage} onChange={(e) => setForm({ ...form, commission_percentage: e.target.value })} />
              </div>
            </div>
            {form.deal_value && form.commission_percentage && (
              <p className="text-sm text-[#C9A227] font-medium">
                Commission: ${((Number(form.deal_value) * Number(form.commission_percentage)) / 100).toLocaleString()}
              </p>
            )}
            <div>
              <Label>Expected Closing Date</Label>
              <Input type="date" value={form.expected_closing_date} onChange={(e) => setForm({ ...form, expected_closing_date: e.target.value })} />
            </div>
            <Button type="submit" disabled={saving || !form.lead_name || !form.deal_value} className="w-full bg-[#1C1C1C] hover:bg-[#C9A227] text-white transition-colors duration-300">
              {saving ? "Creating…" : "Create Deal"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Commission Calculator */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Commission Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Deal Value</Label>
              <Input type="number" value={calcValue} onChange={(e) => setCalcValue(e.target.value)} placeholder="Enter deal value" />
            </div>
            <div>
              <Label>Commission %</Label>
              <Input type="number" step="0.5" value={calcPercent} onChange={(e) => setCalcPercent(e.target.value)} />
            </div>
            {calcValue && calcPercent && (
              <div className="bg-[#C9A227]/10 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Your Commission</p>
                <p className="text-3xl font-heading font-bold text-[#C9A227]">
                  ${((Number(calcValue) * Number(calcPercent)) / 100).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
