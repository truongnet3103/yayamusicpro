/**
 * Parent Messages Page
 *
 * Communication with school, teachers, and staff
 * School-scoped and respects multi-tenancy
 */

import { MessageSquare, Send, Inbox, Search, Users, Mail, Phone, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

interface MessageContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'teacher' | 'admin' | 'staff';
  specialization?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

function ParentMessagesPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<MessageContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const schoolId = school?.id || profile?.school_id;

  useEffect(() => {
    if (!schoolId || !profile?.id) return;

    const loadContacts = async () => {
      try {
        setLoading(true);

        // Step 1: Get parent record from parents table using user_id
        const { data: parentRecord } = await supabase
          .from('parents')
          .select('id')
          .eq('school_id', schoolId)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (!parentRecord) {
          setContacts([]);
          setLoading(false);
          return;
        }

        const parentId = parentRecord.id;

        // Step 2: Get parent's children from student_parents
        const { data: parentRelations } = await supabase
          .from('student_parents')
          .select('student_id')
          .eq('parent_id', parentId);

        if (!parentRelations || parentRelations.length === 0) {
          setContacts([]);
          setLoading(false);
          return;
        }

        const studentIds = parentRelations.map((rel: any) => rel.student_id);

        // Step 3: Get classes for these children from class_enrollments
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .in('student_id', studentIds);

        if (!enrollments || enrollments.length === 0) {
          setContacts([]);
          setLoading(false);
          return;
        }

        const classIds = [...new Set(enrollments.map((e: any) => e.class_id))];

        // Step 4: Get teachers for these classes
        const { data: classes } = await supabase
          .from('classes')
          .select(`
            teacher_id,
            teachers!inner(
              id,
              first_name,
              last_name,
              email,
              phone,
              specialization,
              user_id,
              user_profiles!inner(
                id,
                first_name,
                last_name,
                email,
                phone
              )
            )
          `)
          .in('id', classIds)
          .eq('is_active', true);

        // Build contacts list with unique teachers
        const contactsMap = new Map<string, MessageContact>();

        (classes || []).forEach((cls: any) => {
          const teacher = cls.teachers;
          if (teacher && !contactsMap.has(teacher.id)) {
            const userProfile = teacher.user_profiles;
            contactsMap.set(teacher.id, {
              id: teacher.id,
              name: userProfile
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : `${teacher.first_name} ${teacher.last_name}`,
              email: userProfile?.email || teacher.email,
              phone: userProfile?.phone || teacher.phone,
              type: 'teacher',
              specialization: teacher.specialization,
            });
          }
        });

        setContacts(Array.from(contactsMap.values()));
      } catch (error) {
        console.error('Error loading contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [schoolId, profile?.id]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Tin Nhắn</h1>
        <p className="font-body text-charcoal/70">Liên lạc với giảng viên của con em</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Contacts List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gold/20 shadow-card flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gold/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                type="text"
                placeholder="Tìm giảng viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gold/40 rounded-lg bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary font-body text-sm transition-colors"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
                <p className="font-body text-sm text-charcoal/50">
                  {searchQuery
                    ? 'Không tìm thấy giảng viên'
                    : contacts.length === 0
                    ? 'Chưa có giảng viên. Con em chưa được đăng ký lớp học.'
                    : 'Không tìm thấy liên hệ'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gold/10">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full p-4 text-left transition-colors ${
                      selectedContact?.id === contact.id
                        ? 'bg-primary/5 border-l-4 border-l-primary'
                        : 'hover:bg-cream-dark border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-navy truncate">{contact.name}</p>
                        <p className="font-body text-xs text-charcoal/50">Giảng viên</p>
                        {contact.specialization && (
                          <p className="font-body text-xs text-primary/70 truncate">{contact.specialization}</p>
                        )}
                        {contact.email && (
                          <p className="font-body text-xs text-charcoal/40 truncate">{contact.email}</p>
                        )}
                      </div>
                      {contact.unread_count && contact.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {contact.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gold/20 shadow-card flex flex-col overflow-hidden">
          {selectedContact ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-gold/20 bg-cream">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-navy">{selectedContact.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-0.5">
                      {selectedContact.specialization && (
                        <span className="font-body text-xs text-charcoal/60">{selectedContact.specialization}</span>
                      )}
                      {selectedContact.email && (
                        <div className="flex items-center gap-1 font-body text-xs text-charcoal/60">
                          <Mail className="w-3 h-3" />
                          <span>{selectedContact.email}</span>
                        </div>
                      )}
                      {selectedContact.phone && (
                        <div className="flex items-center gap-1 font-body text-xs text-charcoal/60">
                          <Phone className="w-3 h-3" />
                          <span>{selectedContact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-cream rounded-xl border border-gold/20 p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary/40" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-navy mb-2">Tính Năng Đang Phát Triển</h3>
                  <p className="font-body text-charcoal/60 mb-4">
                    Hệ thống nhắn tin đang được phát triển. Bạn sẽ sớm có thể:
                  </p>
                  <ul className="text-left max-w-xs mx-auto font-body text-sm text-charcoal/60 space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Gửi tin nhắn cho giảng viên
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Nhận và phản hồi tin nhắn
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Xem lịch sử hội thoại
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Xác nhận đã đọc
                    </li>
                  </ul>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gold/20">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    disabled
                    className="flex-1 px-4 py-2.5 border border-gold/40 rounded-lg bg-cream-dark text-charcoal/40 font-body text-sm cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="px-4 py-2.5 bg-charcoal/10 text-charcoal/40 rounded-lg cursor-not-allowed flex items-center gap-2 font-body text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-primary/40" />
                </div>
                <p className="font-body text-charcoal/50">Chọn một giảng viên để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParentMessagesPage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['messaging:read', 'messaging:create']}>
        <ParentMessagesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
