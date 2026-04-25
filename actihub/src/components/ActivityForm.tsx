import React, { useState, useEffect } from 'react';
import { supabase, type Activity } from '../lib/supabase';
import { X, Calendar, MapPin, Clock, Loader2, Save, Tag, Plus } from 'lucide-react';

interface ActivityFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Activity | null;
}

export function ActivityForm({ onClose, onSuccess, initialData }: ActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    date: initialData?.date ?? '',
    time: initialData?.time ?? '',
    place: initialData?.place ?? '',
    capacity: initialData?.capacity ?? 10,
    tags: initialData?.tags ?? [] as string[],
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('name').order('name');
    if (data) {
      setExistingTags(data.map(t => t.name));
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        place: formData.place,
        capacity: formData.capacity,
        tags: formData.tags,
        created_by: user?.id,
      };

      let error;
      if (initialData) {
        const { error: err } = await supabase
          .from('activities')
          .update(payload)
          .eq('id', initialData.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('activities')
          .insert([payload]);
        error = err;
      }

      if (!error) {
        // Upsert unique tags into the tags table
        if (formData.tags.length > 0) {
          const uniqueTags = formData.tags.map(name => ({ name }));
          await supabase.from('tags').upsert(uniqueTags, { onConflict: 'name' });
        }
        onSuccess();
      } else {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bento-card border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-4 border-b-4 border-slate-900 flex items-center justify-between bg-white">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {initialData ? 'เปลี่ยนข้อมูล' : 'กิจกรรมใหม่!'}
          </h2>
          <button onClick={onClose} className="p-2 border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-colors">
            <X className="w-6 h-6 text-slate-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pb-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อกิจกรรม</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200"
                placeholder="ชื่อกิจกรรมของคุณ"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">รายละเอียด</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200 min-h-[100px]"
                placeholder="กรอกรายละเอียดที่นี่..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-slate-900" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">เวลา</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-900" />
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานที่</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-900" />
                  <input
                    type="text"
                    required
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200"
                    placeholder="สถานที่จัดงาน"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนคน</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-5 py-3 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">แท็ก (ป้ายบอกหมวดหมู่)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 border-2 border-indigo-600 rounded-lg text-indigo-700 text-xs font-bold shadow-[2px_2px_0px_0px_#7c51a1]">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-900 focus:ring-4 focus:ring-indigo-100 outline-none font-bold placeholder:text-slate-200"
                    placeholder="พิมพ์แท็กแล้วกด Enter..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="p-2 border-2 border-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-slate-900" />
                </button>
              </div>
              
              {existingTags.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">แท็กที่มีอยู่:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingTags.filter(t => !formData.tags.includes(t)).slice(0, 10).map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-0.5 bg-white border-2 border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-4 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bento-card shadow-none hover:bg-slate-50 font-black uppercase text-xs tracking-widest"
            >
              ล้มเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-bento flex-[2] py-3 text-xs tracking-[0.2em] shadow-[4px_4px_0px_0px_#7c51a1]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  ยืนยัน
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
