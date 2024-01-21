import { Component } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'bid-placed-modal',
  templateUrl: './bid-placed-modal.component.html',
})
export class BidPlacedModalComponent {
  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    public globalVars: GlobalVarsService
  ) {}

}
