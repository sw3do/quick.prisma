import { PrismaClient } from '@prisma/client';
import { DatabaseValue, QuickPrismaOptions, DatabaseEntry, FilterFunction, MapFunction } from './types';

export class QuickPrisma {
  private prisma: PrismaClient;
  private connected: boolean = false;

  constructor(options: QuickPrismaOptions = {}) {
    const connectionString = options.connectionString || process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable or connectionString is required');
    }

    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString
        }
      }
    });

    if (options.autoConnect !== false) {
      this.connect();
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    
    try {
      await this.prisma.$connect();
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;
    
    await this.prisma.$disconnect();
    this.connected = false;
  }

  async set(key: string, value: DatabaseValue): Promise<DatabaseValue> {
    await this.ensureConnected();
    
    const result = await this.prisma.keyValue.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any }
    });
    
    return result.value as DatabaseValue;
  }

  async get(key: string): Promise<DatabaseValue | null> {
    await this.ensureConnected();
    
    const result = await this.prisma.keyValue.findUnique({
      where: { key }
    });
    
    return result ? (result.value as DatabaseValue) : null;
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureConnected();
    
    try {
      await this.prisma.keyValue.delete({
        where: { key }
      });
      return true;
    } catch {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnected();
    
    const result = await this.prisma.keyValue.findUnique({
      where: { key },
      select: { id: true }
    });
    
    return result !== null;
  }

  async add(key: string, value: number): Promise<number> {
    await this.ensureConnected();
    
    const current = await this.get(key);
    const currentNum = typeof current === 'number' ? current : 0;
    const newValue = currentNum + value;
    
    await this.set(key, newValue);
    return newValue;
  }

  async subtract(key: string, value: number): Promise<number> {
    await this.ensureConnected();
    
    const current = await this.get(key);
    const currentNum = typeof current === 'number' ? current : 0;
    const newValue = currentNum - value;
    
    await this.set(key, newValue);
    return newValue;
  }

  async push(key: string, ...values: DatabaseValue[]): Promise<DatabaseValue[]> {
    await this.ensureConnected();
    
    const current = await this.get(key);
    const currentArray = Array.isArray(current) ? current : [];
    const newArray = [...currentArray, ...values];
    
    await this.set(key, newArray);
    return newArray;
  }

  async pull(key: string, value: DatabaseValue): Promise<DatabaseValue[]> {
    await this.ensureConnected();
    
    const current = await this.get(key);
    if (!Array.isArray(current)) return [];
    
    const newArray = current.filter(item => 
      JSON.stringify(item) !== JSON.stringify(value)
    );
    
    await this.set(key, newArray);
    return newArray;
  }

  async all(): Promise<DatabaseEntry[]> {
    await this.ensureConnected();
    
    const results = await this.prisma.keyValue.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    return results.map(result => ({
      key: result.key,
      value: result.value as DatabaseValue,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));
  }

  async clear(): Promise<number> {
    await this.ensureConnected();
    
    const result = await this.prisma.keyValue.deleteMany();
    return result.count;
  }

  async keys(): Promise<string[]> {
    await this.ensureConnected();
    
    const results = await this.prisma.keyValue.findMany({
      select: { key: true }
    });
    
    return results.map(result => result.key);
  }

  async values(): Promise<DatabaseValue[]> {
    await this.ensureConnected();
    
    const results = await this.prisma.keyValue.findMany({
      select: { value: true }
    });
    
    return results.map(result => result.value as DatabaseValue);
  }

  async size(): Promise<number> {
    await this.ensureConnected();
    
    return await this.prisma.keyValue.count();
  }

  async filter(fn: FilterFunction): Promise<DatabaseEntry[]> {
    const allEntries = await this.all();
    return allEntries.filter(entry => fn(entry.value, entry.key));
  }

  async map<R>(fn: MapFunction<DatabaseValue, R>): Promise<R[]> {
    const allEntries = await this.all();
    return allEntries.map(entry => fn(entry.value, entry.key));
  }

  async find(fn: FilterFunction): Promise<DatabaseEntry | undefined> {
    const allEntries = await this.all();
    return allEntries.find(entry => fn(entry.value, entry.key));
  }

  async some(fn: FilterFunction): Promise<boolean> {
    const allEntries = await this.all();
    return allEntries.some(entry => fn(entry.value, entry.key));
  }

  async every(fn: FilterFunction): Promise<boolean> {
    const allEntries = await this.all();
    return allEntries.every(entry => fn(entry.value, entry.key));
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }
} 