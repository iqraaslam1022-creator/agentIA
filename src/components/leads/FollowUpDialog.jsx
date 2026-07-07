import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FollowUp } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

export default function FollowUpDialog({ open, onOpenChange, lead, onCreated }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;
    setSaving(true);
    await FollowUp.create({
      lead_id: lead.id,
      lead_name: lead.name,
      date,
      time,
      note,
      completed: false,
    });
    toast({ title: "Follow-up scheduled ✓" });
    setSaving(false);
    setDate("");
    setTime("");
    setNote("");
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Schedule Follow-up {lead ? `— ${lead.name}` : ""}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What do you need to follow up about?" />
          </div>
          <Button type="submit" disabled={saving || !date} className="w-full bg-[#1C1C1C] hover:bg-[#C9A227] text-white transition-colors duration-300">
            {saving ? "Saving…" : "Schedule Follow-up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
