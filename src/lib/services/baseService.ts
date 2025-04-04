
export class BaseService {
  protected getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  protected setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  protected getMaxId(items: any[]): string {
    if (items.length === 0) {
      return '1'; // Return string '1' for first ID
    }
    
    // Convert all IDs to numbers, find max, and return as string
    const maxId = Math.max(...items.map(item => Number(item.id)));
    return String(maxId + 1);
  }
}
