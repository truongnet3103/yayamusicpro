import { BookOpen, Search, Plus, X, Check, Trash2, ToggleLeft, ToggleRight, School, Edit2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';

interface CourseRow {
  id: string;
  school_id: string;
  code: string;
  name: string;
  description: string | null;
  grade_level: string | null;
  credits: number | null;
  is_active: boolean;
  created_at: string;
  schools: { name: string } | null;
}

const BLANK_FORM = {
  school_id: '',
  code: '',
  name: '',
  description: '',
  grade_level: '',
  credits: '',
};

function SuperAdminCoursesContent() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null);

  const load = useCallback(async () => {
    const [coursesRes, schoolsRes] = await Promise.all([
      supabase
        .from('courses')
        .select('id, school_id, code, name, description, grade_level, credits, is_active, created_at, schools(name)')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('schools').select('id, name').order('name'),
    ]);
    setCourses((coursesRes.data as CourseRow[]) ?? []);
    setSchools(schoolsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (course: CourseRow) => {
    setEditingCourse(course);
    setForm({
      school_id: course.school_id,
      code: course.code,
      name: course.name,
      description: course.description ?? '',
      grade_level: course.grade_level ?? '',
      credits: course.credits?.toString() ?? '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.school_id) { setFormError('Vui lòng chọn cơ sở'); return; }
    if (!form.code.trim()) { setFormError('Vui lòng nhập mã khoá học'); return; }
    if (!form.name.trim()) { setFormError('Vui lòng nhập tên khoá học'); return; }
    const creditsVal = form.credits ? parseFloat(form.credits) : null;
    if (creditsVal !== null && (isNaN(creditsVal) || creditsVal < 0 || creditsVal > 9999)) {
      setFormError('Số tín chỉ phải từ 0 đến 9999'); return;
    }
    setSaving(true); setFormError('');
    try {
      const payload = {
        school_id: form.school_id,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        grade_level: form.grade_level.trim() || null,
        credits: creditsVal,
      };
      let error;
      if (editingCourse) {
        ({ error } = await supabase.from('courses').update(payload).eq('id', editingCourse.id));
      } else {
        ({ error } = await supabase.from('courses').insert({ ...payload, is_active: true }));
      }
      if (error) throw new Error(error.message);
      setShowForm(false); setForm(BLANK_FORM); setEditingCourse(null);
      load();
    } catch (e: any) {
      setFormError(e.message ?? 'Lỗi khi lưu khoá học');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = handleSave;

  const handleToggleActive = async (course: CourseRow) => {
    setTogglingId(course.id);
    try {
      await supabase.from('courses').update({ is_active: !course.is_active }).eq('id', course.id);
      load();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (course: CourseRow) => {
    if (!window.confirm(`Xoá khoá học "${course.name}"?\nTất cả lớp học thuộc khoá này cũng bị xoá. Hành động không thể hoàn tác.`)) return;
    setDeletingId(course.id);
    try {
      const { error } = await supabase.from('courses').delete().eq('id', course.id);
      if (error) throw new Error(error.message);
      load();
    } catch (e: any) {
      alert(e.message ?? 'Lỗi khi xoá');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchSchool = !filterSchool || c.school_id === filterSchool;
    const matchActive =
      !filterActive ||
      (filterActive === 'active' && c.is_active) ||
      (filterActive === 'inactive' && !c.is_active);
    return matchSearch && matchSchool && matchActive;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Khoá Học</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Quản lý danh mục khoá học toàn hệ thống</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setForm(BLANK_FORM); setEditingCourse(null); }}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm khoá học
        </button>
      </div>

      {showForm && (
        <div className="bg-cream border border-gold/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy font-body">{editingCourse ? `Chỉnh sửa: ${editingCourse.name}` : 'Tạo khoá học mới'}</p>
            <button onClick={() => { setShowForm(false); setEditingCourse(null); }} className="p-1 hover:bg-cream-dark rounded-lg text-charcoal/60"><X className="w-4 h-4" /></button>
          </div>
          {formError && <p className="text-sm text-red-600 font-body">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-1">Cơ sở *</label>
              <select value={form.school_id} onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                <option value="">— Chọn cơ sở —</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Mã khoá học *</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="VD: PIANO-01"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Tên khoá học *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Piano Cơ Bản"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-navy font-body mb-1">Mô tả</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} placeholder="Mô tả ngắn về khoá học..."
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Cấp độ</label>
              <input type="text" value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))}
                placeholder="VD: Sơ cấp, Trung cấp"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy font-body mb-1">Số tín chỉ / buổi</label>
              <input type="number" min="0" max="9999" step="0.5" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
                placeholder="VD: 2"
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setEditingCourse(null); }} className="px-4 py-2 text-sm font-body text-charcoal/60 hover:text-charcoal transition-colors">Huỷ</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary-light rounded-lg px-4 py-2 font-body font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Check className="w-4 h-4" />}
              {editingCourse ? 'Lưu thay đổi' : 'Tạo khoá học'}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
          <input type="text" placeholder="Tên hoặc mã khoá học..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white w-56" />
        </div>
        <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="">Tất cả cơ sở</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          className="px-3 py-2 border border-gold/30 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã ẩn</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
            <p className="text-charcoal/50 font-body">Không tìm thấy khoá học nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-cream border-b border-gold/20">
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Khoá học</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden md:table-cell">Cơ sở</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Cấp độ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide hidden lg:table-cell">Tín chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal/60 font-body uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map(course => (
                <tr key={course.id} className="hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy font-body">{course.name}</p>
                        <p className="text-xs text-charcoal/50 font-body mt-0.5">{course.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-charcoal/30" />
                      <p className="text-sm text-charcoal/60 font-body">{course.schools?.name ?? '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">{course.grade_level ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-charcoal/60 font-body">{course.credits != null ? course.credits : '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-cream text-charcoal/50'}`}>
                      {course.is_active ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(course)}
                        className="p-1.5 text-charcoal/30 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Chỉnh sửa khoá học"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(course)}
                        disabled={togglingId === course.id}
                        className="p-1.5 text-charcoal/30 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                        title={course.is_active ? 'Ẩn khoá học' : 'Kích hoạt'}
                      >
                        {togglingId === course.id
                          ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold"></div>
                          : course.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        disabled={deletingId === course.id}
                        className="p-1.5 text-charcoal/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xoá khoá học"
                      >
                        {deletingId === course.id
                          ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gold/10 bg-cream/30">
            <p className="text-xs text-charcoal/50 font-body">Hiển thị {filtered.length} / {courses.length} khoá học</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SuperAdminCoursesPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <SuperAdminCoursesContent />
    </RoleGuard>
  );
}
