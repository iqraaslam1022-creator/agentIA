import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CommunicationLog } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";
import { Phone, MessageCircle, Mail, Users, FileText } from "lucide-react";

const TYPE_ICONS = {
  Call: Phone,
  WhatsApp: MessageCircle,
  Email: Mail,
  Meeting: Users,
  Note: FileText,
};

export default function CommunicationLogPanel({ open, onOpenChange, lead }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("Call");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadLogs = async () => {
    if (!lead) return;
    setLoading(true);
    const data = await CommunicationLog.filter({ lead_id: lead.id });
    setLogs(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  };

  useEffect(() => {
    if (open && lead) loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    await CommunicationLog.create({
      lead_id: lead.id,
      type,
      content,
      date: moment().format("YYYY-MM-DD"),
    });
    toast({ title: "Logged ✓" });
    setContent("");
    setSaving(false);
    loadLogs();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Communication {lead ? `— ${lead.name}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-3 mt-2 pb-4 border-b border-gray-100">
          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Call", "WhatsApp", "Email", "Meeting", "Note"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              rows={1}
              placeholder="What happened?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button type="submit" disabled={saving || !content.trim()} size="sm" className="bg-[#1C1C1C] hover:bg-[#C9A227] text-white">
            {saving ? "Adding…" : "Add Log"}
          </Button>
        </form>

        <div className="space-y-3 mt-2">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No communication logged yet.</p>
          ) : (
            logs.map((log) => {
              const Icon = TYPE_ICONS[log.type] || FileText;
              return (
                <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{log.type}</Badge>
                      <span className="text-xs text-gray-400">{moment(log.date).format("MMM D, YYYY")}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{log.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
