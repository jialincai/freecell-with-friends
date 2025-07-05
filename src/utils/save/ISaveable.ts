/**
 * Specifies save interface for a runtime object.
 *
 * Implementations must enforce state is retrieved and updated exclusively through externally
 * provided `get` and `set` functions. Implementations must avoid holding references to the object
 * being saved to avoid stale reference and support functional, immutable state flows.
 *
 * Implementing classes should:
 * - Use `get()` to access the latest value at snapshot time
 * - Use `set(data)` to update the source when restoring from snapshot
 *
 * Example implementation:
 * - See `MoveSaveable.ts` for a concrete example`
 *
 * @template T - The JSON-serializable shape of the saved data.
 */
export interface ISaveable<T> {
  id: string;
  get: () => T;
  set: (data: T) => void;
  getSnapshot(): T;
  loadFromSnapshot(data: T): void;
}

export type SaveableRegistry = Record<string, ISaveable<unknown>>;
