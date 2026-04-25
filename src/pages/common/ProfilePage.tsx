/**
 * Profile Page
 *
 * User profile dashboard - accessible to all roles
 * Shows role-specific information
 * School-scoped and respects multi-tenancy
 */

import { Mail, Phone, Calendar, Briefcase, Award, BookOpen, Edit, Save, X, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { supabase } from '../../shared/lib/supabase';
import { uploadAvatar } from '../../shared/services/avatarService';

interface TeacherInfo {
  id: string;
  employee_code: string;
  hire_date?: string;
  specialization?: string;
  qualification?: string;
  status: 'active' | 'inactive' | 'on_leave';
}

const teacherStatusLabel: Record<string, string> = {
  active: 'Đang hoạt động',
  on_leave: 'Đang nghỉ phép',
  inactive: 'Không hoạt động',
};

const teacherStatusStyle: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  on_leave: 'bg-gold/10 text-gold-dark',
  inactive: 'bg-charcoal/10 text-charcoal',
};

function ProfilePageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedProfile, setEditedProfile] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });

  const schoolId = school?.id || profile?.school_id;

  useEffect(() => {
    if (!schoolId || !profile?.id) return;

    const loadTeacherInfo = async () => {
      // If user is a teacher, load additional teacher info
      if (profile.user_type === 'teacher') {
        try {
          const { data, error } = await supabase
            .from('teachers')
            .select('id, employee_code, hire_date, specialization, qualification, status')
            .eq('school_id', schoolId)
            .eq('user_id', profile.id)
            .maybeSingle();

          if (!error && data) {
            setTeacherInfo(data);
          }
        } catch (error) {
          console.error('Error loading teacher info:', error);
        }
      }
      setLoading(false);
    };

    loadTeacherInfo();
  }, [schoolId, profile?.id, profile?.user_type]);

  const handleSave = async () => {
    if (!profile?.id || !schoolId) return;

    try {
      setUploading(true);

      let avatarUrl = profile?.avatar_url || null;

      // Upload avatar if file is selected
      if (selectedFile) {
        try {
          const uploadResult = await uploadAvatar(selectedFile, profile.id, schoolId);
          avatarUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          alert(`Failed to upload avatar: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          setUploading(false);
          return;
        }
      }

      // Update profile with new data and avatar URL
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          email: editedProfile.email,
          phone: editedProfile.phone || null,
          avatar_url: avatarUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      // Reload profile (context will update automatically)
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Hồ Sơ Cá Nhân</h1>
          <p className="font-body text-charcoal/70">Xem và quản lý thông tin cá nhân</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light font-body text-sm font-semibold transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Xem trước"
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <span className="font-display text-3xl font-semibold text-primary">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </span>
                </div>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary-light transition-colors shadow-md"
                    type="button"
                    title="Tải ảnh lên"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              )}
            </div>
            {selectedFile && isEditing && (
              <p className="font-body text-xs text-charcoal/50 mb-2">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <h2 className="font-display text-xl font-bold text-navy mb-1">{profile?.full_name}</h2>
            <p className="font-body text-sm text-charcoal/60 capitalize mb-4">{profile?.user_type}</p>
            {school && (
              <div className="p-3 bg-cream-dark rounded-xl border border-gold/20">
                <p className="font-body text-sm font-medium text-navy">{school.name}</p>
                <p className="font-body text-xs text-charcoal/50">{school.code}</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-navy">Thông Tin Cá Nhân</h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-light font-body text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Lưu</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-1.5 bg-cream-dark text-charcoal rounded-lg hover:bg-gold/10 font-body text-sm transition-colors border border-gold/20"
                  >
                    <X className="w-4 h-4" />
                    <span>Hủy</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-medium text-charcoal/70 mb-1">Tên</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.first_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gold/40 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body text-sm transition-colors"
                    />
                  ) : (
                    <p className="font-body text-navy">{profile?.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-charcoal/70 mb-1">Họ</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.last_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gold/40 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body text-sm transition-colors"
                    />
                  ) : (
                    <p className="font-body text-navy">{profile?.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal/70 mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gold/40 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body text-sm transition-colors"
                  />
                ) : (
                  <p className="font-body text-navy">{profile?.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal/70 mb-1">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gold/40 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-body text-sm transition-colors"
                  />
                ) : (
                  <p className="font-body text-navy">{profile?.phone || 'Chưa cung cấp'}</p>
                )}
              </div>

              <div>
                <label className="block font-body text-sm font-medium text-charcoal/70 mb-1">Trạng thái tài khoản</label>
                <span className={`inline-flex px-2 py-1 font-body text-xs font-medium rounded-full ${
                  profile?.is_active
                    ? 'bg-primary/10 text-primary'
                    : 'bg-charcoal/10 text-charcoal'
                }`}>
                  {profile?.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>
          </div>

          {/* Teacher-Specific Information */}
          {profile?.user_type === 'teacher' && teacherInfo && (
            <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
              <h3 className="font-display text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Thông Tin Giảng Viên
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-body text-sm font-medium text-charcoal/70 mb-1">Mã nhân viên</label>
                  <p className="font-body text-navy">{teacherInfo.employee_code}</p>
                </div>
                {teacherInfo.hire_date && (
                  <div>
                    <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal/70 mb-1">
                      <Calendar className="w-4 h-4" />
                      Ngày tuyển dụng
                    </label>
                    <p className="font-body text-navy">
                      {new Date(teacherInfo.hire_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                {teacherInfo.specialization && (
                  <div>
                    <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal/70 mb-1">
                      <BookOpen className="w-4 h-4" />
                      Chuyên môn
                    </label>
                    <p className="font-body text-navy">{teacherInfo.specialization}</p>
                  </div>
                )}
                {teacherInfo.qualification && (
                  <div>
                    <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal/70 mb-1">
                      <Award className="w-4 h-4" />
                      Bằng cấp
                    </label>
                    <p className="font-body text-navy">{teacherInfo.qualification}</p>
                  </div>
                )}
                <div>
                  <label className="block font-body text-sm font-medium text-charcoal/70 mb-1">Trạng thái</label>
                  <span className={`inline-flex px-2 py-1 font-body text-xs font-medium rounded-full ${
                    teacherStatusStyle[teacherInfo.status] || teacherStatusStyle.inactive
                  }`}>
                    {teacherStatusLabel[teacherInfo.status] || teacherInfo.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
            <h3 className="font-display text-lg font-semibold text-navy mb-4">Thông Tin Tài Khoản</h3>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-gold/20">
                <span className="font-body text-sm text-charcoal/60">Ngày tham gia</span>
                <span className="font-body text-sm font-medium text-navy">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'Không có'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <RoleGuard allowedRoles={['admin', 'teacher', 'parent', 'student', 'staff', 'it_admin', 'super_admin']}>
      <ProfilePageContent />
    </RoleGuard>
  );
}
