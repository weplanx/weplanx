import { Component } from '@angular/core';

import { WpxService } from '@weplanx/ng';

@Component({
  selector: 'app-resources-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent {
  constructor(public wpx: WpxService) {}
}