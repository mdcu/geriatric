import React, { useState, useEffect } from 'react';
import { supabase, type Activity, type Registration } from '../lib/supabase';
import { Plus, Edit2, Trash2, Users, Calendar, MapPin, Clock, Loader2, X, Activity as ActivityIcon } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { ActivityForm } from './ActivityForm';
import { GuestList } from './GuestList';

export function OfficerDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingGuestsId, setViewingGuestsId] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });
    
    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (!error) {
        setActivities(activities.filter(a => a.id !== id));
      } else {
        alert('ไม่สามารถลบได้: ' + error.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-0">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">จัดการกิจกรรม</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">กระดานกิจกรรม</h1>
        </div>
        <button
          onClick={() => {
            setEditingActivity(null);
            setShowForm(true);
          }}
          className="btn-bento shadow-[4px_4px_0px_0px_#7c51a1] py-2 px-6"
        >
          <Plus className="w-5 h-5" />
          กิจกรรมใหม่!
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="bento-card group overflow-hidden"
          >
            <div className="p-5 md:flex items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="text-xl font-black text-slate-900 leading-none">{activity.title}</h3>
                  <div className="flex gap-1.5">
                    {activity.tags?.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded border border-indigo-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="status-badge bg-slate-900 text-white border-slate-900 py-0 px-2 ml-auto md:ml-0">
                    {activity.capacity} จำกัด
                  </span>
                </div>
                
                <p className="text-slate-600 font-bold text-base leading-snug line-clamp-2 max-w-2xl">{activity.description}</p>
                
                <div className="flex flex-wrap gap-4 text-[14px] font-bold text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {formatDate(activity.date)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {activity.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    {activity.place}
                  </div>
                </div>
              </div>

                  <div className="mt-4 md:mt-0 flex items-center gap-3 border-t-2 border-slate-50 pt-4 md:border-0 md:pt-0">
                <button
                  type="button"
                  onClick={() => setViewingGuestsId(activity.id)}
                  className="btn-bento-outline flex-1 md:flex-none py-1.5 px-4 text-xs"
                >
                  <Users className="w-4 h-4" />
                  รายชื่อ
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingActivity(activity);
                      setShowForm(true);
                    }}
                    className="p-2 bg-slate-100 border-2 border-slate-900 rounded-xl text-slate-900 hover:bg-white transition-all shadow-[2px_2px_0px_0px_#0f172a] relative z-10"
                    title="เปลี่ยนข้อมูล"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  {deletingId === activity.id ? (
                    <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(activity.id);
                        }}
                        className="px-3 py-2 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl border-2 border-red-900 shadow-[2px_2px_0px_0px_#7f1d1d]"
                      >
                        ยืนยันลบ?
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="p-2 bg-slate-100 border-2 border-slate-900 rounded-xl text-slate-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(activity.id);
                      }}
                      className="p-2 bg-red-50 border-2 border-red-900 rounded-xl text-red-900 hover:bg-white transition-all shadow-[2px_2px_0px_0px_#7f1d1d] relative z-10 cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
            <ActivityIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-400">Inventory Empty</h3>
            <p className="text-slate-400 font-bold mt-2">ยังไม่มีกิจกรรมที่สร้างไว้</p>
          </div>
        )}
      </div>

      {showForm && (
        <ActivityForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchActivities();
          }}
          initialData={editingActivity}
        />
      )}

      {viewingGuestsId && (
        <GuestList 
          activityId={viewingGuestsId} 
          activityTitle={activities.find(a => a.id === viewingGuestsId)?.title ?? ''}
          onClose={() => setViewingGuestsId(null)} 
        />
      )}
    </div>
  );
}
