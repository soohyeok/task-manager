import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss'],
})
export class SignupPageComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onSignUpButtonClicked(email: string, password: string) {
    this.authService
      .signUp(email, password)
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        this.router.navigate(['/lists']);
      });
  }
}
