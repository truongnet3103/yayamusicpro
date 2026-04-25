import { useState, useEffect, useCallback } from 'react';
import { Layout, FileText, MessageSquare, BarChart2, Plus, Pencil, Trash2, Eye, EyeOff, Save, X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { PriceGroup, PriceItem } from '../../domains/cms/types';
import { useUser } from '../../domains/auth/contexts/UserContext';
import {
  getAllCourses, upsertCourse, deleteCourse,
  getAllPosts, upsertPost, deletePost,
  getAllTestimonials, upsertTestimonial, deleteTestimonial,
  getAllStats, upsertStat, deleteStat,
} from '../../domains/cms/services/cmsService';
import type { CmsCourse, CmsPost, CmsTestimonial, CmsStat } from '../../domains/cms/types';

type Tab = 'courses' | 'posts' | 'testimonials' | 'stats';

/* ─── Shared helpers ─────────────────────────────────────────── */

function Badge({ published }: { published: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
      published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {published ? <Eye size={10} /> : <EyeOff size={10} />}
      {published ? 'Đã xuất bản' : 'Bản nháp'}
    </span>
  );
}

function ActionBar({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <p className="text-sm text-gray-500">Quản lý nội dung hiển thị trên trang chủ</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} />
        {label}
      </button>
    </div>
  );
}

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-semibold text-navy mb-2">Xoá mục này?</h3>
        <p className="text-sm text-gray-600 mb-4">Bạn sắp xoá <strong>{name}</strong>. Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Huỷ</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Xoá</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Price Groups Editor ────────────────────────────────────── */

