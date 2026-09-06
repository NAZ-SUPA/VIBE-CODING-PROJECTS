import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { UserPanel } from './components/UserPanel';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const { t, i18n } = useTranslation();

  // RTL Engine logic
  useEffect(() => {
    const dir = i18n.language === 'ar' || i18n.language === 'ku' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
        <LanguageSwitcher />
        
        {/* Navigation for demo purposes */}
        <nav className="absolute top-4 left-4 rtl:right-4 rtl:left-auto z-50 flex gap-4 text-sm font-medium">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">{t('user_panel')}</Link>
          <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">{t('admin_panel')}</Link>
        </nav>

        <Routes>
          <Route path="/" element={<UserPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
