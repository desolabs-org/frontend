import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { AppRoutingModule, RouteNames } from '../app-routing.module';
import { MessagesInboxComponent } from '../messages-page/messages-inbox/messages-inbox.component';
import { IdentityService } from '../identity.service';
import { BackendApiService } from '../backend-api.service';
import { Router } from '@angular/router';
import { SwalHelper } from '../../lib/helpers/swal-helper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'left-bar',
  templateUrl: './left-bar.component.html',
  styleUrls: ['./left-bar.component.sass'],
})
export class LeftBarComponent {
  MessagesInboxComponent = MessagesInboxComponent;
  environment = environment;

  @HostBinding('class') get classes() {
    return !this.isMobile ? 'global__nav__flex' : '';
  }

  @Input() isMobile = false;
  @Output() closeMobile = new EventEmitter<boolean>();
  currentRoute: string;

  AppRoutingModule = AppRoutingModule;

  constructor(
    public globalVars: GlobalVarsService,
    private identityService: IdentityService,
    private backendApi: BackendApiService,
    private router: Router
  ) {}

  getHelpMailToAttr(): string {
    const loggedInUser = this.globalVars.loggedInUser;
    const pubKey = loggedInUser?.PublicKeyBase58Check;
    const btcAddress = this.identityService.identityServiceUsers[pubKey]
      ?.btcDepositAddress;
    const bodyContent = encodeURIComponent(
      `The below information helps support address your case.\nMy public key: ${pubKey} \nMy BTC Address: ${btcAddress}`
    );
    const body = loggedInUser ? `?body=${bodyContent}` : '';
    return `mailto:${environment.supportEmail}${body}`;
  }

  logHelp(): void {
    this.globalVars.logEvent('help : click');
  }
}
