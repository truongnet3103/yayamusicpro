import { supabase } from '../../../shared/lib/supabase';
import type {
  CmsCourse, CmsPostInput,
  CmsPost, CmsCourseInput,
  CmsTestimonial, CmsTestimonialInput,
  CmsStat, CmsStatInput,
} from '../types';

// ── Public read (published only) ──────────────────────────────

export async function getPublishedCourses(schoolId?: string): Promise<CmsCourse[]> {
  let q = supabase.from('cms_courses').select('*').eq('published', true).order('order_index');
  if (schoolId) q = q.eq('school_id', schoolId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedPosts(schoolId?: string, category?: string): Promise<CmsPost[]> {
  let q = supabase.from('cms_posts').select('*').eq('published', true).order('order_index');
  if (schoolId) q = q.eq('school_id', schoolId);
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedTestimonials(schoolId?: string): Promise<CmsTestimonial[]> {
  let q = supabase.from('cms_testimonials').select('*').eq('published', true).order('order_index');
  if (schoolId) q = q.eq('school_id', schoolId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedStats(schoolId?: string): Promise<CmsStat[]> {
  let q = supabase.from('cms_stats').select('*').eq('published', true).order('order_index');
  if (schoolId) q = q.eq('school_id', schoolId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ── Admin CRUD ─────────────────────────────────────────────────

export async function getAllCourses(): Promise<CmsCourse[]> {
  const { data, error } = await supabase.from('cms_courses').select('*').order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function upsertCourse(course: Partial<CmsCourse> & { id?: string }): Promise<CmsCourse> {
  const { data, error } = await supabase.from('cms_courses').upsert(course).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from('cms_courses').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllPosts(): Promise<CmsPost[]> {
  const { data, error } = await supabase.from('cms_posts').select('*').order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function upsertPost(post: Partial<CmsPost> & { id?: string }): Promise<CmsPost> {
  const { data, error } = await supabase.from('cms_posts').upsert(post).select().single();
  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('cms_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllTestimonials(): Promise<CmsTestimonial[]> {
  const { data, error } = await supabase.from('cms_testimonials').select('*').order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function upsertTestimonial(t: Partial<CmsTestimonial> & { id?: string }): Promise<CmsTestimonial> {
  const { data, error } = await supabase.from('cms_testimonials').upsert(t).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('cms_testimonials').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllStats(): Promise<CmsStat[]> {
  const { data, error } = await supabase.from('cms_stats').select('*').order('order_index');
  if (error) throw error;
  return data ?? [];
}

export async function upsertStat(stat: Partial<CmsStat> & { id?: string }): Promise<CmsStat> {
  const { data, error } = await supabase.from('cms_stats').upsert(stat).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStat(id: string): Promise<void> {
  const { error } = await supabase.from('cms_stats').delete().eq('id', id);
  if (error) throw error;
}
