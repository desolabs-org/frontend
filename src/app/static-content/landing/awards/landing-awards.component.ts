import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { Router } from '@angular/router';

@Component({
  selector: 'landing-awards',
  templateUrl: './landing-awards.component.html',
})
export class LandingAwardsComponent implements OnInit {
  AppRoutingModule = AppRoutingModule;

  featuredSupporters = [];

  constructor(public globalVars: GlobalVarsService, private router: Router, private backendApi: BackendApiService) {}

  ngOnInit() {
    this.backendApi
      .GetHodlersForPublicKey(this.globalVars.localNode, '', 'DeSoLabs', '', 0, false, true, false)
      .toPromise()
      .then((res) => {
        this.featuredSupporters = res.Hodlers.filter(i => i.BalanceNanos > 100_000 && i.ProfileEntryResponse !== undefined);
      });
  }
}
