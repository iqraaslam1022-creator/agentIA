import React, { useState, useEffect } from "react";
import { Property } from "@/api/entities";
import { Plus, Search, MapPin, BedDouble, Bath, Ruler, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import PropertyFormDialog from "@/components/properties/PropertyFormDialog";
import SkeletonLoader from "@/components/ui/SkeletonLoader";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import { useAuth } from "@/lib/AuthContext";

const STATUS_COLORS = {
  Available: "bg-white/20 text-white",
  "Under Negotiation": "bg-white/10 text-white/60",
  Sold: "bg-white/5 text-white/30",
  Rented: "bg-white/10 text-white/60",
};

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [deleteProp, setDeleteProp] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadProperties = async () => { const data = await Property.list(); setProperties(data); setLoading(false); };
  useEffect(() => { if (user) loadProperties(); }, [user]);

  const handleSave = async (data) => {
    if (editProp) { await Property.update(editProp.id, data); toast({ title: "Property updated" }); }
    else { await Property.create(data); toast({ title: "Property added" }); }
    setEditProp(null); loadProperties();
  };

  const confirmDelete = async () => { await Property.delete(deleteProp.id); toast({ title: "Property deleted" }); setDeleteProp(null); loadProperties(); };

  const filtered = properties.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) return <div className="p-8"><SkeletonLoader rows={4} /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Properties</h1>
          <p className="text-sm text-white/40 mt-1">{properties.length} listings</p>
        </div>
        <Button onClick={() => { setEditProp(null); setFormOpen(true); }} className="bg-white hover:bg-white/90 text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or location…" className="pl-10 bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/20" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10">
            <SelectItem value="all" className="text-white">All Types</SelectItem>
            {["House", "Apartment", "Plot", "Commercial"].map((t) => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 bg-[#1a1a1a] border-white/10 text-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10">
            <SelectItem value="all" className="text-white">All Statuses</SelectItem>
            {["Available", "Under Negotiation", "Sold", "Rented"].map((s) => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <p className="text-lg">No properties found</p>
          <p className="text-sm mt-1">Add your first property listing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((prop, i) => (
              <motion.div key={prop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-[#141414] rounded-xl border border-white/8 overflow-hidden hover:border-white/15 transition-all duration-300 group">
                <div className="relative h-48 bg-[#1a1a1a] overflow-hidden">
                  {prop.images?.length > 0 ? (
                    <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10"><MapPin className="w-12 h-12" /></div>
                  )}
                  <Badge className={`absolute top-3 left-3 ${STATUS_COLORS[prop.status] || ""} text-xs border-0`}>{prop.status}</Badge>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/60 hover:bg-black text-white"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                        <DropdownMenuItem onClick={() => { setEditProp(prop); setFormOpen(true); }} className="text-white hover:bg-white/10"><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteProp(prop)} className="text-red-400 hover:bg-white/10"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white">{prop.title}</h3>
                    <span className="text-lg font-bold text-white">${prop.price?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {prop.location}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                    {prop.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {prop.bedrooms} Beds</span>}
                    {prop.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.bathrooms} Baths</span>}
                    {prop.size && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {prop.size}</span>}
                  </div>
                  <Badge variant="outline" className="mt-3 text-xs border-white/15 text-white/40">{prop.type}</Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <PropertyFormDialog open={formOpen} onOpenChange={setFormOpen} property={editProp} onSave={handleSave} />
      <DeleteConfirmDialog open={!!deleteProp} onOpenChange={(o) => !o && setDeleteProp(null)} onConfirm={confirmDelete} />
    </div>
  );
}