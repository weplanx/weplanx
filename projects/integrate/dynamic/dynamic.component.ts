import { ComponentPortal } from '@angular/cdk/portal';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';

import { WpxService } from '@weplanx/ng';

import { WpxDynamicService } from './dynamic.service';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';

@Component({
  selector: 'wpx-dynamic',
  template: ` <ng-container *cdkPortalOutlet="component"></ng-container> `
})
export class WpxDynamicComponent implements OnInit {
  /**
   * 动态组件
   */
  component!: ComponentPortal<any>;

  constructor(private wpx: WpxService, private route: ActivatedRoute, private dynamic: WpxDynamicService) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(v => v.get('pageId')!),
        switchMap(id => this.dynamic.getPage(id))
      )
      .subscribe(page => {
        switch (page.kind) {
          case 'default':
            switch (page.manifest) {
              case 'default':
                this.component = new ComponentPortal<any>(TableComponent);
                break;
              case 'form':
                this.component = new ComponentPortal<any>(FormComponent);
                break;
            }
            break;
        }
      });
  }
}