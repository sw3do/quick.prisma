import { QuickPrisma } from './database';
import { DatabaseValue } from './types';

export class AdvancedQuickPrisma extends QuickPrisma {
  
  async increment(key: string, amount: number = 1): Promise<number> {
    return await this.add(key, amount);
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    return await this.subtract(key, amount);
  }

  async exists(key: string): Promise<boolean> {
    return await this.has(key);
  }

  async startsWith(prefix: string): Promise<{ key: string; value: DatabaseValue }[]> {
    const allEntries = await this.all();
    return allEntries
      .filter(entry => entry.key.startsWith(prefix))
      .map(entry => ({ key: entry.key, value: entry.value }));
  }

  async endsWith(suffix: string): Promise<{ key: string; value: DatabaseValue }[]> {
    const allEntries = await this.all();
    return allEntries
      .filter(entry => entry.key.endsWith(suffix))
      .map(entry => ({ key: entry.key, value: entry.value }));
  }

  async includes(substring: string): Promise<{ key: string; value: DatabaseValue }[]> {
    const allEntries = await this.all();
    return allEntries
      .filter(entry => entry.key.includes(substring))
      .map(entry => ({ key: entry.key, value: entry.value }));
  }

  async deleteMany(keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      const deleted = await this.delete(key);
      if (deleted) deletedCount++;
    }
    return deletedCount;
  }

  async setMany(entries: { key: string; value: DatabaseValue }[]): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value);
    }
  }

  async getMany(keys: string[]): Promise<{ key: string; value: DatabaseValue | null }[]> {
    const results = [];
    for (const key of keys) {
      const value = await this.get(key);
      results.push({ key, value });
    }
    return results;
  }

  async backup(): Promise<{ key: string; value: DatabaseValue }[]> {
    const allEntries = await this.all();
    return allEntries.map(entry => ({ key: entry.key, value: entry.value }));
  }

  async restore(data: { key: string; value: DatabaseValue }[]): Promise<void> {
    await this.clear();
    for (const entry of data) {
      await this.set(entry.key, entry.value);
    }
  }

  async math(key: string, operation: 'add' | 'subtract' | 'multiply' | 'divide', value: number): Promise<number> {
    const current = await this.get(key);
    const currentNum = typeof current === 'number' ? current : 0;
    
    let result: number;
    switch (operation) {
      case 'add':
        result = currentNum + value;
        break;
      case 'subtract':
        result = currentNum - value;
        break;
      case 'multiply':
        result = currentNum * value;
        break;
      case 'divide':
        result = value !== 0 ? currentNum / value : currentNum;
        break;
      default:
        throw new Error(`Invalid operation: ${operation}`);
    }
    
    await this.set(key, result);
    return result;
  }

  async arrayLength(key: string): Promise<number> {
    const value = await this.get(key);
    return Array.isArray(value) ? value.length : 0;
  }

  async arrayIncludes(key: string, searchValue: DatabaseValue): Promise<boolean> {
    const value = await this.get(key);
    if (!Array.isArray(value)) return false;
    
    return value.some(item => JSON.stringify(item) === JSON.stringify(searchValue));
  }

  async arrayIndexOf(key: string, searchValue: DatabaseValue): Promise<number> {
    const value = await this.get(key);
    if (!Array.isArray(value)) return -1;
    
    return value.findIndex(item => JSON.stringify(item) === JSON.stringify(searchValue));
  }

  async objectKeys(key: string): Promise<string[]> {
    const value = await this.get(key);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
    
    return Object.keys(value);
  }

  async objectValues(key: string): Promise<DatabaseValue[]> {
    const value = await this.get(key);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return [];
    
    return Object.values(value);
  }

  async objectHasKey(key: string, objectKey: string): Promise<boolean> {
    const value = await this.get(key);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    
    return objectKey in value;
  }
} 