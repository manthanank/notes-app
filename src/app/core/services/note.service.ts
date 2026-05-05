import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Note, Notes } from '../models/note';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private apiUrl = environment.apiUrl + '/notes';

  constructor(private http: HttpClient) {}

  getNotes(page: number = 1, limit: number = 10, status: string = 'active', folder?: string, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Observable<Notes> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status)
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (folder && folder !== 'All') {
      params = params.set('folder', folder);
    }

    return this.http.get<Notes>(this.apiUrl, { params });
  }

  getFolders(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/folders`);
  }

  searchNotes(query: string, page: number = 1, limit: number = 10, status: string = 'active', folder?: string, sortBy: string = 'createdAt', sortOrder: string = 'desc'): Observable<Notes> {
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status)
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);
  
    if (folder && folder !== 'All') {
      params = params.set('folder', folder);
    }

    return this.http.get<Notes>(`${this.apiUrl}/search`, { params });
  }

  reorderNotes(updates: { id: string, order: number }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/reorder`, { updates });
  }

  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`);
  }

  getSharedNote(id: string): Observable<Note> {
    // The shared route is outside /notes, let's construct the URL
    // Actually, backend route is /api/notes/shared/:id, so it's under this.apiUrl
    return this.http.get<Note>(`${this.apiUrl}/shared/${id}`);
  }

  createNote(note: Partial<Note>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, note);
  }

  generateTags(title: string, content: string): Observable<{ tags: string[] }> {
    return this.http.post<{ tags: string[] }>(`${this.apiUrl}/ai/tags`, { title, content });
  }

  continueWriting(content: string): Observable<{ continuation: string }> {
    return this.http.post<{ continuation: string }>(`${this.apiUrl}/ai/continue`, { content });
  }

  extractActionItems(content: string): Observable<{ actionItems: string }> {
    return this.http.post<{ actionItems: string }>(`${this.apiUrl}/ai/action-items`, { content });
  }

  updateNote(id: string, note: Partial<Note>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: string, permanent: boolean = false): Observable<{ message: string }> {
    const params = new HttpParams().set('permanent', permanent ? 'true' : 'false');
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { params });
  }
}
