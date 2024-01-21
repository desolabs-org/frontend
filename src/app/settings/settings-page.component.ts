import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { BackendApiService } from 'src/lib/services/backend-api';
import { Title } from '@angular/platform-browser';
import { ThemeService } from 'src/lib/theme/theme.service';
import { environment } from 'src/environments/environment';
import { SwalHelper } from 'src/lib/helpers/swal-helper';
import { Router } from '@angular/router';

@Component({
  selector: 'settings-page',
  templateUrl: './settings-page.component.html',
})
export class SettingsPageComponent implements OnInit {
  loading = false;
  updatingSettings = false;
  showSuccessMessage = false;
  successMessageTimeout: any;

  constructor(
    public globalVars: GlobalVarsService,
    private titleService: Title,
    public themeService: ThemeService,
  ) {}

  selectChangeHandler(event: any) {
    const newTheme = event.target.value;
    this.themeService.setTheme(newTheme);
  }

  ngOnInit() {
    this.titleService.setTitle(`Settings - ${environment.node.name}`);
  }
}
