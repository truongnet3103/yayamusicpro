export interface PriceItem {
  level: string;
  original: string | null;
  sale: string;
}

export interface PriceGroup {
  group: string;
  items: PriceItem[];
}

export interface CmsCourse {
  id: string;
  school_id: string | null;
  order_index: number;
  published: boolean;
  icon: string | null;
  number_label: string;
  title: string;
  subtitle: string | null;
  description: string;
  duration: string | null;
  age_range: string | null;
  price_groups: PriceGroup[];
  created_at: string;
  updated_at: string;
}

export interface CmsPost {
  id: string;
  school_id: string | null;
  order_index: number;
  published: boolean;
  category: 'news' | 'event' | 'highlight';
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  event_date: string | null;
  event_venue: string | null;
  cta_label: string | null;
  cta_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CmsTestimonial {
  id: string;
  school_id: string | null;
  order_index: number;
  published: boolean;
  quote: string;
  author_name: string;
  author_role: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsStat {
  id: string;
  school_id: string | null;
  order_index: number;
  published: boolean;
  label: string;
  value: number;
  suffix: string;
  created_at: string;
  updated_at: string;
}

export type CmsCourseInput = Omit<CmsCourse, 'id' | 'created_at' | 'updated_at'>;
export type CmsPostInput = Omit<CmsPost, 'id' | 'created_at' | 'updated_at'>;
export type CmsTestimonialInput = Omit<CmsTestimonial, 'id' | 'created_at' | 'updated_at'>;
export type CmsStatInput = Omit<CmsStat, 'id' | 'created_at' | 'updated_at'>;
