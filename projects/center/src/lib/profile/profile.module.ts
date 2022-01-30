import { NgModule } from '@angular/core';

import { WpxModule, WpxShareModule } from '@weplanx/common';

import { ProfileComponent } from './profile.component';

@NgModule({
  imports: [WpxModule, WpxShareModule],
  declarations: [ProfileComponent],
  exports: [ProfileComponent]
})
export class ProfileModule {}
