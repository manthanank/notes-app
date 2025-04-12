import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.auth.redirectToNotes();
    }
  }
}
