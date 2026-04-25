import React, { useState } from 'react';
import { supabase, type Activity } from '../lib/supabase';
import { X, User, Phone, Fingerprint, Loader2, Send, CheckCircle2, Activity as ActivityIcon } from 'lucide-react';

interface RegistrationFormProps {
  activity: Activity;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrationForm({ activity, onClose, onSuccess }: RegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hn: '',
    tel: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Double check capacity
    const { count, error: countError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activity.id);

    if (countError || (count !== null && count >= activity.capacity)) {
      alert('Sorry, this activity is now full.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('registrations')
      .insert([{
        ...formData,
        activity_id: activity.id
      }]);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white p-10 bento-card border-slate-900 shadow-[10px_10px_0px_0px_#16a34a] flex flex-col items-center gap-6 text-center animate-in zoom-in fade-in duration-300">
          <div className="w-20 h-20 bg-green-100 border-4 border-green-600 rounded-2xl flex items-center justify-center text-green-600 shadow-[4px_4px_0px_0px_#16a34a]">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">ลงชื่อสำเร็จ!</h2>
            <p className="text-slate-500 font-bold">เราเตรียมที่นั่งไว้ให้คุณแล้วในกิจกรรม <span className="text-indigo-600 font-black">{activity.title}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bento-card border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b-4 border-slate-900 flex items-center justify-between bg-indigo-600 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-100">Live Registration</p>
            </div>
            <h2 className="text-3xl font-black tracking-tighter italic leading-none">ลงชื่อกิจกรรม</h2>
            <p className="text-indigo-100/80 text-xs font-bold mt-1 flex items-center gap-1">
               <ActivityIcon className="w-3 h-3" /> {activity.title}
            </p>
          </div>
          <button onClick={onClose} className="p-1 border-2 border-white/20 rounded-lg hover:bg-white/10 transition-colors self-start">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ชื่อ-นามสกุล</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-900" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200"
                  placeholder="ชื่อ-นามสกุลของคุณ"
                />
              </div>
              <p className="text-[9px] font-black text-indigo-600/60 uppercase tracking-wider mt-1">Privacy Guard: แสดงเพียงชื่อในที่สาธารณะ</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">เลขที่โรงพยาบาล (HN)</label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-3 w-4 h-4 text-slate-900" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={formData.hn}
                  onChange={(e) => setFormData({ ...formData, hn: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200"
                  placeholder="กรอกตัวเลขตัวเลขเท่านั้น"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">เบอร์ติดต่อกลับ</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-900" />
                <input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  required
                  value={formData.tel}
                  onChange={(e) => setFormData({ ...formData, tel: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_#7c51a1] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                ยืนยัน
              </>
            )}
          </button>

          <p className="text-center text-[9px] font-bold text-slate-300 px-4 leading-tight">
            SYSTEM DISCLOSURE: การกดยืนยันแสดงว่าคุณพร้อมสำหรับกิจกรรมครั้งนี้
          </p>
        </form>
      </div>
    </div>
  );
}
