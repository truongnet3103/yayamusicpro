import { useState, useEffect } from 'react';
import {
  getPublishedCourses,
  getPublishedPosts,
  getPublishedTestimonials,
  getPublishedStats,
} from '../services/cmsService';
import type { CmsCourse, CmsPost, CmsTestimonial, CmsStat } from '../types';

export function usePublishedCourses(schoolId?: string) {
  const [courses, setCourses] = useState<CmsCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedCourses(schoolId)
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [schoolId]);

  return { courses, loading };
}

export function usePublishedPosts(schoolId?: string, category?: string) {
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedPosts(schoolId, category)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [schoolId, category]);

  return { posts, loading };
}

export function usePublishedTestimonials(schoolId?: string) {
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedTestimonials(schoolId)
      .then(setTestimonials)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [schoolId]);

  return { testimonials, loading };
}

export function usePublishedStats(schoolId?: string) {
  const [stats, setStats] = useState<CmsStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedStats(schoolId)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [schoolId]);

  return { stats, loading };
}
