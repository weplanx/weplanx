import { TemplateRef } from '@angular/core';

import { Any, AnyDto } from '@weplanx/ng';

export type WpxColumn<T> = Omit<WpxTableColumn<T>, 'display'>;

export interface WpxTableColumn<T> {
  title: string;
  key: keyof AnyDto<T>;
  display: boolean;
  width?: string;
  ellipsis?: boolean;
  render?: TemplateRef<Any>;
}