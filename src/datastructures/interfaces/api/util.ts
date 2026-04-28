// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IAPIModel {}

// Implemented by TypedRecord. Templates that pass a record into fieldData.ts
// rely on this surface (className for label lookup, isEnum/getEnumLabel for
// rendering enum values).
export interface IEnumMethods extends IAPIModel {
  className: string
  isEnum(propertyName: string): boolean
  getEnumLabel(property: string): string | null
  getClassName(): string
}
