import { Moment } from 'moment';

export interface KeyAccessor {
  [key: string]: any;
}

export interface Employee {
  id?: number;
  first_name: string;
  last_name: string;
  username: string;
  password?: string;
  phone: string;
  admin: boolean;
}

export interface Tank {
  id?: number | string;
  name: string;
  status: string;
  in_use: boolean;
  disabled?: boolean;
  update_user?: number;
}

export interface Action {
  id: number;
  name: string;
  description: string;
  classname: string;
}

export interface Recipe {
  id?: number;
  name: string;
  airplane_code: string;
  yeast: number;
  instructions: Ingredient[];
  update_user?: number;
}

export interface Ingredient {
  ingredient: string;
  ratio: string;
}

export interface Batch {
  id?: string | number;
  name: string;
  generation: number;
  volume: number;
  bright: number;
  recipe_id: number;
  tank_id?: string | number;
  started_on?: string;
  completed_on?: string;
  update_user?: number;
}

export interface Task {
    id?: number;
    added_on?: string | Moment;
    completed_on?: string | Moment;
    assigned?: boolean;
    batch_id: number;
    action_id: number;
    exception_reason?: string;
    employee_id?: number;
    update_user?: number;
}

export type Version = KeyAccessor & {
  id?: number;
  sg: number;
  ph: number;
  abv: number;
  temperature: number;
  pressure: number;
  measured_on?: string | Moment;
  completed?: boolean;
  batch_id?: number;
};

export interface BrewhopsCookie {
  id: string;
  username: string;
  admin: boolean;
  token: string;
}

export interface ActionUpdate {
  action: {
    id: string | number | undefined;
    completed: boolean;
    assigned: boolean;
    employee: {
      id: string | number;
    };
  };
}

export type BatchUpdateOrCreate = Batch & Version;
