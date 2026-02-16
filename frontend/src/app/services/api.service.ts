import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  hero_image_url: string | null;
  excerpt: string;
  author_name: string;
  read_time_minutes: number;
  published_at: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content_html: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  acreage?: string;
  crop_type?: string;
  message: string;
  source?: string;
  website?: string;
  _form_loaded_at?: number;
}

export interface WaitlistRequest {
  email: string;
  name?: string;
  company?: string;
  interest?: string;
  website?: string;
  _form_loaded_at?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface AdminStats {
  total_contacts: number;
  total_waitlist: number;
  contacts_today: number;
  waitlist_today: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  acreage: string | null;
  crop_type: string | null;
  message: string;
  source: string;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  interest: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getBlogPosts(limit = 10, offset = 0): Observable<BlogPostSummary[]> {
    return this.http.get<BlogPostSummary[]>(
      `${this.baseUrl}/blog?limit=${limit}&offset=${offset}`
    );
  }

  getBlogPost(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.baseUrl}/blog/${slug}`);
  }

  submitContact(data: ContactRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/contact`, data);
  }

  joinWaitlist(data: WaitlistRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/waitlist`, data);
  }

  getAdminStats(token: string): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getAdminContacts(token: string, limit = 100, offset = 0): Observable<ContactSubmission[]> {
    return this.http.get<ContactSubmission[]>(
      `${this.baseUrl}/admin/contacts?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }

  getAdminWaitlist(token: string, limit = 100, offset = 0): Observable<WaitlistEntry[]> {
    return this.http.get<WaitlistEntry[]>(
      `${this.baseUrl}/admin/waitlist?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }
}
