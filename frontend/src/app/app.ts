import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutoLoginService } from './services/auto-login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('StayFinder');
  
  constructor(private autoLoginService: AutoLoginService) {}
  
  ngOnInit(): void {
    // Auto-login the default user when the application starts
    this.autoLoginService.autoLogin();
  }
}
