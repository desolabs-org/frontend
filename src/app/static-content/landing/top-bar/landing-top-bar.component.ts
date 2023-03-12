import { Component } from '@angular/core';
import { RouteNames } from 'src/app/app-routing.module';

@Component({
  selector: 'landing-top-bar',
  templateUrl: './landing-top-bar.component.html',
})
export class LandingTopBarComponent  {

  RouteNames = RouteNames;
  
  constructor() {}
}
