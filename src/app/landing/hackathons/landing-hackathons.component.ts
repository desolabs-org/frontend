import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from '../../app-routing.module';
import { GlobalVarsService } from '../../global-vars.service';
import { BackendApiService } from '../../backend-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'landing-hackathons',
  templateUrl: './landing-hackathons.component.html',
})
export class LandingHackathonsComponent implements OnInit {
  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService, private router: Router, private backendApi: BackendApiService) {}

  ngOnInit() {

  }
}
