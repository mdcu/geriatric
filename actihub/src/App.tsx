/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, type Activity } from './lib/supabase';
import { OfficerDashboard } from './components/OfficerDashboard';
import { GuestView } from './components/GuestView';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'guest' | 'officer'>('guest');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <Layout 
      view={view} 
      setView={setView} 
      user={user} 
      onLogout={() => supabase.auth.signOut()}
    >
      {view === 'guest' ? (
        <GuestView />
      ) : user ? (
        <OfficerDashboard />
      ) : (
        <LoginForm />
      )}
    </Layout>
  );
}
