import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { NoteService } from './note.service';
import { Note } from '../models/note';

@Injectable({
  providedIn: 'root',
})
export class NoteResolverService implements Resolve<Note> {
  constructor(private noteService: NoteService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Note> | Promise<Note> | Note {
    const id = route.paramMap.get('id') || '';
    return this.noteService.getNoteById(id);
  }
}
