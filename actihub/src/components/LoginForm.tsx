import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bento-card p-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-slate-900 border-2 border-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#7c51a1]">
          <LogIn className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">เข้าระบบเจ้าหน้าที่</h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 px-4 py-1 bg-slate-100 rounded-full inline-block">Secure Protocol Active</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">อีเมล์</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold placeholder:text-slate-300"
            placeholder="officer@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold placeholder:text-slate-300"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-900 text-red-900 text-xs font-black uppercase tracking-wider flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-bento w-full py-4 text-lg shadow-[6px_6px_0px_0px_#7c51a1]"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              เข้าระบบ
            </>
          )}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t-2 border-slate-50 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Auth Service Powered by Supabase Cloud
        </p>
      </div>
    </div>
  );
}
