/**
 * Represents a runtime object that can be saved to and restored from a snapshot.
 *
 * @template T - The JSON-serializable shape of the saved data.
 */
export interface ISaveable<T> {
  id: string;
  getSnapshot(): T;
  loadFromSnapshot(data: T): void;
}

export type SaveableRegistry = Record<string, ISaveable<any>>;