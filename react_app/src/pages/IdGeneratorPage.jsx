import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { RegistrationForm } from '../features/id-generator/components/RegistrationForm';
import { CardFront } from '../features/id-generator/components/CardFront';
import { CardBack } from '../features/id-generator/components/CardBack';
import { CardControls } from '../features/id-generator/components/CardControls';
import {
  DEFAULT_CHILD_DATA,
  DEFAULT_PARENT_DATA,
  PRESET_AVATARS,
  THEME_PALETTES
} from '../features/id-generator/constants';
import idCardService from '../features/id-generator/idCardService';
import { generateIdTag } from '../utils/formatters';

export function IdGeneratorPage() {
  const [mode, setMode] = useState('child');
  const [formData, setFormData] = useState(DEFAULT_CHILD_DATA);
  const [isFlipped, setIsFlipped] = useState(false);
  const [theme, setTheme] = useState('violet');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const qrCodeRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleModeToggle = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'child') {
      setFormData(DEFAULT_CHILD_DATA);
      setAvatarUrl(PRESET_AVATARS[0].url);
    } else {
      setFormData(DEFAULT_PARENT_DATA);
      setAvatarUrl(PRESET_AVATARS[2].url);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatarUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateNewIdCode = () => {
    const prefix = mode === 'child' ? 'CG-KID-' : 'CG-PRN-';
    setFormData(prev => ({ ...prev, idCode: generateIdTag(prefix) }));
  };

  // QR code generator
  useEffect(() => {
    if (qrCodeRef.current && window.QRCode) {
      qrCodeRef.current.innerHTML = '';
      const qrPayload = JSON.stringify({
        id: formData.idCode,
        mode,
        name: formData.fullName,
        blood: formData.bloodGroup,
        phone: formData.mobile,
        emergency: formData.emergencyMobile
      });

      new window.QRCode(qrCodeRef.current, {
        text: qrPayload,
        width: 76,
        height: 76,
        colorDark: "#ffffff",
        colorLight: "#000000",
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }
  }, [formData, mode, isFlipped]);

  const handleDownloadPng = () => {
    const cardElement = document.getElementById('digital-id-card-render');
    if (!cardElement || !window.html2canvas) return;

    window.html2canvas(cardElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: null
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `${(formData.fullName || 'card').replace(/\s+/g, '_')}_ID_Badge.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handlePrintCard = () => {
    window.print();
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      await idCardService.saveCardProfile(mode, { ...formData, avatarUrl, theme });
      setSaveStatus('✅ Profile card successfully saved to database!');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err) {
      setSaveStatus('❌ Save failed: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const currentPalette = THEME_PALETTES[theme] || THEME_PALETTES.violet;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge variant="info" className="mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Real-Time Cyber Safety ID Badge Studio
          </Badge>
          <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
            Register Child & Parent <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">ID Protector Card</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Fill in the details below. As you type, every field dynamically updates on the digital card preview on the right via React architecture state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            React Architecture Active
          </Badge>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-6">
          <RegistrationForm
            mode={mode}
            formData={formData}
            theme={theme}
            onModeToggle={handleModeToggle}
            onInputChange={handleInputChange}
            onGenerateIdCode={handleGenerateNewIdCode}
            onThemeChange={setTheme}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Digital ID Card Preview</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live State Sync
              </span>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Flip ({isFlipped ? 'Back Side' : 'Front Side'})
            </Button>
          </div>

          <div className="card-perspective w-full max-w-md mx-auto">
            <div className={`card-inner relative w-full ${isFlipped ? 'card-flipped' : ''}`}>
              <CardFront
                mode={mode}
                formData={formData}
                avatarUrl={avatarUrl}
                currentPalette={currentPalette}
              />
              <CardBack
                formData={formData}
                qrCodeRef={qrCodeRef}
              />
            </div>
          </div>

          <CardControls
            saving={saving}
            saveStatus={saveStatus}
            onDownloadPng={handleDownloadPng}
            onPrintCard={handlePrintCard}
            onSaveToDatabase={handleSaveToDatabase}
          />
        </div>

      </div>

    </div>
  );
}

export default IdGeneratorPage;
