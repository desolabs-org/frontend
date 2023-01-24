import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from '../../app-routing.module';
import { GlobalVarsService } from '../../global-vars.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-index',
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
          '/' + this.globalVars.RouteNames.BROWSE
        ], { queryParamsHandling: 'merge' });
    }
  }
}
