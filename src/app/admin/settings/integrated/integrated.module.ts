import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShareModule } from '@common/share.module';

import { CloudComponent } from './cloud/cloud.component';
import { CosComponent } from './cos/cos.component';
import { EmailComponent } from './email/email.component';
import { IntegratedComponent } from './integrated.component';
import { OfficeComponent } from './office/office.component';
import { OpenapiComponent } from './openapi/openapi.component';
import { RedirectComponent } from './redirect/redirect.component';

const routes: Routes = [
  {
    path: '',
    component: IntegratedComponent
  }
];

@NgModule({
  imports: [ShareModule, RouterModule.forChild(routes)],
  declarations: [
    IntegratedComponent,
    CloudComponent,
    CosComponent,
    OfficeComponent,
    RedirectComponent,
    EmailComponent,
    OpenapiComponent
  ]
})
export class IntegratedModule {}