import { Component, inject, OnInit, signal } from '@angular/core';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { RouterLink } from '@angular/router';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgClass, DatePipe } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-note-list',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, NgClass, DatePipe, DragDropModule],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent implements OnInit {
  notes: Note[] = []; // Initialize as an empty array
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  search = signal<string>('');
  searchControl = new FormControl('');
  private searchSubject = new Subject<string>();
  currentPage = signal<number>(1);
  limit = signal<number>(10);
  totalPages = signal<number>(1);
  currentTab = signal<'active' | 'archived' | 'trashed'>('active');
  folders = signal<string[]>([]);
  currentFolder = signal<string>('All');
  sortBy = signal<string>('createdAt');
  sortOrder = signal<string>('desc');

  toastService = inject(ToastService);
  noteService = inject(NoteService);

  constructor() {}

  ngOnInit(): void {
    this.getFolders();
    this.getNotes();
    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm) => {
      this.onSearch();
    });
  }

  getFolders(): void {
    this.noteService.getFolders().subscribe({
      next: (folders) => this.folders.set(folders),
      error: (err) => console.error('Failed to load folders', err)
    });
  }

  getNotes(): void {
    this.isLoading.set(true);
    this.error.set(''); // Reset error state before new request
    
    this.noteService.getNotes(this.currentPage(), this.limit(), this.currentTab(), this.currentFolder(), this.sortBy(), this.sortOrder()).subscribe({
      next: (response) => {
        if (response && response.notes) {
          this.notes = response.notes;
          this.totalPages.set(response.totalPages || 1);
          this.checkReminders();
        } else {
          this.notes = [];
          this.totalPages.set(1);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.notes = []; // Ensure notes is always an array
        this.isLoading.set(false);
        this.error.set(error?.error?.message || 'An error occurred');
        this.toastService.show(
          error?.error?.message || 'An error occurred',
          'error'
        );
      },
    });
  }

  onSearch(): void {
    const query = this.searchControl.value?.trim();
    if (query) {
      this.isLoading.set(true);
      this.noteService.searchNotes(query, this.currentPage(), this.limit(), this.currentTab(), this.currentFolder(), this.sortBy(), this.sortOrder()).subscribe({
        next: (response) => {
            // Handle if response is an array instead of a paginated object
            if (Array.isArray(response)) {
              this.notes = response;
              this.totalPages.set(1); // Since we're not getting pagination info
            } else if (response && response.notes) {
              this.notes = response.notes;
              this.totalPages.set(response.totalPages || 1);
            } else {
              this.notes = [];
              this.totalPages.set(1);
            }
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error(error);
            this.notes = []; // Ensure notes is always an array
            this.isLoading.set(false);
            this.error.set(error?.error?.message || 'An error occurred');
            this.toastService.show(
              error?.error?.message || 'An error occurred',
              'error'
            );
          },
      });
    } else {
      this.getNotes();
    }
  }

  private performSearch(searchTerm: string): void {
    if (searchTerm || this.currentFolder() !== 'All') {
      this.isLoading.set(true);
      this.error.set(''); // Reset error state
      
      this.noteService
        .searchNotes(searchTerm, this.currentPage(), this.limit(), this.currentTab(), this.currentFolder(), this.sortBy(), this.sortOrder())
        .subscribe({
          next: (response) => {
            // Handle if response is an array instead of a paginated object
            if (Array.isArray(response)) {
              this.notes = response;
              this.totalPages.set(1); // Since we're not getting pagination info
            } else if (response && response.notes) {
              this.notes = response.notes;
              this.totalPages.set(response.totalPages || 1);
            } else {
              this.notes = [];
              this.totalPages.set(1);
            }
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error(error);
            this.notes = []; // Ensure notes is always an array
            this.isLoading.set(false);
            this.error.set(error?.error?.message || 'An error occurred');
            this.toastService.show(
              error?.error?.message || 'An error occurred',
              'error'
            );
          },
        });
    } else {
      this.getNotes();
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.getNotes();
  }

  // Helper method to generate pagination array
  getPaginationArray(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Show at most 5 page numbers
    const maxPages = 5;
    
    if (total <= maxPages) {
      // If total pages is less than max, show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, start + 2);
      
      // Adjust start if end is at max
      if (end === total - 1) {
        start = Math.max(2, end - 2);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // Use -1 to represent ellipsis
      }
      
      // Add pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < total - 1) {
        pages.push(-1); // Use -1 to represent ellipsis
      }
      
      // Always include last page
      pages.push(total);
    }
    
    return pages;
  }

  togglePin(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    const newPinStatus = !note.isPinned;
    // Optimistic UI update
    note.isPinned = newPinStatus;
    
    // Re-sort notes locally immediately
    this.notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    this.noteService.updateNote(note._id, { isPinned: newPinStatus }).subscribe({
      next: () => {
        this.toastService.show(newPinStatus ? 'Note pinned' : 'Note unpinned', 'success');
      },
      error: (error) => {
        // Revert on error
        note.isPinned = !newPinStatus;
        this.notes.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        console.error(error);
        this.toastService.show(error?.error?.message || 'Failed to update pin status', 'error');
      }
    });
  }

  setTab(tab: 'active' | 'archived' | 'trashed'): void {
    this.currentTab.set(tab);
    this.currentPage.set(1);
    this.getNotes();
  }

  onFolderChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentFolder.set(select.value);
    this.currentPage.set(1);
    const query = this.searchControl.value?.trim();
    if (query) {
      this.onSearch();
    } else {
      this.getNotes();
    }
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const [by, order] = select.value.split('-');
    this.sortBy.set(by);
    this.sortOrder.set(order);
    this.currentPage.set(1);
    
    const query = this.searchControl.value?.trim();
    if (query) {
      this.onSearch();
    } else {
      this.getNotes();
    }
  }

  drop(event: CdkDragDrop<Note[]>): void {
    if (this.sortBy() !== 'order') {
      this.toastService.show('Drag and drop only works when sorted by Custom Order', 'info');
      return;
    }
    
    moveItemInArray(this.notes, event.previousIndex, event.currentIndex);
    
    const updates = this.notes.map((note, index) => ({
      id: note._id,
      order: index
    }));
    
    this.noteService.reorderNotes(updates).subscribe({
      next: () => {
        // success silently
      },
      error: (err) => {
        this.toastService.show('Failed to save order', 'error');
        this.getNotes(); // revert
      }
    });
  }

  archiveNote(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.noteService.updateNote(note._id, { isArchived: true }).subscribe({
      next: () => {
        this.toastService.show('Note archived', 'success');
        this.getNotes(); // Refresh list
      },
      error: (err) => this.toastService.show(err?.error?.message || 'Failed to archive', 'error')
    });
  }

  unarchiveNote(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.noteService.updateNote(note._id, { isArchived: false }).subscribe({
      next: () => {
        this.toastService.show('Note unarchived', 'success');
        this.getNotes();
      },
      error: (err) => this.toastService.show(err?.error?.message || 'Failed to unarchive', 'error')
    });
  }

  trashNote(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.noteService.deleteNote(note._id, false).subscribe({
      next: () => {
        this.toastService.show('Note moved to trash', 'success');
        this.getNotes();
      },
      error: (err) => this.toastService.show(err?.error?.message || 'Failed to trash', 'error')
    });
  }

  restoreNote(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.noteService.updateNote(note._id, { isTrashed: false, isArchived: false }).subscribe({
      next: () => {
        this.toastService.show('Note restored', 'success');
        this.getNotes();
      },
      error: (err) => this.toastService.show(err?.error?.message || 'Failed to restore', 'error')
    });
  }

  checkReminders(): void {
    const now = new Date();
    let reminderCount = 0;
    this.notes.forEach(note => {
      if (note.reminderDate) {
        const reminderDate = new Date(note.reminderDate);
        if (reminderDate > now && reminderDate.getTime() - now.getTime() < 86400000) { // Within next 24 hours
          reminderCount++;
        }
      }
    });
    if (reminderCount > 0) {
      setTimeout(() => {
        this.toastService.show(`You have ${reminderCount} note(s) with an upcoming reminder!`, 'info');
      }, 1000);
    }
  }

  shareNote(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    const newPublicStatus = !note.isPublic;
    
    this.noteService.updateNote(note._id, { isPublic: newPublicStatus }).subscribe({
      next: () => {
        note.isPublic = newPublicStatus;
        if (newPublicStatus) {
          const url = `${window.location.origin}/shared/${note._id}`;
          navigator.clipboard.writeText(url).then(() => {
            this.toastService.show('Link copied to clipboard!', 'success');
          }).catch(() => {
            this.toastService.show('Note is public. Link: ' + url, 'success');
          });
        } else {
          this.toastService.show('Note is now private', 'success');
        }
      },
      error: (err) => this.toastService.show(err?.error?.message || 'Failed to update share status', 'error')
    });
  }

  deletePermanently(note: Note, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
      this.noteService.deleteNote(note._id, true).subscribe({
        next: () => {
          this.toastService.show('Note permanently deleted', 'success');
          this.getNotes();
        },
        error: (err) => this.toastService.show(err?.error?.message || 'Failed to delete', 'error')
      });
    }
  }

  exportNote(note: Note, format: 'markdown' | 'json', event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'markdown') {
      content = `# ${note.title}\n\n`;
      content += `**Folder:** ${note.folder || 'General'}\n\n`;
      if (note.tags && note.tags.length > 0) {
        content += `**Tags:** ${note.tags.map((t: string) => `#${t}`).join(' ')}\n\n`;
      }
      if (note.summary) {
        content += `> **Summary:** ${note.summary}\n\n`;
      }
      content += `---\n\n${note.content}`;
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      mimeType = 'text/markdown';
    } else if (format === 'json') {
      content = JSON.stringify(note, null, 2);
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.toastService.show(`Note exported as ${format.toUpperCase()}`, 'success');
  }
}
