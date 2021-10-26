export interface Schema {
  _id: string;
  key: string;
  label: string;
  kind: SchemaKind;
  system?: boolean;
  fields?: Field[];
}

export type SchemaKind = 'collection' | 'single' | 'manual';

export interface Field {
  key: string;
  label: string;
  type: string;
  description?: string;
  default: string;
  required: boolean;
  unique: boolean;
  private: boolean;
  system: boolean;
  option?: FieldOption;
}

export interface FieldOption {
  max?: number;
  min?: number;
  mode?: string;
  target?: string;
  to?: string;
}