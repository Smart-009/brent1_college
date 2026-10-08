import React, { useState } from 'react';
import { AlertOctagon, X, Zap } from 'lucide-react';
import { api } from '../api/client';

interface PanicButtonProps {
  onSuccess: () => void;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ onSuccess }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmergencyHalt = async () => {
    setLoading(true);
    try {
      await api.closeAllEmergency();
      setModalOpen(false);
      onSuccess();
    } catch (err: any) {
      alert(`Emergency halt failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Panic Trigger */}
      <div className="fixed bottom-16 right-3.5 z-30">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#f6465d]/90 hover:bg-[#f6465d] text-white font-black text-[11px] shadow-2xl shadow-[#f6465d]/40 border border-[#f6465d]/50 backdrop-blur-xl active:scale-95 transition-all"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="tracking-wider">CLOSE ALL</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#0b0f19] border border-[#f6465d]/30 p-5 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#848e9c] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-11 h-11 rounded-xl bg-[#f6465d]/15 border border-[#f6465d]/30 flex items-center justify-center text-[#f6465d] mb-3.5">
              <AlertOctagon className="w-5 h-5" />
            </div>

            <h3 className="text-base font-black text-white mb-1">Emergency Panic Liquidation</h3>
            <p className="text-xs text-[#848e9c] mb-4 leading-relaxed">
              Sends immediate market orders to close <strong className="text-[#f6465d]">100% of open positions</strong> across all connected MT5 broker servers, bank your cash into realized balance, and lock safe pause.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#121824] text-[#848e9c] font-bold text-xs hover:bg-[#182030] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmergencyHalt}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#f6465d] hover:bg-[#ff536a] text-white font-black text-xs shadow-lg shadow-[#f6465d]/40 transition disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95"
              >
                {loading ? 'Executing...' : 'Confirm Liquidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
