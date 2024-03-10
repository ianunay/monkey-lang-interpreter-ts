import { ObjectStore } from "./object";

export class Environment {
  store: { [key: string]: ObjectStore } = {};
  outer: Environment | null = null;

  constructor(outer: Environment | null = null) {
    this.store = {};
    this.outer = outer;
  }

  get(name: string): ObjectStore {
    const obj = this.store[name];
    if (obj === undefined && this.outer) {
      return this.outer.get(name);
    }
    return obj;
  }

  set(name: string, value: ObjectStore): ObjectStore {
    this.store[name] = value;
    return value;
  }
}
