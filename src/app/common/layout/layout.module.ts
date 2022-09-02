import { NgModule } from '@angular/core';

import { ShareModule } from '@common/share.module';

import { LayoutComponent } from './layout.component';

@NgModule({
  imports: [ShareModule],
  declarations: [LayoutComponent],
  exports: [LayoutComponent]
})
export class LayoutModule {}