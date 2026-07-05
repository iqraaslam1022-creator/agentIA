import React, { useState, useEffect } from "react";
import { auth } from "@/api/auth";
import { UserProfile } from "@/api/entities";
import { uploadFile } from "@/api/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Phone, Save, Home, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ full_name: "", phone: "", agency_name: "", default_commission: "3", profile_picture_url: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const me = await auth.getCurrentUser();
      setUser(me);
      setForm({
        full_name: me.full_name || "",
        phone: me.phone || "",
        agency_name: me.agency_name || "",
        default_commission: me.default_commission || "3",
        profile_picture_url: me.profile_picture_url || "",
      });
    };
    load();
  }, []);

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      setForm((f) => ({ ...f, profile_picture_url: file_url }));
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { full_name, ...updatable } = form;
      await UserProfile.update(user.id, updatable);
      toast({ title: "Settings saved ✓" });
    } catch (err) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#1C1C1C]">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and preferences</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <label className="relative cursor-pointer group">
            {form.profile_picture_url ? (
              <img src={form.profile_picture_url} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A227] to-[#E8D48B] flex items-center justify-center">
                <User className="w-8 h-8 text-[#1C1C1C]" />
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" />
          </label>
          <div>
            <h3 className="font-heading font-semibold text-lg text-[#1C1C1C]">{user?.full_name || "Agent"}</h3>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {uploading && <p className="text-xs text-[#C9A227] mt-1">Uploading…</p>}
          </div>
        </div>

        <div>
          <Label>Full Name</Label>
          <Input value={form.full_name} disabled className="bg-gray-50" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
        </div>
        <div>
          <Label>Agency Name</Label>
          <Input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} placeholder="Your agency name" />
        </div>
        <div>
          <Label>Default Commission %</Label>
          <Input type="number" step="0.5" value={form.default_commission} onChange={(e) => setForm({ ...form, default_commission: e.target.value })} />
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-[#C9A227] hover:bg-[#b08e1f] text-white w-full transition-colors duration-300">
          <Save className="w-4 h-4 mr-2" /> {saving ? "Saving…" : "Save Settings"}
        </Button>
      </motion.div>

      {/* Branding */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1C1C1C] rounded-xl p-6 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E8D48B] flex items-center justify-center mx-auto mb-3">
          <Home className="w-7 h-7 text-[#1C1C1C]" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-white">AgentIA</h2>
        <p className="text-[#C9A227] text-sm tracking-widest uppercase mt-1">Every Lead, Every Deal, One Place.</p>
      </motion.div>
    </div>
  );
}
