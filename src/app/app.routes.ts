import { Routes } from '@angular/router';
import { NoteListComponent } from './components/note-list/note-list.component';
import { NoteDetailsComponent } from './components/note-details/note-details.component';
import { NoteFormComponent } from './components/note-form/note-form.component';

export const routes: Routes = [
    { path: '', redirectTo: '/notes', pathMatch: 'full' },
    { path: 'notes', component: NoteListComponent },
    { path: 'notes/new', component: NoteFormComponent },
    { path: 'notes/:id', component: NoteDetailsComponent },
];
