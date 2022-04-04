import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

import { AnyDto, Where, WpxService } from '@weplanx/common';
import { TableField, WpxTableComponent } from '@weplanx/components/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Role } from '../roles/types';
import { FormComponent } from './form/form.component';
import { User } from './types';
import { UsersService } from './users.service';

@Component({
  selector: 'wpx-settings-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild(WpxTableComponent) table!: WpxTableComponent<User>;
  department: string = '';
  fields: Map<string, TableField> = new Map<string, TableField>([
    ['username', { label: '用户名', type: 'string', keyword: true }],
    ['name', { label: '称呼', type: 'string' }],
    ['roles', { label: '权限组', type: 'select', option: { reference: 'roles' } }],
    ['status', { label: '状态', type: 'bool' }]
  ]);
  where: Where<User> = {};

  constructor(
    public users: UsersService,
    private wpx: WpxService,
    private modal: NzModalService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(v => {
      this.department = v?.['department'] ?? '';
    });
  }

  departmentChanged(): void {
    if (this.department) {
      this.table.ds.where.departments = this.department;
    } else {
      delete this.table.ds.where.departments;
    }
    this.table.getData(true);
    const params = this.department ? { department: this.department } : {};
    this.router.navigate(['settings', 'organize', 'users', params]);
  }

  /**
   * 编辑表单
   * @param editable
   */
  form(editable?: AnyDto<User>): void {
    this.modal.create({
      nzTitle: !editable ? '新增' : '编辑',
      nzWidth: 800,
      nzContent: FormComponent,
      nzComponentParams: {
        editable
      },
      nzOnOk: () => {
        this.table.getData(true);
      }
    });
  }

  /**
   * 删除
   * @param data
   */
  delete(data: AnyDto<Role>): void {
    this.modal.confirm({
      nzTitle: '您确定要删除该用户吗?',
      nzOkText: '是的',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.users.delete(data._id).subscribe(() => {
          this.message.success('数据删除完成');
          this.table.getData(true);
        });
      },
      nzCancelText: '再想想'
    });
  }

  bulkDelete(): void {
    this.modal.confirm({
      nzTitle: '您确定要删除这些用户吗?',
      nzOkText: '是的',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        const requests: Array<Observable<any>> = [];
        this.table.ds.checkedIds.forEach(value => {
          requests.push(this.users.delete(value));
        });
        forkJoin(requests).subscribe(() => {
          this.message.success('数据删除完成');
          this.table.getData(true);
          this.table.ds.clearChecked();
        });
      },
      nzCancelText: '再想想'
    });
  }
}