function PriceGroupsEditor({ groups, onChange }: {
  groups: PriceGroup[];
  onChange: (groups: PriceGroup[]) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(groups.length > 0 ? 0 : null);

  function addGroup() {
    const next = [...groups, { group: '', items: [{ level: '', original: '', sale: '' }] }];
    onChange(next);
    setOpenIdx(next.length - 1);
  }

  function removeGroup(gi: number) {
    const next = groups.filter((_, i) => i !== gi);
    onChange(next);
    setOpenIdx(next.length > 0 ? Math.min(gi, next.length - 1) : null);
  }

  function updateGroupName(gi: number, val: string) {
    const next = groups.map((g, i) => i === gi ? { ...g, group: val } : g);
    onChange(next);
  }

  function addItem(gi: number) {
    const next = groups.map((g, i) => i === gi
      ? { ...g, items: [...g.items, { level: '', original: '', sale: '' }] }
      : g);
    onChange(next);
  }

  function removeItem(gi: number, ii: number) {
    const next = groups.map((g, i) => i === gi
      ? { ...g, items: g.items.filter((_, j) => j !== ii) }
      : g);
    onChange(next);
  }

  function updateItem(gi: number, ii: number, field: keyof PriceItem, val: string) {
    const next = groups.map((g, i) => i === gi
      ? { ...g, items: g.items.map((item, j) => j === ii ? { ...item, [field]: val === '' && field === 'original' ? null : val } : item) }
      : g);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-600">Bảng giá</label>
        <button type="button" onClick={addGroup}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium">
          <Plus size={12} /> Thêm nhóm giá
        </button>
      </div>

      {groups.length === 0 && (
        <p className="text-xs text-gray-400 italic py-2 text-center border border-dashed border-gray-200 rounded-lg">
          Chưa có bảng giá. Nhấn "Thêm nhóm giá" để bắt đầu.
        </p>
      )}

      {groups.map((group, gi) => (
        <div key={gi} className="border border-gray-200 rounded-xl overflow-hidden">
          <div
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer select-none"
            onClick={() => setOpenIdx(openIdx === gi ? null : gi)}
          >
            {openIdx === gi ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            <input
              value={group.group}
              onChange={e => { e.stopPropagation(); updateGroupName(gi, e.target.value); }}
              onClick={e => e.stopPropagation()}
              placeholder="Tên nhóm (VD: Từ 4–6 tuổi)"
              className="flex-1 text-xs font-medium bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
            />
            <span className="text-xs text-gray-400">{group.items.length} mức giá</span>
            <button type="button" onClick={e => { e.stopPropagation(); removeGroup(gi); }}
              className="p-0.5 hover:text-red-500 text-gray-400 ml-1">
              <Trash2 size={12} />
            </button>
          </div>

          {openIdx === gi && (
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-3 gap-1 text-xs font-medium text-gray-500 px-1">
                <span>Trình độ</span><span>Giá gốc</span><span>Giá khuyến mãi</span>
              </div>
              {group.items.map((item, ii) => (
                <div key={ii} className="grid grid-cols-3 gap-1 items-center">
                  <input value={item.level} onChange={e => updateItem(gi, ii, 'level', e.target.value)}
                    placeholder="Cơ bản" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  <input value={item.original ?? ''} onChange={e => updateItem(gi, ii, 'original', e.target.value)}
                    placeholder="Để trống = không có" className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                  <div className="flex gap-1 items-center">
                    <input value={item.sale} onChange={e => updateItem(gi, ii, 'sale', e.target.value)}
                      placeholder="5.000.000 ₫" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30" />
                    {group.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(gi, ii)} className="text-gray-300 hover:text-red-400">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addItem(gi)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1">
                <Plus size={11} /> Thêm mức giá
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Courses Tab ────────────────────────────────────────────── */

const EMPTY_COURSE: Partial<CmsCourse> = {
  number_label: '', title: '', subtitle: '', description: '',
  duration: '', age_range: '', icon: '', published: false, order_index: 0,
  price_groups: [],
};

function CoursesTab() {
  const [items, setItems] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CmsCourse> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsCourse | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAllCourses()); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      await upsertCourse(editing);
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deleteCourse(id);
    setDeleteTarget(null);
    await load();
  }

  const f = (key: keyof CmsCourse, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Đang tải...</div>;

  return (
    <>
      <ActionBar onAdd={() => setEditing({ ...EMPTY_COURSE })} label="Thêm khoá học" />

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {item.number_label}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-navy text-sm">{item.title}</span>
                <Badge published={item.published} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                {item.duration && <span>⏱ {item.duration}</span>}
                {item.age_range && <span>👤 {item.age_range}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing({ ...item })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <Pencil size={14} />
              </button>
              <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">Chưa có khoá học nào. Thêm khoá học đầu tiên.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-navy">{editing.id ? 'Sửa khoá học' : 'Thêm khoá học'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Số thứ tự (hiển thị)</label>
                  <input value={editing.number_label ?? ''} onChange={e => f('number_label', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="01" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Thứ tự sắp xếp</label>
                  <input type="number" value={editing.order_index ?? 0} onChange={e => f('order_index', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tên khoá học *</label>
                <input value={editing.title ?? ''} onChange={e => f('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Piano Cổ Điển & Đương Đại" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Mô tả *</label>
                <textarea value={editing.description ?? ''} onChange={e => f('description', e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Thời gian học</label>
                  <input value={editing.duration ?? ''} onChange={e => f('duration', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="3 tháng — 2 năm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Độ tuổi</label>
                  <input value={editing.age_range ?? ''} onChange={e => f('age_range', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="8 tuổi trở lên" />
                </div>
              </div>
              <PriceGroupsEditor
                groups={editing.price_groups ?? []}
                onChange={val => f('price_groups', val)}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.published ?? false} onChange={e => f('published', e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Xuất bản (hiển thị trên trang chủ)</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end p-5 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Huỷ</button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.title} onConfirm={() => doDelete(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

/* ─── Posts Tab ──────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  news: 'Tin tức', event: 'Sự kiện', highlight: 'Điểm nổi bật',
};

const EMPTY_POST: Partial<CmsPost> = {
  category: 'news', title: '', subtitle: '', excerpt: '', body: '',
  image_url: '', event_date: null, event_venue: '',
  cta_label: '', cta_url: '', tags: [], published: false, order_index: 0,
};

function PostsTab() {
  const [items, setItems] = useState<CmsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CmsPost> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsPost | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAllPosts()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      await upsertPost(editing);
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deletePost(id);
    setDeleteTarget(null);
    await load();
  }

  const f = (key: keyof CmsPost, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Đang tải...</div>;

  return (
    <>
      <ActionBar onAdd={() => setEditing({ ...EMPTY_POST })} label="Thêm bài viết" />

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <span className="font-semibold text-navy text-sm">{item.title}</span>
                <Badge published={item.published} />
              </div>
              {item.subtitle && <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>}
              {item.event_date && <p className="text-xs text-gray-400 mt-0.5">📅 {item.event_date}{item.event_venue ? ` — ${item.event_venue}` : ''}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing({ ...item })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <Pencil size={14} />
              </button>
              <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">Chưa có bài viết nào.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-navy">{editing.id ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Loại *</label>
                  <select value={editing.category ?? 'news'} onChange={e => f('category', e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                    <option value="news">Tin tức</option>
                    <option value="event">Sự kiện</option>
                    <option value="highlight">Điểm nổi bật</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Thứ tự</label>
                  <input type="number" value={editing.order_index ?? 0} onChange={e => f('order_index', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tiêu đề *</label>
                <input value={editing.title ?? ''} onChange={e => f('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phụ đề</label>
                <input value={editing.subtitle ?? ''} onChange={e => f('subtitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tóm tắt (excerpt)</label>
                <textarea value={editing.excerpt ?? ''} onChange={e => f('excerpt', e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                  placeholder="Mô tả ngắn hiển thị ở trang blog..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nội dung</label>
                <textarea value={editing.body ?? ''} onChange={e => f('body', e.target.value)} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tags <span className="font-normal text-gray-400">(phân cách bằng dấu phẩy)</span></label>
                <input
                  value={(editing.tags ?? []).join(', ')}
                  onChange={e => f('tags', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                  placeholder="piano, trẻ em, giáo dục" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">URL ảnh</label>
                <input value={editing.image_url ?? ''} onChange={e => f('image_url', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="https://..." />
              </div>
              {(editing.category === 'event') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ngày sự kiện</label>
                    <input type="date" value={editing.event_date ?? ''} onChange={e => f('event_date', e.target.value || null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Địa điểm</label>
                    <input value={editing.event_venue ?? ''} onChange={e => f('event_venue', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nhãn nút CTA</label>
                  <input value={editing.cta_label ?? ''} onChange={e => f('cta_label', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Xem thêm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">URL nút CTA</label>
                  <input value={editing.cta_url ?? ''} onChange={e => f('cta_url', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="/su-kien/..." />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.published ?? false} onChange={e => f('published', e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Xuất bản (hiển thị trên trang chủ)</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end p-5 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Huỷ</button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.title} onConfirm={() => doDelete(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

/* ─── Testimonials Tab ───────────────────────────────────────── */

const EMPTY_TESTIMONIAL: Partial<CmsTestimonial> = {
  quote: '', author_name: '', author_role: '', avatar_url: '', published: false, order_index: 0,
};

function TestimonialsTab() {
  const [items, setItems] = useState<CmsTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CmsTestimonial> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsTestimonial | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAllTestimonials()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      await upsertTestimonial(editing);
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deleteTestimonial(id);
    setDeleteTarget(null);
    await load();
  }

  const f = (key: keyof CmsTestimonial, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Đang tải...</div>;

  return (
    <>
      <ActionBar onAdd={() => setEditing({ ...EMPTY_TESTIMONIAL })} label="Thêm đánh giá" />

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {item.author_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-navy text-sm">{item.author_name}</span>
                {item.author_role && <span className="text-xs text-gray-400">— {item.author_role}</span>}
                <Badge published={item.published} />
              </div>
              <p className="text-xs text-gray-500 italic line-clamp-2">"{item.quote}"</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing({ ...item })} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <Pencil size={14} />
              </button>
              <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">Chưa có đánh giá nào.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-navy">{editing.id ? 'Sửa đánh giá' : 'Thêm đánh giá'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nội dung đánh giá *</label>
                <textarea value={editing.quote ?? ''} onChange={e => f('quote', e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Tên tác giả *</label>
                  <input value={editing.author_name ?? ''} onChange={e => f('author_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Vai trò</label>
                  <input value={editing.author_role ?? ''} onChange={e => f('author_role', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Giám đốc, Phụ huynh..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">URL ảnh đại diện</label>
                  <input value={editing.avatar_url ?? ''} onChange={e => f('avatar_url', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Thứ tự</label>
                  <input type="number" value={editing.order_index ?? 0} onChange={e => f('order_index', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.published ?? false} onChange={e => f('published', e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Xuất bản (hiển thị trên trang chủ)</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end p-5 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Huỷ</button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.author_name} onConfirm={() => doDelete(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

/* ─── Stats Tab ──────────────────────────────────────────────── */

const EMPTY_STAT: Partial<CmsStat> = {
  label: '', value: 0, suffix: '', published: true, order_index: 0,
};

function StatsTab() {
  const [items, setItems] = useState<CmsStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CmsStat> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsStat | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAllStats()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      await upsertStat(editing);
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id: string) {
    await deleteStat(id);
    setDeleteTarget(null);
    await load();
  }

  const f = (key: keyof CmsStat, val: any) => setEditing(prev => prev ? { ...prev, [key]: val } : prev);

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Đang tải...</div>;

  return (
    <>
      <ActionBar onAdd={() => setEditing({ ...EMPTY_STAT })} label="Thêm chỉ số" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 relative">
            <div className="text-2xl font-bold text-primary font-display">{item.value.toLocaleString()}{item.suffix}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
            <Badge published={item.published} />
            <div className="flex gap-1 mt-2">
              <button onClick={() => setEditing({ ...item })} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                <Pencil size={12} />
              </button>
              <button onClick={() => setDeleteTarget(item)} className="p-1 hover:bg-red-50 rounded text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-4 py-12 text-center text-gray-400 text-sm">Chưa có chỉ số nào.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-navy">{editing.id ? 'Sửa chỉ số' : 'Thêm chỉ số'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nhãn *</label>
                <input value={editing.label ?? ''} onChange={e => f('label', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="Học viên" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Giá trị *</label>
                  <input type="number" value={editing.value ?? 0} onChange={e => f('value', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Hậu tố</label>
                  <input value={editing.suffix ?? ''} onChange={e => f('suffix', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" placeholder="+ hoặc %" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Thứ tự</label>
                <input type="number" value={editing.order_index ?? 0} onChange={e => f('order_index', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.published ?? true} onChange={e => f('published', e.target.checked)}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Xuất bản</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end p-5 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Huỷ</button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.label} onConfirm={() => doDelete(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'courses',      label: 'Khoá Học',     icon: <BookOpen size={16} /> },
  { key: 'posts',        label: 'Bài Viết',     icon: <FileText size={16} /> },
  { key: 'testimonials', label: 'Đánh Giá',     icon: <MessageSquare size={16} /> },
  { key: 'stats',        label: 'Chỉ Số',       icon: <BarChart2 size={16} /> },
];

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('courses');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Quản Lý Nội Dung Trang Chủ</h1>
        <p className="text-sm text-gray-500 mt-1">Chỉnh sửa khoá học, bài viết, đánh giá và chỉ số hiển thị trên landing page</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'courses'      && <CoursesTab />}
        {activeTab === 'posts'        && <PostsTab />}
        {activeTab === 'testimonials' && <TestimonialsTab />}
        {activeTab === 'stats'        && <StatsTab />}
      </div>
    </div>
  );
}
