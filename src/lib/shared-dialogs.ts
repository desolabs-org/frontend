import { RouteNames } from 'src/app/app-routing.module';
import { SwalHelper } from './helpers/swal-helper';
import { GlobalVarsService } from 'src/lib/services/global-vars';
import { Router } from '@angular/router';

export class SharedDialogs {

  static showCreateAccountToPostDialog(globalVars: GlobalVarsService) {
    return SwalHelper.fire({
      target: globalVars.getTargetComponentSelector(),
      icon: 'info',
      title: `Create an account to post`,
      html: `It's totally anonymous and takes under a minute.`,
      showCancelButton: true,
      showConfirmButton: true,
      focusConfirm: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      confirmButtonText: 'Create an account',
      cancelButtonText: 'Nevermind',
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        globalVars.launchAuthFlow();
      }
    });
  }

  static showCreateProfileToPostDialog(router: Router) {
    SwalHelper.fire({
      target: GlobalVarsService.getTargetComponentSelectorFromRouter(router),
      icon: 'info',
      title: `Complete your profile to post`,
      html: `You can be whoever you want to be.`,
      showCancelButton: true,
      showConfirmButton: true,
      focusConfirm: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      confirmButtonText: 'Complete Your Profile',
      cancelButtonText: 'Nevermind',
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        router.navigate(['/' + RouteNames.UPDATE_PROFILE], {
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  static showCreateProfileToPerformActionDialog(
    router: Router,
    action: string
  ) {
    SwalHelper.fire({
      target: GlobalVarsService.getTargetComponentSelectorFromRouter(router),
      icon: 'info',
      title: `Complete your profile to ${action}`,
      html: `You can be whoever you want to be.`,
      showCancelButton: true,
      showConfirmButton: true,
      focusConfirm: true,
      customClass: {
        confirmButton: 'btn btn-light',
        cancelButton: 'btn btn-light no',
      },
      confirmButtonText: 'Complete Your Profile',
      cancelButtonText: 'Nevermind',
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        router.navigate(['/' + RouteNames.UPDATE_PROFILE], {
          queryParamsHandling: 'merge',
        });
      }
    });
  }
}
