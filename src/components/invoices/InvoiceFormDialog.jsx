import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import moment from "moment";

const EMPTY = {
  invoice_number: "",
  lead_id: "",
  lead_name: "",
  property_reference: "",
  amount: "",
  description: "",
  due_date: "",
  status: "Pending",
};

export default function InvoiceFormDialog({ open, onOpenChange, leads, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const generateInvoiceNumber = () => `INV-${moment().format("YYYYMMDD")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleOpenChange = (o) => {
    if (o) setForm({ ...EMPTY, invoice_number: generateInvoiceNumber() });
    onOpenChange(o);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, amount: Number(form.amount) });
    setSaving(false);
    setForm(EMPTY);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Invoice Number</Label>
            <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} required />
          </div>

          <div>
            <Label>Client *</Label>
            <Select value={form.lead_id} onValueChange={(v) => {
              const l = leads.find((l) => l.id === v);
              setForm({ ...form, lead_id: v, lead_name: l?.name || "" });
            }}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Property Reference</Label>
            <Input value={form.property_reference} onChange={(e) => setForm({ ...form, property_reference: e.target.value })} placeholder="e.g. Villa #12, DHA Phase 5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this invoice for?" />
          </div>

          <Button type="submit" disabled={saving || !form.lead_name || !form.amount} className="w-full bg-[#1C1C1C] hover:bg-[#C9A227] text-white transition-colors duration-300">
            {saving ? "Creating…" : "Create Invoice"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
