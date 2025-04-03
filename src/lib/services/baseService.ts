
/**
 * Base service for localStorage operations
 */
export class BaseService {
  protected getItem<T>(key: string): T[] {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }

  protected setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  protected getMaxId(items: { id: number }[]): number {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }
}
