import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;

  summarize(content: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.apiUrl}/summarize`, { content });
  }

  generateTags(title: string, content: string): Observable<{ tags: string[] }> {
    return this.http.post<{ tags: string[] }>(`${this.apiUrl}/tags`, { title, content });
  }
}
