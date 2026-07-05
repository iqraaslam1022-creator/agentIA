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
  Available: "bg-emerald-100 text-emerald-700",
  "Under Negotiation": "bg-amber-100 text-amber-700",
  Sold: "bg-red-100 text-red-700",
  Rented: "bg-blue-100 text-blue-700",
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

  const loadProperties = async () => {
    // No need to filter by user manually — Row Level Security in Supabase
    // already ensures this only returns rows owned by the logged-in user.
    const data = await Property.list();
    setProperties(data);
    setLoading(false);
  };

  useEffect(() => { if (user) loadProperties(); }, [user]);

  const handleSave = async (data) => {
    if (editProp) {
      await Property.update(editProp.id, data);
      toast({ title: "Property updated" });
    } else {
      await Property.create(data);
      toast({ title: "Property added ✓" });
    }
    setEditProp(null);
    loadProperties();
  };

  const handleDelete = async (id) => {
    await Property.delete(id);
    toast({ title: "Property deleted" });
    loadProperties();
  };

  const confirmDelete = async () => {
    await handleDelete(deleteProp.id);
    setDeleteProp(null);
  };

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
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#1C1C1C]">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">{properties.length} listings</p>
        </div>
        <Button onClick={() => { setEditProp(null); setFormOpen(true); }} className="bg-[#C9A227] hover:bg-[#b08e1f] text-white shadow-md hover:shadow-lg transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" /> Add Property
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or location…" className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {["House", "Apartment", "Plot", "Commercial"].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["Available", "Under Negotiation", "Sold", "Rented"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property gallery */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No properties found</p>
          <p className="text-sm mt-1">Add your first property listing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#C9A227]/30 transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {prop.images?.length > 0 ? (
                    <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MapPin className="w-12 h-12" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 left-3 ${STATUS_COLORS[prop.status] || ""} text-xs`}>{prop.status}</Badge>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white shadow-sm"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditProp(prop); setFormOpen(true); }}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteProp(prop)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-[#1C1C1C] group-hover:text-[#C9A227] transition-colors">{prop.title}</h3>
                    <span className="text-lg font-heading font-bold text-[#C9A227]">${prop.price?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {prop.location}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    {prop.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {prop.bedrooms} Beds</span>}
                    {prop.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.bathrooms} Baths</span>}
                    {prop.size && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {prop.size}</span>}
                  </div>
                  <Badge variant="outline" className="mt-3 text-xs">{prop.type}</Badge>
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
