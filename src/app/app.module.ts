import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { ShareModule } from '@common/share.module';
import { TranslationModule } from '@common/translation/translation.module';
import { environment } from '@env';
import { WpxRichtextModule } from '@weplanx/ng/richtext';
import { WpxStoreModule } from '@weplanx/ng/store';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';

import { AppComponent } from './app.component';
import { AppGuard } from './app.guard';
import { AppInterceptors } from './app.interceptors';
import { ProfileModule } from './profile/profile.module';

registerLocaleData(en);

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'forget',
    loadChildren: () => import('./forget/forget.module').then(m => m.ForgetModule)
  },
  {
    path: 'unauthorize',
    loadChildren: () => import('./unauthorize/unauthorize.module').then(m => m.UnauthorizeModule)
  },
  {
    path: 'authorized',
    loadChildren: () => import('./authorized/authorized.module').then(m => m.AuthorizedModule),
    canActivate: [AppGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AppGuard]
  },
  {
    path: ':namespace',
    loadChildren: () => import('./namespace/namespace.module').then(m => m.NamespaceModule),
    canActivate: [AppGuard]
  },
  { path: '', redirectTo: 'admin', pathMatch: 'full' }
];

if (!environment.production) {
  routes.unshift({
    path: 'exp',
    loadChildren: () => import('../experiment/experiment.module').then(m => m.ExperimentModule),
    canActivate: [AppGuard]
  });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    FormsModule,
    NzLayoutModule,
    NzMessageModule,
    ProfileModule,
    WpxRichtextModule.forRoot({
      url: 'https://cdn.kainonly.com/assets/editorjs/editorjs.js',
      plugins: [
        'https://cdn.kainonly.com/assets/editorjs/paragraph.js',
        'https://cdn.kainonly.com/assets/editorjs/header.js',
        'https://cdn.kainonly.com/assets/editorjs/delimiter.js',
        'https://cdn.kainonly.com/assets/editorjs/underline.js',
        'https://cdn.kainonly.com/assets/editorjs/nested-list.js',
        'https://cdn.kainonly.com/assets/editorjs/checklist.js',
        'https://cdn.kainonly.com/assets/editorjs/table.js'
      ]
    }),
    WpxStoreModule.forRoot({
      url: 'https://cdn.kainonly.com/assets/localforage/localforage.min.js',
      plugins: [],
      name: 'weplanx'
    }),
    RouterModule.forRoot(routes, { useHash: true, initialNavigation: 'enabledBlocking' }),
    NzMenuModule,
    ShareModule,
    TranslationModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptors, multi: true },
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: NZ_CONFIG,
      useValue: <NzConfig>{
        notification: { nzPlacement: 'bottomRight' },
        pageHeader: { nzGhost: false },
        card: { nzBorderless: true },
        table: { nzSize: 'small' },
        codeEditor: {
          assetsRoot: `https://cdn.kainonly.com/assets`
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
