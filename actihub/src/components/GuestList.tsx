import React, { useState, useEffect } from 'react';
import { supabase, type Registration } from '../lib/supabase';
import { X, Trash2, Loader2, Phone, Fingerprint, User } from 'lucide-react';

interface GuestListProps {
  activityId: string;
  activityTitle: string;
  onClose: () => void;
}

export function GuestList({ activityId, activityTitle, onClose }: GuestListProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setRegistrations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, [activityId]);

  const removeGuest = async (id: string) => {
    if (!id) {
      console.error('Missing guest ID');
      return;
    }
    
    try {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        alert('ไม่สามารถลบรายชื่อได้: ' + error.message);
        return;
      }
      
      setRegistrations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Unexpected delete error:', err);
      alert('เกิดข้อผิดพลาดไม่คาดคิดในการลบรายชื่อ');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl bento-card shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden flex flex-col h-full max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b-4 border-slate-900 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">รายชื่อผู้เข้าร่วม</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">กิจกรรม: {activityTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 border-2 border-slate-900 rounded-lg hover:bg-white transition-colors">
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">กำลังดึงข้อมูล...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-50 border-4 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-200">
                <User className="w-10 h-10" />
              </div>
              <p className="font-bold">ยังไม่มีผู้ลงทะเบียน</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registrations.map((guest, idx) => (
                <div 
                  key={guest.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] group"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center font-black text-sm">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">ชื่อ</p>
                        <span className="font-black text-base text-slate-900 tracking-tight leading-none block truncate">{guest.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Fingerprint className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">HN</p>
                        <span className="text-sm font-bold text-slate-600 block">{guest.hn}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">เบอร์ติดต่อ</p>
                        <span className="text-sm font-bold text-slate-600 block">{guest.tel}</span>
                      </div>
                    </div>
                  </div>

                  {deletingId === guest.id ? (
                    <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGuest(guest.id);
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white font-black text-[10px] uppercase rounded-lg border-2 border-red-900 shadow-[2px_2px_0px_0px_#7f1d1d]"
                      >
                        ลบ?
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="p-1.5 bg-slate-100 border-2 border-slate-900 rounded-lg text-slate-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(guest.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2 shrink-0 relative z-20 cursor-pointer"
                      title="ลบรายชื่อ"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t-4 border-slate-900 bg-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Log</p>
          <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-sm font-black italic">
            {registrations.length} คน
          </div>
        </div>
      </div>
    </div>
  );
}
