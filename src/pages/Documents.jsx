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

  const loadData = async () => { const [d, l] = await Promise.all([Document.list(), Lead.list()]); setDocuments(d); setLeads(l); setLoading(false); };
  useEffect(() => { if (user) loadData(); }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const { file_url } = await uploadFile(file); setForm((f) => ({ ...f, file_url, name: f.name || file.name })); }
    catch (err) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); await Document.create(form);
    toast({ title: "Document uploaded" }); setFormOpen(false);
    setForm({ name: "", file_url: "", lead_id: "", lead_name: "", category: "Other" }); loadData();
  };

  const handleDelete = async (id) => { await Document.delete(id); toast({ title: "Document deleted" }); loadData(); };
  const filtered = documents.filter((d) => d.name?.toLowerCase().includes(search.toLowerCase()) || d.lead_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8"><SkeletonLoader rows={4} /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Documents</h1>
          <p className="text-sm text-white/40 mt-1">{documents.length} files</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-white hover:bg-white/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents…" className="pl-10 max-w-md bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/20" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg">No documents yet</p>
          <p className="text-sm mt-1">Upload your first document</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}
                className="bg-[#141414] rounded-xl border border-white/8 p-4 flex items-center gap-4 hover:border-white/15 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-white truncate">{doc.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {doc.lead_name && <span className="text-xs text-white/30">{doc.lead_name}</span>}
                    <Badge className="text-[10px] bg-white/8 text-white/40 border-0">{doc.category}</Badge>
                    <span className="text-xs text-white/20">{moment(doc.created_at).format("MMM D, YYYY")}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <a href={doc.file_url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
                    <Eye className="w-4 h-4 text-white/40" />
                  </a>
                  <a href={doc.file_url} download className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
                    <Download className="w-4 h-4 text-white/40" />
                  </a>
                  <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-full bg-white/8 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                    <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md bg-[#141414] border-white/10 text-white">
          <DialogHeader><DialogTitle className="text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Upload Document</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label className="text-white/60">File</Label>
              <label className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/30 transition-colors">
                <Upload className="w-8 h-8 text-white/20 mb-2" />
                <span className="text-sm text-white/40">{uploading ? "Uploading…" : form.file_url ? "File uploaded ✓" : "Click to upload"}</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div><Label className="text-white/60">Document Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="bg-[#1a1a1a] border-white/10 text-white" /></div>
            <div>
              <Label className="text-white/60">Client (optional)</Label>
              <Select value={form.lead_id} onValueChange={(v) => { const l = leads.find((l) => l.id === v); setForm({ ...form, lead_id: v, lead_name: l?.name || "" }); }}>
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">{leads.map((l) => <SelectItem key={l.id} value={l.id} className="text-white">{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">{["ID Copy", "Agreement", "Token Receipt", "Advance Receipt", "Other"].map((c) => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!form.file_url || !form.name} className="w-full bg-white hover:bg-white/90 text-black font-semibold">Upload Document</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
