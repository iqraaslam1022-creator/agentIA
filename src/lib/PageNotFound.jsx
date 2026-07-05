import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1] px-4">
      <div className="text-center">
        <h1 className="text-7xl font-heading font-bold text-[#C9A227] mb-2">404</h1>
        <p className="text-lg text-gray-500 mb-6">This page doesn't exist.</p>
        <Link to="/">
          <Button className="bg-[#1C1C1C] hover:bg-[#C9A227] text-white">
            <Home className="w-4 h-4 mr-2" /> Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
