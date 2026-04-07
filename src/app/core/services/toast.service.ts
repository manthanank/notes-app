import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: { message: string; class: string }[] = [];
  
  constructor() {}

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    this.toasts.push({ message, class: type });
    setTimeout(() => this.toasts.shift(), 3000);
  }
}
