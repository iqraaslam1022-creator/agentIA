import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md bg-[#141414] rounded-2xl shadow-2xl p-8 border border-white/8">
        <div className="text-center mb-8">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-4">
              <Icon className="w-6 h-6 text-black" />
            </div>
          )}
          <div className="text-white/30 text-xs tracking-widest uppercase mb-2 font-medium">DealFlow CRM</div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h1>
          {subtitle && <p className="text-sm text-white/40 mt-1">{subtitle}</p>}
        </div>
        {children}
        {footer && <p className="text-center text-sm text-white/30 mt-6">{footer}</p>}
      </div>
    </div>
  );
}

