import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { RouteNames } from '../../app-routing.module';
import { IdentityService } from 'src/lib/services/identity';

@Component({
  selector: 'update-profile-get-starter-deso',
  templateUrl: './update-profile-get-starter-deso.component.html',
  styleUrls: ['./update-profile-get-starter-deso.component.scss'],
})
export class UpdateProfileGetStarterDeSoComponent {
  RouteNames = RouteNames;

  constructor(
    public globalVars: GlobalVarsService,
    private identityService: IdentityService
  ) {}

  // rounded to nearest integer
  minPurchaseAmountInUsdRoundedUp() {
    const satoshisPerBitcoin = 1e8;
    let minimumInBitcoin =
      this.globalVars.minSatoshisBurnedForProfileCreation / satoshisPerBitcoin;
    return Math.ceil(
      this.globalVars.usdPerBitcoinExchangeRate * minimumInBitcoin
    );
  }

  getCreateProfileMessage(): string {
    return 'You need to verify a phone number or purchase DESO with Bitcoin in order to create a profile. This helps prevent spam.';
  }

  launchPhoneNumberVerification() {
    this.identityService
      .launchPhoneNumberVerification(
        this.globalVars?.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe((res) => {
        if (res.phoneNumberSuccess) {
          this.globalVars.updateEverything();
        }
      });
  }
}
