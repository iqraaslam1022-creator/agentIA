import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F6F1] px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 border border-border">
        <div className="text-center mb-8">
          {Icon && (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E8D48B] flex items-center justify-center mx-auto mb-4">
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-heading font-bold text-[#1C1C1C]">{title}</h1>
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
