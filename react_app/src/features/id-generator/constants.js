// Preset constants & default state data for ID Card feature module

export const DEFAULT_CHILD_DATA = {
  fullName: "Aarav Sharma",
  age: "9 Years",
  dob: "2017-05-14",
  gender: "Male",
  bloodGroup: "O+",
  mobile: "+91 98765 43210",
  emergencyMobile: "+91 91234 56789",
  address: "Plot 42, Silicon Heights, Gachibowli, Hyderabad, TS 500032",
  idCode: "CG-KID-849201",
  guardianName: "Rajesh Sharma",
  guardianRelation: "Father",
  schoolName: "Delhi Public School, Block B",
  grade: "Class 4-B",
  allergiesMedical: "Mild Asthma (Carries Inhaler), Severe Peanut Allergy",
  verificationStatus: "PROTECTED CHILD"
};

export const DEFAULT_PARENT_DATA = {
  fullName: "Rajesh Sharma",
  age: "38 Years",
  dob: "1988-08-22",
  gender: "Male",
  bloodGroup: "B+",
  mobile: "+91 98765 43210",
  emergencyMobile: "+91 94400 11223",
  address: "Plot 42, Silicon Heights, Gachibowli, Hyderabad, TS 500032",
  idCode: "CG-PRN-991823",
  occupation: "Senior Cloud Architect",
  aadhaarRef: "XXXX-XXXX-8921",
  childrenNames: "Aarav Sharma, Ananya Sharma",
  emergencyContactPerson: "Priya Sharma (Wife)",
  allergiesMedical: "No Known Medical Allergies",
  verificationStatus: "VERIFIED GUARDIAN"
};

export const PRESET_AVATARS = [
  { id: 'boy', label: 'Child Boy', url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=300&auto=format&fit=crop&q=80' },
  { id: 'girl', label: 'Child Girl', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
  { id: 'father', label: 'Parent Father', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'mother', label: 'Parent Mother', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' }
];

export const THEME_PALETTES = {
  violet: {
    bg: 'bg-gradient-to-br from-violet-950 via-slate-900 to-fuchsia-950 border-violet-500/40 shadow-violet-500/20',
    badge: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white',
    accent: 'text-violet-400',
    border: 'border-violet-500/30'
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-cyan-500/40 shadow-cyan-500/20',
    badge: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/30'
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/40 shadow-emerald-500/20',
    badge: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  gold: {
    bg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 border-amber-500/40 shadow-amber-500/20',
    badge: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    accent: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  obsidian: {
    bg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-900 border-slate-700 shadow-slate-900/40',
    badge: 'bg-gradient-to-r from-slate-700 to-zinc-800 text-slate-200 border border-slate-600',
    accent: 'text-slate-300',
    border: 'border-slate-700'
  }
};
