import { AfterContentInit, AfterViewInit, Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BitConfigService, BitService } from 'ngx-bit';
import { AudioDataSource } from './audio.data-source';
import { PictureService } from '@api/picture.service';
import { PictureTypeService } from '@api/picture-type.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalComponent, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzImageService } from 'ng-zorro-antd/image';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, switchMap } from 'rxjs/operators';
import { SystemService } from 'van-skeleton';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { Observable, of } from 'rxjs';
import { TransportDataSource } from '@common/transport.data-source';
import { AudioService } from '@api/audio.service';
import { AudioTypeService } from '@api/audio-type.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit, AfterContentInit, AfterViewInit {
  tds: TransportDataSource = new TransportDataSource();
  @ViewChild('transportMessageTpl') transportMessageTpl: TemplateRef<any>;

  ds: AudioDataSource;
  typeLists: any[] = [];
  typeMap: Map<any, any> = new Map<any, any>();
  typeVisible = false;
  typeSort = false;
  typePageIndex = 1;
  typeName: string;
  editTypeData: any;
  typeCount: any = {};
  typeCountStyle = { backgroundColor: '#d1dade', color: '#5e5e5e', boxShadow: 'none' };

  infiniteY$: Observable<any> = of(0);

  @ViewChild('renameModal') renameModal: NzModalComponent;
  renameData: any;
  renameForm: FormGroup;

  @ViewChild('moveModal') moveModal: NzModalComponent;
  moveData: any[];
  moveForm: FormGroup;

  @ViewChild('deleteModal') deleteModal: NzModalComponent;
  deleteData: any[];
  @ViewChild('deleteModalContentTpl') deleteModalContentTpl: TemplateRef<any>;

  constructor(
    public config: BitConfigService,
    public bit: BitService,
    public system: SystemService,
    private audioService: AudioService,
    private audioTypeService: AudioTypeService,
    private clipboard: Clipboard,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private message: NzMessageService,
    private image: NzImageService,
    private contextMenu: NzContextMenuService,
    private fb: FormBuilder
  ) {
    this.ds = new AudioDataSource(audioService, 1);
  }

  ngOnInit(): void {
    this.bit.registerLocales(import('./language'));
    this.ds.lists = this.bit.listByPage({
      id: 'picture',
      query: [
        { field: 'name', op: 'like', value: '' },
        { field: 'type_id', op: '=', value: '', exclude: [''] }
      ],
      limit: 50
    });
    this.ds.lists.ready.subscribe(() => {
      this.getTypeLists();
      this.getCount();
    });
    this.tds.complete.pipe(
      switchMap(data => {
        return this.audioService.bulkAdd({
          type_id: !this.ds.lists.search.type_id.value ? 0 : this.ds.lists.search.type_id.value,
          data: data.map(v => ({
            name: v.originFileObj.name,
            url: Reflect.get(v.originFileObj, 'key')
          }))
        });
      })
    ).subscribe(res => {
      if (res.error === 1) {
        this.message.error(this.bit.l.uploadError);
        return;
      }
      this.ds.fetchData(true);
      this.getCount();
      this.message.success(this.bit.l.uploadSuccess);
    });
  }

  ngAfterContentInit(): void {
    this.fetchInfiniteY();
  }

  ngAfterViewInit(): void {
    let messageId: string;
    this.tds.done.subscribe(status => {
      if (!status && !messageId) {
        messageId = this.message.loading(this.transportMessageTpl, {
          nzDuration: 0
        }).messageId;
      }
      if (status && messageId) {
        this.message.remove(messageId);
        messageId = undefined;
      }
    });
  }

  @HostListener('window:resize')
  onresize(): void {
    this.fetchInfiniteY();
  }

  transport = (files: NzUploadFile[]): Observable<any> => {
    return this.audioService.bulkAdd({
      type_id: !this.ds.lists.search.type_id.value ? 0 : this.ds.lists.search.type_id.value,
      data: files.map(v => ({
        name: v.originFileObj.name,
        url: Reflect.get(v.originFileObj, 'key')
      }))
    });
  };

  transportComplete(): void {
    this.ds.fetchData(true);
    this.getCount();
  }

  getTypeLists(): void {
    this.audioTypeService.originLists().subscribe(data => {
      this.typeLists = data;
      for (const x of data) {
        this.typeMap.set(x.id, x);
      }
      this.ds.done();
    });
  }

  getCount(): void {
    this.audioService.count().subscribe(data => {
      const count: any = {};
      count.total = data.total;
      for (const x of data.values) {
        count[x.type_id] = x.size;
      }
      this.typeCount = count;
    });
  }

  currentCount(): string[] {
    if (
      !this.ds.lists.hasSearch('type_id') ||
      Object.keys(this.typeCount).length === 0
    ) {
      return [this.bit.l.all, '0'];
    }
    const typeId = this.ds.lists.search.type_id.value;
    switch (typeId) {
      case '':
        return [this.bit.l.all, this.typeCount.total];
      case 0:
        return [this.bit.l.unknownType, this.typeCount[0]];
      default:
        return [this.typeMap.get(typeId).name, this.typeCount.hasOwnProperty(typeId) ? this.typeCount[typeId] : 0];
    }
  }

  fetchInfiniteY(): void {
    this.infiniteY$ = this.system.layout.pipe(
      map((elements: Element[]) => {
        if (elements.length === 0) {
          return 0;
        }
        let height = 0;
        for (const ele of elements) {
          height += ele.clientHeight;
        }
        return window.innerHeight - height - 150;
      })
    );
  }

  checkedAllBind(event: any): void {
    const target: Element = event.target;
    if (target.tagName.toLowerCase() === 'button') {
      this.ds.lists.checked = !this.ds.lists.checked;
      this.ds.lists.checkedAll(this.ds.lists.checked);
    }
  }

  openTypeDrawer(): void {
    this.typeVisible = true;
  }

  closeTypeDrawer(): void {
    this.typeVisible = false;
    this.addTypeCancel();
    this.editTypeCancel();
    this.typeSort = false;
    this.typePageIndex = 1;
  }

  addTypeCancel(): void {
    this.typeName = undefined;
  }

  addTypeSubmit(): void {
    if (!this.typeName) {
      return;
    }
    this.audioTypeService.add({
      name: this.typeName
    }).subscribe(res => {
      if (!res.error) {
        this.addTypeCancel();
        this.getTypeLists();
        this.notification.success(this.bit.l.success, this.bit.l.updateSuccess);
      } else {
        this.notification.success(this.bit.l.error, this.bit.l.updateError);
      }
    });
  }

  editType(data: any): void {
    this.editTypeData = Object.assign(data, {
      editName: data.name
    });
  }

  editTypeCell(data: any): boolean {
    return this.editTypeData && this.editTypeData.id === data.id && !this.typeSort;
  }

  editTypeCancel(): void {
    this.editTypeData = undefined;
  }

  editTypeSubmit(data: any): void {
    if (!data.editName) {
      return;
    }
    this.audioTypeService.edit({
      id: data.id,
      name: data.editName
    }).subscribe(res => {
      if (!res.error) {
        data.name = data.editName;
        this.editTypeCancel();
        this.notification.success(this.bit.l.success, this.bit.l.updateSuccess);
      } else {
        this.notification.success(this.bit.l.error, this.bit.l.updateError);
      }
    });
  }

  editTypeDelete(id: any[]): void {
    this.audioTypeService.delete(id).subscribe(res => {
      if (!res.error) {
        this.getTypeLists();
        this.notification.success(
          this.bit.l.success,
          this.bit.l.deleteSuccess
        );
      } else {
        this.notification.error(
          this.bit.l.error,
          this.bit.l.deleteError
        );
      }
    });
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.typeLists,
      event.previousIndex + (this.typePageIndex - 1) * 10,
      event.currentIndex + (this.typePageIndex - 1) * 10
    );
    this.sortSubmit();
  }

  openSortMenu($event: any, menu: NzDropdownMenuComponent): void {
    this.contextMenu.create($event, menu);
  }

  sortMove(previousIndex: number, currentIndex: number): void {
    moveItemInArray(this.typeLists, previousIndex + (this.typePageIndex - 1) * 10, currentIndex);
    this.sortSubmit();
  }

  private sortSubmit(): void {
    const data = this.typeLists.map((value, index) => {
      return {
        id: value.id,
        sort: index
      };
    });
    this.audioTypeService.sort(data).subscribe(res => {
      if (!res.error) {
        this.getTypeLists();
        this.notification.success(
          this.bit.l.success,
          this.bit.l.sortSuccess
        );
      } else {
        this.notification.error(
          this.bit.l.error,
          this.bit.l.sortError
        );
      }
    });
  }

  copy(data: any): void {
    data.copied = this.clipboard.copy(this.bit.static + data.url);
    setTimeout(() => {
      data.copied = false;
    }, 1000);
  }

  openRenameModal(data: any): void {
    this.renameModal.open();
    this.renameData = data;
    this.renameForm = this.fb.group({
      name: [null, [Validators.required]]
    });
  }

  closeRenameModal(): void {
    this.renameModal.close();
    this.renameData = undefined;
    this.renameForm = undefined;
  }

  submitRename(): void {
    const controls = this.renameForm.controls;
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        controls[key].markAsDirty();
        controls[key].updateValueAndValidity();
      }
    }
    this.audioService.edit({
      id: this.renameData.id,
      name: this.renameForm.value.name
    }).subscribe(res => {
      if (!res.error) {
        this.notification.success(
          this.bit.l.success,
          this.bit.l.updateSuccess
        );
        this.renameData.name = this.renameForm.value.name;
        this.closeRenameModal();
      } else {
        this.notification.error(
          this.bit.l.error,
          this.bit.l.updateError
        );
      }
    });
  }

  openMoveModal(data: any[]): void {
    this.moveModal.open();
    this.moveData = data;
    this.moveForm = this.fb.group({
      type_id: [null, [Validators.required]]
    });
  }

  closeMoveModal(): void {
    this.moveModal.close();
    this.moveData = undefined;
    this.moveForm = undefined;
  }

  submitMove(): void {
    const controls = this.moveForm.controls;
    for (const key in controls) {
      if (controls.hasOwnProperty(key)) {
        controls[key].markAsDirty();
        controls[key].updateValueAndValidity();
      }
    }
    this.audioService.bulkEdit({
      type_id: this.moveForm.value.type_id,
      ids: this.moveData.map(v => v.id)
    }).subscribe(res => {
      if (!res.error) {
        this.notification.success(
          this.bit.l.success,
          this.bit.l.updateSuccess
        );
        this.closeMoveModal();
        this.getCount();
        this.ds.fetchData(true);
      } else {
        this.notification.error(
          this.bit.l.error,
          this.bit.l.updateError
        );
      }
    });
  }

  openDeleteModal(data: any[]): void {
    this.deleteModal.open();
    this.deleteData = data;
  }

  closeDeleteModal(): void {
    this.deleteModal.close();
    this.deleteData = undefined;
  }

  submitDelete(): void {
    const ids = this.deleteData.map(v => v.id);
    this.audioService.delete(
      ids
    ).subscribe(res => {
      if (!res.error) {
        this.notification.success(
          this.bit.l.success,
          this.bit.l.deleteSuccess
        );
        this.closeDeleteModal();
        this.getCount();
        if (ids.length > 1) {
          this.ds.fetchData(true);
        } else {
          this.ds.delete(ids);
        }
      } else {
        this.notification.error(
          this.bit.l.error,
          this.bit.l.deleteError
        );
      }
    });
  }
}
