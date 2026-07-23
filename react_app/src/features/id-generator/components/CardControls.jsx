import React from 'react';
import Button from '../../../components/common/Button';

export function CardControls({
  saving,
  saveStatus,
  onDownloadPng,
  onPrintCard,
  onSaveToDatabase
}) {
  return (
    <div className="space-y-3">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={onDownloadPng}>
            📥 Download PNG Card
          </Button>
          <Button variant="secondary" onClick={onPrintCard}>
            🖨️ Print Badge
          </Button>
        </div>

        <Button
          variant="success"
          onClick={onSaveToDatabase}
          disabled={saving}
        >
          {saving ? 'Saving Profile...' : '💾 Save Profile to DB'}
        </Button>
      </div>

      {saveStatus && (
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-emerald-400 font-medium">
          {saveStatus}
        </div>
      )}
    </div>
  );
}

export default CardControls;
