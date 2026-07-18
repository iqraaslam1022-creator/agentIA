import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EBF4FF] via-[#F0F7FF] to-[#E8F0FE] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="text-center mb-8">
          {Icon && (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#60A5FA] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-heading font-bold text-[#0F2D6B]">{title}</h1>
          <p className="text-sm text-blue-500 mt-1 font-medium">DealFlow CRM</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {children}

        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}

