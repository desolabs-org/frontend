import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from '../global-vars.service';
import { BackendApiService } from '../backend-api.service';
import { Title } from '@angular/platform-browser';
import { ThemeService } from '../theme/theme.service';
import { environment } from 'src/environments/environment';
import { SwalHelper } from '../../lib/helpers/swal-helper';
import { Router } from '@angular/router';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  loading = false;
  updatingSettings = false;
  showSuccessMessage = false;
  successMessageTimeout: any;

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private titleService: Title,
    public themeService: ThemeService,
    private router: Router
  ) {}

  selectChangeHandler(event: any) {
    const newTheme = event.target.value;
    this.themeService.setTheme(newTheme);
  }

  ngOnInit() {
    this.titleService.setTitle(`Settings - ${environment.node.name}`);
  }
}
