import { Vehicle } from './vehicle';

export interface Manufacturer {
  id: number;
  name: string;
  code?: string;
  vehicles?: Vehicle[];
}
