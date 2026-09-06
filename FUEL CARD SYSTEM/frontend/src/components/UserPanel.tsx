import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Search, CheckCircle, XCircle } from 'lucide-react';

export const UserPanel: React.FC = () => {
  const { t } = useTranslation();
  const [cardId, setCardId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardId.length !== 6) {
      setError('Card ID must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    setStatus(null);

    try {
      const response = await axios.get(`http://localhost:8000/api/cards/${cardId}/status`);
      setStatus(response.data);
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 403) {
          setStatus(err.response.data);
        } else if (err.response.status === 404) {
          setError('Card not found.');
        } else {
          setError('Server error occurred.');
        }
      } else {
        setError('Network error. Could not connect to the backend API.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 transform transition-all hover:scale-[1.01]">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-8 text-center">
          {t('app_title')}
        </h1>

        <form onSubmit={checkStatus} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 text-slate-100 text-lg rounded-xl block w-full ps-12 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
              placeholder={t('enter_card_id')}
              maxLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-xl text-lg px-5 py-4 text-center transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? '...' : t('submit')}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3">
            <XCircle className="shrink-0" size={20} />
            <p>{error}</p>
          </div>
        )}

        {status && (
          <div className={`mt-6 p-5 rounded-xl border flex items-start gap-4 transition-all ${status.eligible ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-amber-900/20 border-amber-900/50'}`}>
            {status.eligible ? (
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={24} />
            ) : (
              <XCircle className="text-amber-400 shrink-0 mt-0.5" size={24} />
            )}
            <div>
              <h3 className={`font-semibold text-lg ${status.eligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                {status.eligible ? t('status_eligible') : t('blocked_days', { days: status.days_remaining })}
              </h3>
              {!status.eligible && status.available_readable && (
                <p className="text-slate-300 mt-1 font-medium bg-slate-900/50 p-2 rounded-lg text-sm border border-slate-700">
                  {t('available_on', { date: status.available_readable })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
