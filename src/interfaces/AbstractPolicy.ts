export interface AbstractPolicy<U, E> {
  search?(user: U | null): Promise<boolean> | boolean
  create?(user: U | null): Promise<boolean> | boolean

  view?(user: U | null, entity: E): Promise<boolean> | boolean
  update?(user: U | null, entity: E): Promise<boolean> | boolean
  delete?(user: U | null, entity: E): Promise<boolean> | boolean
}
