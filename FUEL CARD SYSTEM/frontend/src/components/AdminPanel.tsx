import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Fuel, Lock, LogOut, CheckCircle2, AlertTriangle, User, Flame, Droplet, Users, CreditCard, Plus, Trash2, Search, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { ConfirmationModal } from './common/ConfirmationModal';

interface Receipt {
  card_id: string;
  fuel_type: 'gas' | 'oil';
  timestamp: string;
  station_location?: string;
}

export const AdminPanel: React.FC = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [adminData, setAdminData] = useState<any>(
    localStorage.getItem('admin_info') ? JSON.parse(localStorage.getItem('admin_info')!) : null
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState<'dispense' | 'admins' | 'cards'>(
    adminData?.role === 'super_admin' ? 'admins' : 'dispense'
  );

  // Fuel Dispense State
  const [cardId, setCardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Admin Management State
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newStationLocation, setNewStationLocation] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<number | null>(null);

  // Card Management State
  const [cards, setCards] = useState<any[]>([]);
  const [cardSearch, setCardSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showIssueCard, setShowIssueCard] = useState(false);
  const [newCardId, setNewCardId] = useState('');
  const [cardActionError, setCardActionError] = useState('');
  const [cardActionSuccess, setCardActionSuccess] = useState('');
  const [cardLoading, setCardLoading] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (token && adminData?.role === 'super_admin') {
      if (activeTab === 'admins') fetchAdmins();
      if (activeTab === 'cards') fetchCards(1);
    }
  }, [activeTab, token, adminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post('http://localhost:8000/api/login', { username, password });
      const newToken = res.data.token;
      const adminObj = res.data.admin;

      setToken(newToken);
      setAdminData(adminObj);
      localStorage.setItem('admin_token', newToken);
      localStorage.setItem('admin_info', JSON.stringify(adminObj));
      
      if (adminObj.role === 'super_admin') {
        setActiveTab('admins');
      } else {
        setActiveTab('dispense');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setAdminData(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    setReceipt(null);
    setErrorBanner(null);
    setActiveTab('dispense');
  };

  const processFuelDispense = async (selectedFuelType: 'gas' | 'oil') => {
    if (cardId.length !== 6) {
      setErrorBanner('Card ID must be exactly 6 digits.');
      setReceipt(null);
      return;
    }

    setLoading(true);
    setErrorBanner(null);
    setReceipt(null);

    try {
      await axios.post(
        'http://localhost:8000/api/transactions/process',
        { card_id: cardId, fuel_type: selectedFuelType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReceipt({
        card_id: cardId,
        fuel_type: selectedFuelType,
        timestamp: new Date().toLocaleString(),
        station_location: adminData?.station_location || 'Kirkuk Central Station',
      });
      setCardId('');
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        const data = err.response.data;
        const days = data.days_remaining || 7;
        let errorMessage = t('blocked_days', { days });
        if (data.available_readable) {
          errorMessage += `\n${t('available_on', { date: data.available_readable })}`;
        }
        setErrorBanner(errorMessage);
      } else {
        setErrorBanner(err.response?.data?.message || 'Error processing fuel transaction.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setAdminLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/super-admin/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    
    try {
      await axios.post('http://localhost:8000/api/super-admin/admins', {
        username: newUsername,
        password: newPassword,
        station_location: newStationLocation
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAddSuccess('Admin created successfully.');
      setShowAddForm(false);
      setNewUsername('');
      setNewPassword('');
      setNewStationLocation('');
      fetchAdmins();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Error creating admin.');
    }
  };

  const fetchCards = async (page: number, search: string = cardSearch) => {
    setCardLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/super-admin/cards?page=${page}&card_id=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data.data);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setCardLoading(false);
    }
  };

  const handleSearchCards = (e: React.FormEvent | React.ChangeEvent<HTMLInputElement>) => {
    if ('preventDefault' in e) e.preventDefault();
    fetchCards(1, cardSearch);
  };

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardActionError('');
    setCardActionSuccess('');
    
    if (newCardId.length !== 6 || !/^\d+$/.test(newCardId)) {
      setCardActionError('Card ID must be exactly 6 numeric digits.');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/super-admin/cards', {
        card_id: newCardId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCardActionSuccess('Card issued successfully.');
      setShowIssueCard(false);
      setNewCardId('');
      fetchCards(1);
    } catch (err: any) {
      setCardActionError(err.response?.data?.message || 'Error issuing card.');
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/api/super-admin/admins/${adminToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminToDelete(null);
      fetchAdmins();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Error deleting admin.');
      setAdminToDelete(null);
    }
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    setCardActionError('');
    setCardActionSuccess('');
    
    try {
      await axios.delete(`http://localhost:8000/api/super-admin/cards/${cardToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCardToDelete(null);
      fetchCards(currentPage);
      setCardActionSuccess('Card deleted successfully.');
    } catch (err: any) {
      setCardActionError(err.response?.data?.message || 'Error deleting card.');
      setCardToDelete(null);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>

        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50 z-10 relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('admin_login')}</h2>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('username')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('username')}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full ps-10 p-3.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('password')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full ps-10 p-3.5 rounded-xl bg-slate-900/70 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 font-semibold shadow-lg hover:shadow-blue-500/25 transition-all">
              {t('login')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  const isSuperAdmin = adminData?.role === 'super_admin';

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-slate-900 text-slate-100 relative">
      <div className={`w-full mx-auto ${isSuperAdmin ? 'max-w-5xl' : 'max-w-2xl'} bg-slate-800/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50 mt-12 transition-all`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 mb-6 border-b border-slate-700/60 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              {isSuperAdmin ? <ShieldCheck className="text-purple-400" size={32} /> : <Fuel className="text-blue-400" size={32} />}
              {isSuperAdmin ? t('super_admin_panel') : t('fuel_dashboard')}
            </h2>
            {adminData && (
              <p className="text-sm text-slate-400 mt-1">
                {isSuperAdmin ? 'Super Admin:' : 'Admin:'} <span className="text-slate-200 font-medium">{adminData.username}</span> 
                {!isSuperAdmin && (
                  <> | Station: <span className="text-blue-300 font-medium">{adminData.station_location}</span></>
                )}
              </p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-slate-600/50"
          >
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
        </div>

        {/* Super Admin Tabs */}
        {isSuperAdmin && (
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                activeTab === 'admins' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Users size={18} />
              {t('tab_admins')}
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                activeTab === 'cards' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <CreditCard size={18} />
              {t('tab_cards')}
            </button>
          </div>
        )}

        {/* TAB 1: DISPENSE FUEL */}
        {!isSuperAdmin && activeTab === 'dispense' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('enter_card_id')}
              </label>
              <input
                type="text"
                value={cardId}
                onChange={e => {
                  setCardId(e.target.value.replace(/\D/g, ''));
                  setErrorBanner(null);
                }}
                placeholder="e.g. 111111"
                className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xl tracking-widest text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-600"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                {t('select_fuel_prompt')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={loading || cardId.length !== 6}
                  onClick={() => processFuelDispense('gas')}
                  className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Flame size={24} />
                  <span>{t('dispense_gas')}</span>
                </button>

                <button
                  type="button"
                  disabled={loading || cardId.length !== 6}
                  onClick={() => processFuelDispense('oil')}
                  className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Droplet size={24} />
                  <span>{t('dispense_oil')}</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="mt-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={24} />
                <div>
                  <h4 className="font-semibold text-red-200">Dispensing Blocked</h4>
                  <p className="text-sm mt-0.5 text-red-300/90 whitespace-pre-line">{errorBanner}</p>
                </div>
              </div>
            )}

            {/* Success Receipt */}
            {receipt && (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-slate-100 shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-4">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={28} />
                  <div>
                    <h3 className="font-bold text-lg text-emerald-300">{t('receipt_title')}</h3>
                    <p className="text-xs text-emerald-400/80">{receipt.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">{t('receipt_card_id')}</span>
                    <span className="font-mono text-lg font-bold text-white">{receipt.card_id}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">{t('receipt_fuel_type')}</span>
                    <span className="text-lg font-bold text-emerald-400">{t(receipt.fuel_type)}</span>
                  </div>
                  <div className="col-span-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">{t('receipt_station')}</span>
                    <span className="font-medium text-slate-200">{receipt.station_location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE ADMINS */}
        {isSuperAdmin && activeTab === 'admins' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users size={20} className="text-purple-400" />
                {t('admins_list')}
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-purple-500/25"
              >
                <Plus size={16} />
                <span>{t('add_admin')}</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddAdmin} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6 space-y-4">
                {addError && (
                  <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {addError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('username')}</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('password')}</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">{t('station_location')}</label>
                    <input
                      type="text"
                      required
                      value={newStationLocation}
                      onChange={(e) => setNewStationLocation(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </form>
            )}

            {addSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-900/30 border border-emerald-800 text-emerald-300 flex items-center gap-3">
                <CheckCircle2 size={20} />
                {addSuccess}
              </div>
            )}
            
            <div className="overflow-x-auto bg-slate-900/50 rounded-xl border border-slate-700">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">{t('username')}</th>
                    <th className="px-6 py-4 font-medium">{t('station_location')}</th>
                    <th className="px-6 py-4 font-medium text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {adminLoading ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center">Loading...</td></tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        No station admins found.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{admin.username}</td>
                        <td className="px-6 py-4">{admin.station_location}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setAdminToDelete(admin.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title={t('delete_admin')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CARD MANAGEMENT */}
        {isSuperAdmin && activeTab === 'cards' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <form onSubmit={handleSearchCards} className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t('search_card')}
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  className="w-full ps-10 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </form>
              <button
                onClick={() => setShowIssueCard(!showIssueCard)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-blue-500/25 shrink-0"
              >
                <Plus size={16} />
                <span>{t('issue_new_card')}</span>
              </button>
            </div>

            {showIssueCard && (
              <form onSubmit={handleIssueCard} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6 space-y-4">
                {cardActionError && (
                  <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {cardActionError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">{t('enter_card_number_placeholder')}</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newCardId}
                    onChange={(e) => setNewCardId(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    className="w-full max-w-xs p-3 rounded-lg bg-slate-800 border border-slate-600 text-white text-lg tracking-widest text-center"
                  />
                </div>
                <div className="flex justify-start gap-3 mt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-lg hover:shadow-emerald-500/20"
                  >
                    {t('issue')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIssueCard(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            )}

            {cardActionSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-900/30 border border-emerald-800 text-emerald-300 flex items-center gap-3">
                <CheckCircle2 size={20} />
                {cardActionSuccess}
              </div>
            )}
            
            <div className="overflow-x-auto bg-slate-900/50 rounded-xl border border-slate-700">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">{t('card_id')}</th>
                    <th className="px-6 py-4 font-medium">{t('created_at')}</th>
                    <th className="px-6 py-4 font-medium">{t('status')}</th>
                    <th className="px-6 py-4 font-medium text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {cardLoading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center">Loading...</td></tr>
                  ) : cards.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No cards found.
                      </td>
                    </tr>
                  ) : (
                    cards.map((card) => {
                      const isNeverUsed = !card.last_used_date;
                      const isBlocked = card.status && !card.status.eligible;
                      
                      return (
                        <tr key={card.card_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-white text-base">{card.card_id}</td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {new Date(card.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {isNeverUsed ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                                {t('status_never_used')}
                              </span>
                            ) : isBlocked ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/50 text-amber-400 border border-amber-700/50">
                                {t('blocked_days', { days: card.status.days_remaining })}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-400 border border-emerald-700/50">
                                {t('status_eligible')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setCardToDelete(card.card_id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title={t('actions')}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
                  <span className="text-xs text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1 || cardLoading}
                      onClick={() => fetchCards(currentPage - 1)}
                      className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft size={16} className="rtl:rotate-180" />
                    </button>
                    <button
                      disabled={currentPage === totalPages || cardLoading}
                      onClick={() => fetchCards(currentPage + 1)}
                      className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight size={16} className="rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={adminToDelete !== null}
        title={t('confirm_deletion')}
        message={t('confirm_delete_admin_message')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        isDestructive={true}
        onConfirm={confirmDeleteAdmin}
        onCancel={() => setAdminToDelete(null)}
      />

      <ConfirmationModal
        isOpen={cardToDelete !== null}
        title={t('confirm_deletion')}
        message={t('confirm_delete_card_message')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        isDestructive={true}
        onConfirm={confirmDeleteCard}
        onCancel={() => setCardToDelete(null)}
      />
    </div>
  );
};
