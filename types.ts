
export type EntryType = 'pix' | 'cartao' | 'dizimo' | 'oferta';

export enum DayOfWeek {
  DOMINGO = 'Domingo',
  QUARTA = 'Quarta-feira',
  ESCOLA_DO_REINO = 'Escola do Reino',
  OUTROS = 'Outros'
}

export interface EntryMarker {
  key: string;
  label: string;
  icon?: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  password?: string;
}

export interface ReportState {
  date: string;
  dayType: DayOfWeek;
  otherDayDescription: string;
  serviceName: string;
  responsible: string;
  entries: Record<string, boolean>;
  values: Record<string, number>;
}
