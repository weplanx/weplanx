import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShareModule } from '@common/share.module';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'managed',
        loadChildren: () => import('./managed/managed.module').then(m => m.ManagedModule),
        data: {
          breadcrumb: $localize`管理中`
        }
      },
      { path: '', redirectTo: 'managed', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [ShareModule, RouterModule.forChild(routes)]
})
export class ProjectsModule {}