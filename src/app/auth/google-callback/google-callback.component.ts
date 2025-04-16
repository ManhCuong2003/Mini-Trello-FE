import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-google-callback',
  imports: [],
  template: ` <p>Processing login...</p> `,
  styles: ``,
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token']
      const userId = params['userId']
      const name = params['name']

      if (token) {
        const userData = {id: userId, name}
        this.authService.handleGoogleCallback(token, userData)
      } else {
        console.error('Không nhận được token từ callback Google')
        this.router.navigate(['/auth/login'], { queryParams: { error: 'GoogleAuthFailed' } });
      }
    })
  }

}
