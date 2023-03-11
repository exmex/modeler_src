export interface ScopedIdentifier {
  name: string;
  scope?: string;
}

export class MSSQLUserDefinedTypeRegistry {
  private items: { type: ScopedIdentifier; id: string }[] = [];

  public register(type: ScopedIdentifier, id: string) {
    this.items.push({ type, id });
  }

  public find(type: ScopedIdentifier): string | undefined {
    const found = this.items.find(
      (item) => item.type.scope === type.scope && item.type.name === type.name
    );
    return found ? found.id : undefined;
  }
}
