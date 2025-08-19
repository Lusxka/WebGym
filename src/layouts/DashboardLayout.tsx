import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/Button';
import WelcomeWizard from '../pages/WelcomeWizard'; // <- default import
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export const DashboardLayout: React.FC = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkProfile() {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      const localKey = `wg_wizard_done_${user.id}`;
      if (localStorage.getItem(localKey) === '1') {
        if (!cancelled) {
          dispatch({ type: 'SHOW_WIZARD', payload: false });
          setCheckingProfile(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Erro ao checar perfil:', error);
        dispatch({ type: 'SHOW_WIZARD', payload: true });
      } else {
        const exists = !!data;
        dispatch({ type: 'SHOW_WIZARD', payload: !exists });
        if (exists) localStorage.setItem(localKey, '1');
      }

      setCheckingProfile(false);
    }

    checkProfile();
    return () => { cancelled = true; };
  }, [user?.id, dispatch]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar
        activeTab={'dashboard'}
        onTabChange={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6 text-white" />
              </Button>
              <h1 className="text-2xl font-bold text-white">WebGym</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {!checkingProfile && state.showWizard && <WelcomeWizard />}
    </div>
  );
};
