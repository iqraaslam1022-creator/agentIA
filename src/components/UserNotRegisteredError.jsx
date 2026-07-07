import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/api/auth";

export default function UserNotRegisteredError() {
  const handleBackToLogin = async () => {
    await auth.logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1] px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <h1 className="text-xl font-heading font-bold text-[#1C1C1C] mb-2">Account not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          We couldn't find a profile for this account. Please try registering again or contact support.
        </p>
        <Button onClick={handleBackToLogin} className="bg-[#1C1C1C] hover:bg-[#C9A227] text-white">
          Back to login
        </Button>
      </div>
    </div>
  );
}
