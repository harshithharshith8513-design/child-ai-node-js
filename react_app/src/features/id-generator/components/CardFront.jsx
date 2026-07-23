import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function CardFront({ mode, formData, avatarUrl, currentPalette }) {
  return (
    <div
      id="digital-id-card-render"
      className={`w-full rounded-2xl border ${currentPalette.bg} backdrop-blur-2xl p-6 shadow-2xl relative overflow-hidden text-white transition-all duration-300 select-none`}
      style={{ minHeight: '285px' }}
    >
      {/* Holographic overlay */}
      <div className="absolute inset-0 hologram-effect pointer-events-none opacity-25"></div>

      {/* Card Top Branding Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-display font-black text-sm tracking-tight text-white leading-none">
              ChildGuard <span className="text-fuchsia-400">AI</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400">
              {mode === 'child' ? 'CHILD PROTECTOR ID' : 'PARENT GUARDIAN ID'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-extrabold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {formData.verificationStatus || (mode === 'child' ? 'PROTECTED CHILD' : 'VERIFIED GUARDIAN')}
        </div>
      </div>

      {/* Card Content Grid */}
      <div className="grid grid-cols-12 gap-4 items-center">
        
        {/* Photo & Chip */}
        <div className="col-span-4 flex flex-col items-center">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-1">
              <span className="text-[8px] font-mono font-bold text-white/80 tracking-wider">VERIFIED</span>
            </div>
          </div>

          {/* Metallic Chip Visual */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="h-5 w-7 rounded-sm chip-gold border border-amber-300/40 shadow-sm flex items-center justify-center">
              <div className="w-full h-0.5 bg-amber-950/40"></div>
            </div>
            <span className="text-[9px] font-mono text-slate-400 tracking-tighter">NFC CHIP</span>
          </div>
        </div>

        {/* Dynamic Details */}
        <div className="col-span-8 space-y-2">
          <div>
            <div className="text-[9px] uppercase font-semibold text-slate-400">Full Name</div>
            <div className="font-display font-extrabold text-lg tracking-tight text-white leading-tight break-words">
              {formData.fullName || 'Enter Name...'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Age / DOB</span>
              <span className="font-bold text-slate-100">{formData.age || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase font-semibold block">Blood Group</span>
              <span className="inline-block font-extrabold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                🩸 {formData.bloodGroup || 'O+'}
              </span>
            </div>
          </div>

          {mode === 'child' ? (
            <div className="bg-black/30 rounded-xl p-2 border border-white/10 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Guardian:</span>
                <span className="font-bold text-white">{formData.guardianName || 'N/A'} ({formData.guardianRelation || 'Parent'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emerg. Phone:</span>
                <span className="font-mono font-bold text-fuchsia-300">{formData.mobile || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 rounded-xl p-2 border border-white/10 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Role/Occ:</span>
                <span className="font-bold text-white">{formData.occupation || 'Guardian'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact:</span>
                <span className="font-mono font-bold text-cyan-300">{formData.mobile || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Card Footer Tag & Barcode */}
      <div className="mt-4 border-t border-white/10 pt-2 flex items-center justify-between text-[10px]">
        <div>
          <span className="text-slate-400">TAG ID: </span>
          <span className="font-mono font-bold text-violet-300">{formData.idCode || 'CG-849201'}</span>
        </div>
        <div className="text-[9px] font-mono tracking-widest text-slate-400">
          |||||| | |||| || ||| |||||
        </div>
      </div>

    </div>
  );
}

export default CardFront;
