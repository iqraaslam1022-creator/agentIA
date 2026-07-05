import React, { useState, useEffect } from "react";
import { Document, Lead } from "@/api/entities";
import { uploadFile } from "@/api/storage";
import { Plus, Search, FileText, Download, Trash2, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import moment from "moment";
import { useAuth } from "@/lib/AuthContext";

const CATEGORY_COLORS = {
  "ID Copy": "bg-blue-100 text-blue-700",
  Agreement: "bg-purple-100 text-purple-700",
  "Token Receipt": "bg-amber-100 text-amber-700",
  "Advance Receipt": "bg-emerald-100 text-emerald-700",
  Other: "bg-gray-100 text-gray-600",
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", file_url: "", lead_id: "", lead_name: "", category: "Other" });
  const { toast } = useToast();
  const { user } = useAuth();

  const loadData = async () => {
    const [d, l] = await Promise.all([
      Document.list(),
      Lead.list(),
    ]);
    setDocuments(d);
    setLeads(l);
    setLoading(false);
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      setForm((f) => ({ ...f, file_url, name: f.name || file.name }));
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await Document.create(form);
    toast({ title: "Document uploaded ✓" });
    setFormOpen(false);
    setForm({ name: "", file_url: "", lead_id: "", lead_name: "", category: "Other" });
    loadData();
  };

  const handleDelete = async (id) => {
    await Document.delete(id);
    toast({ title: "Document deleted" });
    loadData();
  };

  const filtered = documents.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) || d.lead_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8"><SkeletonLoader rows={4} /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#1C1C1C]">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{documents.length} files</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-[#C9A227] hover:bg-[#b08e1f] text-white shadow-md hover:shadow-lg transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…" className="pl-10 max-w-md" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">No documents yet</p>
          <p className="text-sm mt-1">Upload your first document</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[#C9A227]/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C9A227]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-[#1C1C1C] truncate">{doc.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {doc.lead_name && <span className="text-xs text-gray-400">{doc.lead_name}</span>}
                    <Badge className={`text-[10px] ${CATEGORY_COLORS[doc.category] || ""}`}>{doc.category}</Badge>
                    <span className="text-xs text-gray-300">{moment(doc.created_at).format("MMM D, YYYY")}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </a>
                  <a href={doc.file_url} download className="w-8 h-8 rounded-full bg-gray-100 hover:bg-emerald-100 flex items-center justify-center transition-colors">
                    <Download className="w-4 h-4 text-gray-500" />
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>File</Label>
              <label className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#C9A227] transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">{uploading ? "Uploading…" : form.file_url ? "File uploaded ✓" : "Click to upload"}</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div>
              <Label>Document Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Client (optional)</Label>
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
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ID Copy", "Agreement", "Token Receipt", "Advance Receipt", "Other"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!form.file_url || !form.name} className="w-full bg-[#1C1C1C] hover:bg-[#C9A227] text-white transition-colors duration-300">
              Upload Document
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
