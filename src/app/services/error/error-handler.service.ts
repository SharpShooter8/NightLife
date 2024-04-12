import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum ErrorType {
  EmptyError = 'noerror',
  General = 'general',
  Profile = 'profile',
  UserDatabase = 'userdatabase',
  // Add more error types as needed
}

export interface CustomError {
  type: ErrorType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorSubject: BehaviorSubject<CustomError> = new BehaviorSubject<CustomError>({type: ErrorType.EmptyError, message: ''});

  constructor() { }

  handleError(error: any, type: ErrorType = ErrorType.General): void {
    const errorMessage = this.extractErrorContent(error);
    const customError: CustomError = { type, message: errorMessage };

    // Log error to console
    console.error(`[${type}] An error occurred:`, error);

    // Emit error to subscribers
    this.errorSubject.next(customError);
  }

  getError(): Observable<CustomError> {
    return this.errorSubject.asObservable();
  }

  clearError(): void {
    this.errorSubject.next({type: ErrorType.EmptyError, message: ''});
  }

  private extractErrorContent(error: any): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      return 'An unknown error occurred.';
    }
  }
}
