import { Component } from '@angular/core';
import { RouteNames } from 'src/app/app-routing.module';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  RouteNames = RouteNames;
  environment = environment;


  constructor(public globalVars: GlobalVarsService) {}
}
