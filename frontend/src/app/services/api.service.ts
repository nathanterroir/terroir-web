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
}

export interface WaitlistRequest {
  email: string;
  name?: string;
  company?: string;
  interest?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
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
}
