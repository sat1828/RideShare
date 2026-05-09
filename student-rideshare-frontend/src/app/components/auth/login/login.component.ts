// ========================================
// AUTHENTICATION COMPONENTS
// ========================================

// ----------------------------------------
// 10. src/app/components/auth/login/login.component.ts
// ----------------------------------------
import { Component,NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}

// ----------------------------------------
// 13. src/app/components/auth/register/register.component.html
// ----------------------------------------
/*
<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
  <div class="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
    <div>
      <h2 class="text-center text-3xl font-extrabold text-white">
        Create Account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        Join the student ride sharing community
      </p>
    </div>
    
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
      <div class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
          <input 
            id="username" 
            formControlName="username" 
            type="text" 
            required
            class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Choose a username">
          <p *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" 
             class="mt-1 text-xs text-red-400">
            Username must be at least 3 characters
          </p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">Email</label>
          <input 
            id="email" 
            formControlName="email" 
            type="email" 
            required
            class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="your.email@student.com">
          <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
             class="mt-1 text-xs text-red-400">
            Please enter a valid email
          </p>
        </div>

        <div>
          <label for="phoneNumber" class="block text-sm font-medium text-gray-300">Phone Number</label>
          <input 
            id="phoneNumber" 
            formControlName="phoneNumber" 
            type="tel" 
            required
            class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="10-digit phone number">
          <p *ngIf="registerForm.get('phoneNumber')?.invalid && registerForm.get('phoneNumber')?.touched" 
             class="mt-1 text-xs text-red-400">
            Please enter a valid 10-digit phone number
          </p>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input 
            id="password" 
            formControlName="password" 
            type="password" 
            required
            class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Create a password">
          <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
             class="mt-1 text-xs text-red-400">
            Password must be at least 6 characters
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">I want to be a:</label>
          <div class="space-y-2">
            <label class="flex items-center cursor-pointer">
              <input type="radio" formControlName="role" value="RIDER" class="mr-2">
              <span class="text-white">Rider (Offer rides)</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="radio" formControlName="role" value="PILLION" class="mr-2">
              <span class="text-white">Pillion (Find rides)</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="radio" formControlName="role" value="BOTH" class="mr-2">
              <span class="text-white">Both</span>
            </label>
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>

      <button 
        type="submit" 
        [disabled]="!registerForm.valid || isLoading"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        <span *ngIf="!isLoading">Create Account</span>
        <span *ngIf="isLoading">Creating Account...</span>
      </button>

      <div class="text-center">
        <a routerLink="/login" class="text-sm text-indigo-400 hover:text-indigo-300">
          Already have an account? Sign in
        </a>
      </div>
    </form>
  </div>
</div>
*/

// ----------------------------------------
// 11. src/app/components/auth/login/login.component.html
// ----------------------------------------
/*
<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
  <div class="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
    <div>
      <h2 class="text-center text-3xl font-extrabold text-white">
        Student Ride Share
      </h2>
      <p class="mt-2 text-center text-sm text-gray-400">
        Sign in to your account
      </p>
    </div>
    
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
      <div class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300">Username</label>
          <input 
            id="username" 
            formControlName="username" 
            type="text" 
            required
            class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your username">
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
          <input 
            id="password" 
            formControlName="password" 
            type="password" 
            required
            class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your password">
        </div>
      </div>

      <div *ngIf="errorMessage" class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <button 
        type="submit" 
        [disabled]="!loginForm.valid || isLoading"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
        <span *ngIf="!isLoading">Sign in</span>
        <span *ngIf="isLoading">Signing in...</span>
      </button>

      <div class="text-center">
        <a routerLink="/register" class="text-sm text-indigo-400 hover:text-indigo-300">
          Don't have an account? Register here
        </a>
      </div>
    </form>
  </div>
</div>
*/
