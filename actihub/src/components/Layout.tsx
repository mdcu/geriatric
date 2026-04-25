import React from 'react';
import { LogIn, LogOut, Users, Settings, Activity as ActivityIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  view: 'guest' | 'officer';
  setView: (view: 'guest' | 'officer') => void;
  user: any;
  onLogout: () => void;
}

export function Layout({ children, view, setView, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <header className="sticky top-0 z-40 w-full border-b-2 border-slate-900 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setView('guest')}
          >
            <div className="w-10 h-10 bg-indigo-600 border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#0f172a] text-white">
              <ActivityIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              ชวนมาจอย<span className="text-indigo-600"> ไม่คอยเหงา</span>
            </h1>
          </div>

          <nav className="flex items-center gap-4">
            <div className="hidden sm:flex bg-slate-200 p-1 rounded-xl border-2 border-slate-900">
              <button
                onClick={() => setView('guest')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  view === 'guest' 
                    ? 'bg-white shadow-sm ring-1 ring-slate-900/5' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                สำหรับผู้สูงวัย
              </button>
              <button
                onClick={() => setView('officer')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  view === 'officer' 
                    ? 'bg-white shadow-sm ring-1 ring-slate-900/5' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                สำหรับเจ้าหน้าที่
              </button>
            </div>
            
            {user && view === 'officer' && (
              <button
                onClick={onLogout}
                className="btn-bento-outline !p-2 rounded-xl"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t bg-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 ActiHub Activity Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
