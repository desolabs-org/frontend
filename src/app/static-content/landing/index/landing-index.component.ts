import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { Router } from '@angular/router';

@Component({
  selector: 'landing-index',
  templateUrl: './landing-index.component.html',
})
export class LandingIndexComponent implements OnInit {
  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService, private router: Router) {}

  ngOnInit() {  
    if (this.globalVars.showLandingPage()) {
      this.router.navigate(
        [
          '/' + this.globalVars.RouteNames.LANDING
        ], { queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(
        [
          '/' + this.globalVars.RouteNames.FEEDS
        ], { queryParamsHandling: 'merge' });
    }
  }
}
