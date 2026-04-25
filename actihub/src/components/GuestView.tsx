import React, { useState, useEffect, useMemo } from 'react';
import { supabase, type Activity } from '../lib/supabase';
import { Calendar, MapPin, Clock, Loader2, Info, Filter, Tag as TagIcon, X } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { RegistrationForm } from './RegistrationForm';
import { GuestPublicList } from './GuestPublicList';

const DAYS_OF_WEEK = [
  { id: '1', name: 'จันทร์' },
  { id: '2', name: 'อังคาร' },
  { id: '3', name: 'พุธ' },
  { id: '4', name: 'พฤหัสบดี' },
  { id: '5', name: 'ศุกร์' },
  { id: '6', name: 'เสาร์' },
  { id: '0', name: 'อาทิตย์' },
];

const PERIODS = [
  { id: 'morning', name: 'ช่วงเช้า' },
  { id: 'afternoon', name: 'ช่วงบ่าย' },
];

export function GuestView() {
  const [activities, setActivities] = useState<(Activity & { registrationCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeringActivityId, setRegisteringActivityId] = useState<string | null>(null);
  const [viewingGuestsId, setViewingGuestsId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [withinMonth, setWithinMonth] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  const fetchActivitiesWithCounts = async () => {
    setLoading(true);
    const { data: acts, error: actsError } = await supabase
      .from('activities')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (actsError) return;

    const { data: counts, error: countsError } = await supabase
      .from('registrations')
      .select('activity_id');
    
    if (countsError) return;

    const countMap = counts.reduce((acc: any, curr: any) => {
      acc[curr.activity_id] = (acc[curr.activity_id] || 0) + 1;
      return acc;
    }, {});

    const enriched = acts.map(a => ({
      ...a,
      registrationCount: countMap[a.id] || 0
    }));

    setActivities(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivitiesWithCounts();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    activities.forEach(a => {
      if (a.tags) a.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Tag Filter
      if (selectedTag && (!activity.tags || !activity.tags.includes(selectedTag))) {
        return false;
      }

      // Date Range Filter (Within 1 Month)
      if (withinMonth) {
        const activityDate = new Date(activity.date);
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        if (activityDate > oneMonthFromNow) return false;
      }

      // Day of Week Filter
      if (selectedDays.length > 0) {
        const dayOfWeek = new Date(activity.date).getDay().toString();
        if (!selectedDays.includes(dayOfWeek)) return false;
      }

      // Period Filter
      if (selectedPeriods.length > 0) {
        const hour = parseInt(activity.time.split(':')[0]);
        const period = hour < 12 ? 'morning' : 'afternoon';
        if (!selectedPeriods.includes(period)) return false;
      }

      return true;
    });
  }, [activities, selectedTag, withinMonth, selectedDays, selectedPeriods]);

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const togglePeriod = (periodId: string) => {
    setSelectedPeriods(prev => 
      prev.includes(periodId) ? prev.filter(p => p !== periodId) : [...prev, periodId]
    );
  };

  const resetFilters = () => {
    setSelectedTag(null);
    setWithinMonth(false);
    setSelectedDays([]);
    setSelectedPeriods([]);
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500">Discovering upcoming activities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 pt-12 pb-6 bento-card border-none shadow-none bg-transparent">
        <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 border-2 border-indigo-700 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4">
          ใจร่ม ๆ 5G ช้า...
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
          ชวนมาจอย<span className="text-indigo-600"> ไม่คอยเหงา</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-xl font-medium tracking-tight">
          มาสนุกด้วยกันนะ! เลือกกิจกรรมที่คุณสนใจ แล้วมาเป็นส่วนหนึ่งของครอบครัวเรา
        </p>
      </section>

      {/* Filter Bar */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-slate-900 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-black text-sm tracking-tight transition-all border-2",
                !selectedTag 
                  ? "bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_0px_#7c51a1]" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              ดูทุกกิจกรรม
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-black text-sm tracking-tight transition-all border-2 flex items-center gap-2",
                  selectedTag === tag
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-[4px_4px_0px_0px_#0f172a]"
                    : "bg-white text-indigo-600 border-indigo-100 hover:border-indigo-300"
                )}
              >
                <TagIcon className="w-3.5 h-3.5" />
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-5 py-2.5 rounded-xl font-black text-sm tracking-tight transition-all border-2 flex items-center gap-2",
              showFilters || selectedDays.length > 0 || selectedPeriods.length > 0 || withinMonth
                ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
            )}
          >
            <Filter className="w-4 h-4" />
            ตัวกรอง { (selectedDays.length + selectedPeriods.length + (withinMonth ? 1 : 0)) > 0 && `(${selectedDays.length + selectedPeriods.length + (withinMonth ? 1 : 0)})` }
          </button>
        </div>

        {/* Detailed Filters Panel */}
        {showFilters && (
          <div className="bento-card p-8 bg-indigo-50/50 border-indigo-200 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> ระยะเวลา
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWithinMonth(false)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 font-black text-xs transition-all",
                      !withinMonth ? "bg-indigo-600 text-white border-indigo-700" : "bg-white border-indigo-100 text-indigo-400"
                    )}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setWithinMonth(true)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 font-black text-xs transition-all",
                      withinMonth ? "bg-indigo-600 text-white border-indigo-700" : "bg-white border-indigo-100 text-indigo-400"
                    )}
                  >
                    ภายใน 1 เดือน
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> เลือกวัน
                </p>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg border-2 text-[11px] font-black transition-all",
                        selectedDays.includes(day.id)
                          ? "bg-indigo-600 text-white border-indigo-700"
                          : "bg-white border-indigo-100 text-indigo-400 hover:border-indigo-200"
                      )}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> ช่วงเวลา
                </p>
                <div className="flex gap-2">
                  {PERIODS.map(period => (
                    <button
                      key={period.id}
                      onClick={() => togglePeriod(period.id)}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-black text-xs transition-all",
                        selectedPeriods.includes(period.id)
                          ? "bg-indigo-600 text-white border-indigo-700"
                          : "bg-white border-indigo-100 text-indigo-400 hover:border-indigo-200"
                      )}
                    >
                      {period.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-indigo-100 flex justify-end gap-4">
              <button
                onClick={resetFilters}
                className="px-6 py-2 text-xs font-black text-indigo-400 hover:text-indigo-700 uppercase tracking-widest"
              >
                ล้างทั้งหมด
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-8 py-2 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#7c51a1]"
              >
                ตกลง
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredActivities.map((activity) => {
          const isFull = activity.registrationCount >= activity.capacity;
          const isAlmostFull = !isFull && activity.registrationCount >= activity.capacity * 0.8;
          const progress = (activity.registrationCount / activity.capacity) * 100;
          
          return (
            <div 
              key={activity.id}
              className="bento-card group flex flex-col hover:shadow-[6px_6px_0px_0px_#0f172a]"
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                      {activity.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {activity.tags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isFull ? (
                    <span className="status-badge bg-red-100 text-red-700 border-red-800 shrink-0">
                      ปิดสมัคร
                    </span>
                  ) : isAlmostFull ? (
                    <span className="status-badge bg-amber-100 text-amber-700 border-amber-800 shrink-0">
                      ด่วน!
                    </span>
                  ) : (
                    <span className="status-badge bg-indigo-50 text-indigo-700 border-indigo-700 shrink-0">
                      ว่าง
                    </span>
                  )}
                </div>

                <p className="text-slate-600 font-bold text-base leading-snug line-clamp-3">
                  {activity.description}
                </p>

                <div className="space-y-3 pt-4 border-t-2 border-slate-100">
                  <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    {formatDate(activity.date)}
                  </div>
                  <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {activity.time}
                  </div>
                  <div className="flex items-center gap-3 text-[14px] font-bold text-slate-600">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    {activity.place}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">จำนวนคน</p>
                    <p className="text-[11px] font-black text-slate-900">{activity.registrationCount} / {activity.capacity}</p>
                  </div>
                  <div className="h-3 w-full bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex flex-col gap-3">
                <button
                  onClick={() => setViewingGuestsId(activity.id)}
                  className="w-full text-center text-[10px] font-black text-indigo-600 hover:underline tracking-widest uppercase"
                >
                  ดูรายชื่อเพื่อน ๆ →
                </button>
                <button
                  disabled={isFull}
                  onClick={() => setRegisteringActivityId(activity.id)}
                  className={cn(
                    "w-full py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all",
                    isFull 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200" 
                      : "bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 shadow-[4px_4px_0px_0px_#7c51a1]"
                  )}
                >
                  {isFull ? "ปิดรับสมัคร (เต็มแล้ว)" : "เข้าร่วมกิจกรรม"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white mb-6 border-2 border-slate-100 shadow-sm">
            <Info className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">ไม่พบกิจกรรมที่ค้นหา</h3>
          <p className="text-slate-500 mt-2">ลองปรับเปลี่ยนตัวกรองดูหน่อยสิครับ!</p>
          <button 
            onClick={resetFilters}
            className="mt-6 text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {registeringActivityId && (
        <RegistrationForm 
          activity={activities.find(a => a.id === registeringActivityId)!}
          onClose={() => setRegisteringActivityId(null)}
          onSuccess={() => {
            setRegisteringActivityId(null);
            fetchActivitiesWithCounts();
          }}
        />
      )}

      {viewingGuestsId && (
        <GuestPublicList 
          activityId={viewingGuestsId} 
          activityTitle={activities.find(a => a.id === viewingGuestsId)?.title ?? ''}
          onClose={() => setViewingGuestsId(null)} 
        />
      )}
    </div>
  );
}
