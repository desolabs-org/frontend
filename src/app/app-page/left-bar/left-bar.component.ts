import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { AppRoutingModule, RouteNames } from 'src/app/app-routing.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'left-bar',
  templateUrl: './left-bar.component.html',
})
export class LeftBarComponent {
  environment = environment;

  @HostBinding('class') get classes() {
    return !this.isMobile ? 'global__nav__flex' : '';
  }

  @Input() isMobile = false;
  @Output() closeMobile = new EventEmitter<boolean>();
  currentRoute: string;

  AppRoutingModule = AppRoutingModule;

  constructor(
    public globalVars: GlobalVarsService
  ) {}
}
