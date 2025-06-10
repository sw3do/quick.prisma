export type DatabaseValue = string | number | boolean | object | null | undefined;

export interface QuickPrismaOptions {
  connectionString?: string;
  autoConnect?: boolean;
}

export interface DatabaseEntry {
  key: string;
  value: DatabaseValue;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterFunction<T = DatabaseValue> = (value: T, key: string) => boolean;
export type MapFunction<T = DatabaseValue, R = any> = (value: T, key: string) => R; 