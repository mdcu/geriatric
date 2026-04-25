import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, User, Loader2 } from 'lucide-react';
import { maskThaiName } from '../lib/utils';

interface GuestPublicListProps {
  activityId: string;
  activityTitle: string;
  onClose: () => void;
}

export function GuestPublicList({ activityId, activityTitle, onClose }: GuestPublicListProps) {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicGuests = async () => {
      setLoading(true);
      // Only select names for public view (Privacy first)
      const { data, error } = await supabase
        .from('registrations')
        .select('name')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setNames(data.map(d => d.name));
      }
      setLoading(false);
    };

    fetchPublicGuests();
  }, [activityId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg bento-card border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden flex flex-col h-full max-h-[70vh] animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-8 border-b-4 border-slate-900 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">รายชื่อผู้เข้าร่วม</h2>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-2">เปิดรับสมัคร: {activityTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
            <X className="w-6 h-6 text-slate-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">กำลังดึงข้อมูล...</p>
            </div>
          ) : names.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center gap-6">
              <div className="w-24 h-24 bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl flex items-center justify-center">
                <User className="w-12 h-12 opacity-10 mx-auto" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-500">ยังไม่มีผู้ลงทะเบียน</p>
                <p className="text-sm font-medium">มาเป็นคนแรกที่เข้าร่วมกิจกรรมนี้กัน!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {names.map((name, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a]"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black italic">
                    {idx + 1}
                  </div>
                  <span className="font-black text-slate-900 tracking-tight text-sm uppercase">{maskThaiName(name)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t-4 border-slate-900 bg-slate-50">
          <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-[0.2em]">
            แสดงเพียงชื่อเพื่อความเป็นส่วนตัว
          </p>
        </div>
      </div>
    </div>
  );
}
