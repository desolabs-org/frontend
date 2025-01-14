import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'left-bar-mobile',
  templateUrl: './left-bar-mobile.component.html',
  animations: [
    trigger('leftBarAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-85%)' }),
        animate('250ms ease', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        style({ transform: 'translateX(0%)' }),
        animate('250ms ease', style({ transform: 'translateX(-85%)' })),
      ]),
    ]),
    trigger('translucentBackgroundAnimation', [
      transition(':enter', [
        style({ 'background-color': 'rgba(0, 0, 0, 0)' }),
        animate(
          '250ms ease',
          style({ 'background-color': 'rgba(0, 0, 0, 0.4)' })
        ),
      ]),
      transition(':leave', [
        style({ 'background-color': 'rgba(0, 0, 0, 0.4)' }),
        animate(
          '250ms ease',
          style({ 'background-color': 'rgba(0, 0, 0, 0)' })
        ),
      ]),
    ]),
  ],
})
export class LeftBarMobileComponent {

  constructor(public globalVars: GlobalVarsService) {}

  _closeMenu() {
    this.globalVars.isLeftBarMobileOpen = false;
  }
}
