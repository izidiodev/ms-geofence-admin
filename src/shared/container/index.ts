type Factory<T> = () => T;

class Container {
  private static instance: Container;
  private instances: Map<string, unknown> = new Map();
  private factories: Map<string, Factory<unknown>> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory as Factory<unknown>);
  }

  resolve<T>(key: string): T {
    if (!this.instances.has(key)) {
      const factory = this.factories.get(key);
      if (!factory) {
        throw new Error(`Dependency "${key}" not registered in container`);
      }
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }

  clear(): void {
    this.instances.clear();
  }
}

export const container = Container.getInstance();
