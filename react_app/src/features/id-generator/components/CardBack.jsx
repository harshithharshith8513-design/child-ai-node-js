import React from 'react';

export function CardBack({ formData, qrCodeRef }) {
  return (
    <div className="card-back absolute top-0 left-0 w-full h-full rounded-2xl border bg-slate-900/95 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden text-white flex flex-col justify-between select-none">
      
      {/* Magnetic Strip */}
      <div className="absolute top-4 left-0 right-0 h-9 bg-black/90 border-y border-white/10"></div>

      <div className="mt-10 space-y-3">
        {/* Address Box */}
        <div className="bg-black/40 rounded-xl p-2.5 border border-white/10 text-[10px]">
          <div className="text-[9px] font-semibold uppercase text-slate-400 mb-0.5">
            📍 Residential Address
          </div>
          <div className="text-slate-200 leading-snug">
            {formData.address || 'Address not registered.'}
          </div>
        </div>

        {/* Medical ICE Alert Box */}
        <div className="bg-rose-950/40 rounded-xl p-2.5 border border-rose-500/30 text-[10px]">
          <div className="text-[9px] font-extrabold uppercase text-rose-300 mb-0.5">
            ⚠️ Emergency ICE & Medical Conditions
          </div>
          <div className="text-rose-100 font-medium">
            {formData.allergiesMedical || 'No medical allergies or conditions listed.'}
          </div>
          <div className="mt-1 font-mono text-[9px] text-rose-300">
            ICE Secondary Phone: {formData.emergencyMobile || 'N/A'}
          </div>
        </div>
      </div>

      {/* Dynamic QR Code Footer */}
      <div className="flex items-end justify-between border-t border-white/10 pt-2 mt-2">
        <div>
          <div className="text-[8px] uppercase tracking-wider text-slate-400">Emergency QR Verification</div>
          <div className="text-[8px] text-slate-400">Scan to read full profile details</div>
        </div>
        <div className="p-1 bg-white rounded-lg shadow-md">
          <div ref={qrCodeRef}></div>
        </div>
      </div>

    </div>
  );
}

export default CardBack;
