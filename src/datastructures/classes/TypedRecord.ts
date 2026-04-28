import type { IEnumMethods } from '../interfaces/api/util'

// Most enum labels are keyed on number (ERecoveryType etc.) but a few are
// string enums (ESoil), so the key type stays open.
type LabelMap = ReadonlyMap<unknown, string>

// Base class for the data records that fieldData.ts inspects to render the
// building info panels. Provides three operations the templating layer
// expects: getClassName() (used to look up Dutch field labels), isEnum(prop)
// and getEnumLabel(prop) (used to translate enum int → human-readable
// string). Subclasses declare `className` and an `enumLabels` map; this
// base implements the rest.
export class TypedRecord implements IEnumMethods {
  className = 'TypedRecord'
  protected enumLabels: Record<string, LabelMap> = {}

  // IEnumMethods compatibility — derived from the labels map. Nothing
  // outside this file actually reads enumProperties; kept for the
  // interface contract only.
  get enumProperties(): string[] { return Object.keys(this.enumLabels) }

  isEnum(prop: string): boolean {
    return prop in this.enumLabels
  }

  // Translate an enum-typed property to its label. Handles both scalar
  // enums (foundationType) and array enums like
  // foundationDamageCharacteristics, which collapse to a comma-joined list.
  getEnumLabel(prop: string): string | null {
    const map = this.enumLabels[prop]
    if (!map) return null
    const value = (this as unknown as Record<string, unknown>)[prop]
    if (value === null || value === undefined) return null

    if (Array.isArray(value)) {
      return value.map(v => map.get(v) ?? '').filter(Boolean).join(', ')
    }
    return map.get(value) ?? null
  }

  getClassName(): string { return this.className }
}
