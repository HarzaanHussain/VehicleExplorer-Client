import { Manufacturer } from './manufacturer';

export interface Vehicle {
  id: number;
  modelName: string;
  year: number;
  combinedMpg?: number;
  annualFuelCost?: number;
  manufacturerId: number;
  manufacturer?: Manufacturer;
}
