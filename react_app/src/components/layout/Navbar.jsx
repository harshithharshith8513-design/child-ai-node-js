import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

export function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display font-black text-lg text-white tracking-tight">ChildGuard</span>
            <span className="font-display font-black text-lg bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent ml-1">AI</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <a href="/app" className="hover:text-violet-400 transition">Dashboard</a>
          <a href="/id-card" className="text-violet-400 border-b-2 border-violet-500 pb-0.5">ID Studio</a>
          <a href="/assistant" className="hover:text-violet-400 transition">AI Assistant</a>
        </nav>

        {/* User Badge */}
        <div className="flex items-center gap-3">
          <a
            href="/app"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-800 hover:bg-slate-800 transition"
          >
            <User className="h-3.5 w-3.5 text-violet-400" />
            <span>Guardian Portal</span>
          </a>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
