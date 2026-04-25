/**
 * Teacher Messages Page
 *
 * Communication with students and parents
 * School-scoped and respects multi-tenancy
 */

import { MessageSquare, Send, Search, Users, Mail, Phone } from 'lucide-react';
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
  role: 'student' | 'parent' | 'teacher' | 'admin';
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

function TeacherMessagesPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const [contacts, setContacts] = useState<MessageContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<MessageContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const schoolId = school?.id || profile?.school_id;

  useEffect(() => {
    if (!schoolId || !profile?.id) return;

    const loadContacts = async () => {
      try {
        setLoading(true);

        // Load students from teacher's classes
        const { data: classes } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', schoolId)
          .eq('teacher_id', profile.id)
          .eq('is_active', true);

        if (!classes || classes.length === 0) {
          setContacts([]);
          setLoading(false);
          return;
        }

        const classIds = classes.map((c: any) => c.id);

        // Load students enrolled in these classes
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select(`
            student_id,
            students!inner(
              id,
              first_name,
              last_name,
              email,
              phone,
              user_id
            )
          `)
          .in('class_id', classIds);

        // Load parents associated with these students
        const studentIds = [...new Set(enrollments?.map((e: any) => e.student_id) || [])];
        const { data: parentRelations } = await supabase
          .from('student_parents')
          .select(`
            parent_id,
            student_id,
            parents!inner(
              id,
              first_name,
              last_name,
              email,
              phone,
              user_id
            )
          `)
          .in('student_id', studentIds);

        // Build contacts list
        const contactsList: MessageContact[] = [];

        // Add students
        (enrollments || []).forEach((enrollment: any) => {
          const student = enrollment.students;
          if (student) {
            contactsList.push({
              id: student.id,
              name: `${student.first_name} ${student.last_name}`,
              email: student.email,
              phone: student.phone,
              role: 'student',
            });
          }
        });

        // Add parents
        (parentRelations || []).forEach((relation: any) => {
          const parent = relation.parents;
          if (parent) {
            // Avoid duplicates
            const existing = contactsList.find(c => c.id === parent.id);
            if (!existing) {
              contactsList.push({
                id: parent.id,
                name: `${parent.first_name} ${parent.last_name}`,
                email: parent.email,
                phone: parent.phone,
                role: 'parent',
              });
            }
          }
        });

        setContacts(contactsList);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [schoolId, profile?.id]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleLabel = (role: MessageContact['role']) => {
    if (role === 'student') return 'Học viên';
    if (role === 'parent') return 'Phụ huynh';
    if (role === 'teacher') return 'Giảng viên';
    return 'Quản trị';
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
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Tin Nhắn</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Liên lạc với học viên và phụ huynh</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Contacts List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-card border border-gold/20 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gold/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                type="text"
                placeholder="Tìm kiếm liên hệ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gold/40 rounded-lg bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gold/30" />
                <p className="text-sm text-charcoal/50 font-body">
                  {searchQuery ? 'Không tìm thấy liên hệ' : 'Chưa có liên hệ nào'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gold/10">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full p-4 text-left hover:bg-cream/60 transition-colors ${
                      selectedContact?.id === contact.id
                        ? 'bg-primary/5 border-l-2 border-l-primary'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        contact.role === 'student' ? 'bg-primary/10' :
                        contact.role === 'parent' ? 'bg-gold/20' :
                        'bg-navy/10'
                      }`}>
                        <Users className={`w-5 h-5 ${
                          contact.role === 'student' ? 'text-primary' :
                          contact.role === 'parent' ? 'text-gold' :
                          'text-navy'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy font-body truncate">{contact.name}</p>
                        <p className="text-xs text-charcoal/50 font-body">{roleLabel(contact.role)}</p>
                        {contact.email && (
                          <p className="text-xs text-charcoal/40 font-body truncate">{contact.email}</p>
                        )}
                      </div>
                      {contact.unread_count && contact.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs font-bold font-body rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-gold/20 flex flex-col">
          {selectedContact ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-gold/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedContact.role === 'student' ? 'bg-primary/10' :
                    selectedContact.role === 'parent' ? 'bg-gold/20' :
                    'bg-navy/10'
                  }`}>
                    <Users className={`w-5 h-5 ${
                      selectedContact.role === 'student' ? 'text-primary' :
                      selectedContact.role === 'parent' ? 'text-gold' :
                      'text-navy'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-navy font-body">{selectedContact.name}</h3>
                    <div className="flex items-center gap-4 mt-0.5">
                      {selectedContact.email && (
                        <div className="flex items-center gap-1 text-xs text-charcoal/50 font-body">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{selectedContact.email}</span>
                        </div>
                      )}
                      {selectedContact.phone && (
                        <div className="flex items-center gap-1 text-xs text-charcoal/50 font-body">
                          <Phone className="w-3.5 h-3.5" />
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
                  <MessageSquare className="w-16 h-16 text-gold/30 mx-auto mb-4" />
                  <h3 className="text-base font-semibold text-navy font-display mb-2">Tính năng đang phát triển</h3>
                  <p className="text-charcoal/60 font-body text-sm mb-4">
                    Giao diện nhắn tin đang được xây dựng. Bạn sẽ có thể:
                  </p>
                  <ul className="text-left max-w-sm mx-auto space-y-2">
                    <li className="flex items-center gap-2 text-sm text-charcoal/70 font-body">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Gửi tin nhắn đến học viên và phụ huynh
                    </li>
                    <li className="flex items-center gap-2 text-sm text-charcoal/70 font-body">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Nhận và trả lời tin nhắn
                    </li>
                    <li className="flex items-center gap-2 text-sm text-charcoal/70 font-body">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></span>
                      Xem lịch sử tin nhắn
                    </li>
                    <li className="flex items-center gap-2 text-sm text-charcoal/70 font-body">
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
                    className="flex-1 px-4 py-2 border border-gold/30 rounded-lg bg-cream font-body text-sm text-charcoal/50 cursor-not-allowed"
                  />
                  <button
                    disabled
                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gold/30 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-navy font-display mb-2">Chọn Liên Hệ</h3>
                <p className="text-charcoal/60 font-body text-sm">
                  Chọn học viên hoặc phụ huynh từ danh sách để bắt đầu nhắn tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeacherMessagesPage() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <PermissionGuard requiredCapabilities={['messaging:read']}>
        <TeacherMessagesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
