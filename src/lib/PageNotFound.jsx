import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>404</h1>
        <p className="text-lg text-white/40 mb-6">This page doesn't exist.</p>
        <Link to="/">
          <Button className="bg-white hover:bg-white/90 text-black font-semibold">
            <Home className="w-4 h-4 mr-2" /> Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
