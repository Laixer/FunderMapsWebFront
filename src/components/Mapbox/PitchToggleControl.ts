import type { ExpressionSpecification, IControl, Map } from 'mapbox-gl'

/**
 * A custom Mapbox control that toggles between 2D (flat polygons) and 3D (extruded buildings).
 * In 2D mode: pitch is set to 0 and fill-extrusion heights are flattened.
 * In 3D mode: pitch is restored and extrusion heights use the feature's height property.
 */
export class PitchToggleControl implements IControl {
  private map: Map | null = null
  private container: HTMLDivElement | null = null
  private button: HTMLButtonElement | null = null
  private readonly pitch3D: number
  private is3D = true

  constructor(pitch3D = 30) {
    this.pitch3D = pitch3D
  }

  onAdd(map: Map): HTMLElement {
    this.map = map

    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

    this.button = document.createElement('button')
    this.button.type = 'button'
    this.button.title = '2D / 3D'
    this.button.setAttribute('aria-label', '2D / 3D')
    this.button.style.fontWeight = '700'
    this.button.style.fontSize = '13px'
    this.button.style.padding = '0'
    this.updateLabel()

    this.button.addEventListener('click', this.handleClick)
    this.map.on('styledata', this.handleStyleData)

    this.container.appendChild(this.button)
    return this.container
  }

  onRemove(): void {
    this.map?.off('styledata', this.handleStyleData)
    this.container?.remove()
    this.map = null
    this.container = null
    this.button = null
  }

  private handleClick = (): void => {
    if (!this.map) return

    this.is3D = !this.is3D

    this.map.easeTo({
      pitch: this.is3D ? this.pitch3D : 0,
      duration: 300,
    })

    this.setExtrusionHeights(this.is3D ? ['get', 'height'] : 0)
    this.updateLabel()
  }

  private setExtrusionHeights(height: number | ExpressionSpecification): void {
    if (!this.map) return

    const style = this.map.getStyle()
    if (!style?.layers) return

    for (const layer of style.layers) {
      if (layer.type === 'fill-extrusion') {
        this.map.setPaintProperty(layer.id, 'fill-extrusion-height', height)
      }
    }
  }

  /**
   * When new layers are added (e.g. mapset switch), flatten them if in 2D mode.
   */
  private handleStyleData = (): void => {
    if (!this.is3D) {
      this.setExtrusionHeights(0)
    }
  }

  private updateLabel = (): void => {
    if (!this.button) return
    this.button.textContent = this.is3D ? '2D' : '3D'
  }
}
