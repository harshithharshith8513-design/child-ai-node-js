import React from 'react';
import Card from '../../../components/common/Card';

export function RegistrationForm({
  mode,
  formData,
  theme,
  onModeToggle,
  onInputChange,
  onGenerateIdCode,
  onThemeChange,
  onFileUpload
}) {
  return (
    <Card className="space-y-6">
      
      {/* Mode Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Register {mode === 'child' ? 'Child' : 'Parent'} Profile
          </h2>
          <p className="text-xs text-slate-400">
            Updates live in the digital card preview on every input <code className="text-violet-400">onChange</code>
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onModeToggle('child')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'child'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👶 Child Profile
          </button>
          <button
            type="button"
            onClick={() => onModeToggle('parent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'parent'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Parent / Guardian
          </button>
        </div>
      </div>

      {/* Form Controls */}
      <form className="space-y-4 text-xs" onSubmit={(e) => e.preventDefault()}>
        
        {/* Full Name & Age Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {mode === 'child' ? 'Child Full Name *' : 'Parent Full Name *'}
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Enter full name..."
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Age / Date of Birth *</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={onInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="e.g. 9 Years or 2017-05-14"
            />
          </div>
        </div>

        {/* Primary Phone & Emergency Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Primary Mobile Number *</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={onInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="+91 Mobile number"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Emergency ICE Phone *</label>
            <input
              type="text"
              name="emergencyMobile"
              value={formData.emergencyMobile}
              onChange={onInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="Secondary emergency contact"
            />
          </div>
        </div>

        {/* Blood Group & Shield Tag ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Blood Group *</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={onInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-300 font-semibold">Shield ID Tag #</label>
              <button
                type="button"
                onClick={onGenerateIdCode}
                className="text-[10px] text-violet-400 hover:underline"
              >
                Auto-Generate
              </button>
            </div>
            <input
              type="text"
              name="idCode"
              value={formData.idCode}
              onChange={onInputChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Conditional Fields based on Child or Parent mode */}
        {mode === 'child' ? (
          <React.Fragment>
            <div className="border-t border-slate-800 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Name of parent or guardian"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Relationship *</label>
                <select
                  name="guardianRelation"
                  value={formData.guardianRelation || 'Father'}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                  <option value="Relative">Relative</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">School Name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="School / Academy"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Grade / Class</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Grade or section"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Medical Conditions & Allergies (Emergency Box)</label>
              <textarea
                name="allergiesMedical"
                rows="2"
                value={formData.allergiesMedical || ''}
                onChange={onInputChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="List any medical notes, asthma, allergies, or emergency instructions..."
              ></textarea>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="border-t border-slate-800 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Profession / Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. Senior Software Architect"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Govt ID / Aadhaar Reference</label>
                <input
                  type="text"
                  name="aadhaarRef"
                  value={formData.aadhaarRef || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="XXXX-XXXX-1234"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Dependent Children Names</label>
                <input
                  type="text"
                  name="childrenNames"
                  value={formData.childrenNames || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. Aarav, Ananya"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Spouse / Secondary Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContactPerson"
                  value={formData.emergencyContactPerson || ''}
                  onChange={onInputChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. Priya Sharma (Wife)"
                />
              </div>
            </div>
          </React.Fragment>
        )}

        {/* Address Field */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Residential Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={onInputChange}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="Full home residential address..."
          />
        </div>

        {/* Customization Options */}
        <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Card Theme Palette</label>
            <div className="flex gap-2">
              {[
                { id: 'violet', bg: 'bg-violet-600', label: 'Violet' },
                { id: 'cyan', bg: 'bg-cyan-500', label: 'Cyan' },
                { id: 'emerald', bg: 'bg-emerald-500', label: 'Emerald' },
                { id: 'gold', bg: 'bg-amber-500', label: 'Gold' },
                { id: 'obsidian', bg: 'bg-slate-700', label: 'Obsidian' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onThemeChange(t.id)}
                  className={`h-7 w-7 rounded-full ${t.bg} border-2 ${
                    theme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                  } transition`}
                  title={t.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Upload Profile Photo</label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold">
              📁 Choose Photo File
              <input type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
            </label>
          </div>
        </div>

      </form>

    </Card>
  );
}

export default RegistrationForm;
