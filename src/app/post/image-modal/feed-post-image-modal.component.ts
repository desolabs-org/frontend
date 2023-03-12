import { Component, Input } from '@angular/core';
import { GlobalVarsService } from 'src/lib/services/global-vars';

@Component({
  selector: 'feed-post-image-modal',
  templateUrl: './feed-post-image-modal.component.html',
  styleUrls: ['./feed-post-image-modal.component.scss'],
})
export class FeedPostImageModalComponent {
  @Input() imageURL: string;

  constructor(public globalVars: GlobalVarsService) {}
}
