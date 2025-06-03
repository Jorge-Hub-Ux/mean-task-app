import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTING } from '../../shared/models/routes.model';

@Component({
  selector: 'app-auth',
  imports: [],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  constructor(private router: Router) {}

  goToTasks() {
    this.router.navigate([`/${APP_ROUTING.TASKS}`]);
  }
}
