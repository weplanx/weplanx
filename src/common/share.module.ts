import { ScrollingModule } from '@angular/cdk/scrolling';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { WpxModule, WpxShareModule } from '@weplanx/ng';
import { WpxKeywordModule } from '@weplanx/ng/keyword';
import { WpxListModule } from '@weplanx/ng/list';
import { WpxTableModule } from '@weplanx/ng/table';
import { WpxToolboxModule } from '@weplanx/ng/toolbox';
import { WpxUploadModule } from '@weplanx/ng/upload';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';

@NgModule({
  exports: [
    RouterModule,
    WpxModule,
    WpxShareModule,
    WpxKeywordModule,
    WpxToolboxModule,
    WpxUploadModule,
    WpxTableModule,
    WpxListModule,
    NzCodeEditorModule,
    NzQRCodeModule,
    ScrollingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShareModule {}
