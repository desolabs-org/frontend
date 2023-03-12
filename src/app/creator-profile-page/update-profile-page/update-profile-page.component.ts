import { Component } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'app-update-profile-page',
  templateUrl: './update-profile-page.component.html',
  styleUrls: ['./update-profile-page.component.scss'],
})
export class UpdateProfilePageComponent {
  constructor(public globalVars: GlobalVarsService) {}
}
