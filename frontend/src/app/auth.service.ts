import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private webService: WebRequestService,
    private router: Router
  ) {}

  logIn(email: string, password: string) {
    return this.webService.logIn(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        //the auth tokens will be in the header of the response
        this.setSession(
          res.body._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token')
        );

        console.log('Logged In');
      })
    );
  }

  signUp(email: string, password: string) {
    return this.webService.signUp(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        //the auth tokens will be in the header of the response
        this.setSession(
          res.body._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token')
        );

        console.log('Successfully signed up and now logged in!');
      })
    );
  }

  logout() {
    this.removeSession();
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken);
  }

  getUserId() {
    return localStorage.getItem('user-id');
  }

  private setSession(
    userId: string,
    accessToken: string,
    refreshToken: string
  ) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('access-token', accessToken);
    localStorage.setItem('refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
  }

  getNewAccessToken() {
    return this.http
      .get(`${this.webService.ROOT_URL}/users/me/access-token`, {
        headers: {
          'x-refresh-token': this.getRefreshToken(),
          _id: this.getUserId(),
        },
        observe: 'response',
      })
      .pipe(
        tap((res: HttpResponse<any>) => {
          this.setAccessToken(res.headers.get('x-access-token'));
        })
      );
  }
}
