import type { IControl, Map } from 'mapbox-gl'

/**
 * A custom Mapbox control that toggles between 2D (pitch 0) and 3D (pitched) views.
 */
export class PitchToggleControl implements IControl {
  private map: Map | null = null
  private container: HTMLDivElement | null = null
  private button: HTMLButtonElement | null = null
  private readonly pitch3D: number

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
    this.map.on('pitchend', this.updateLabel)

    this.container.appendChild(this.button)
    return this.container
  }

  onRemove(): void {
    this.map?.off('pitchend', this.updateLabel)
    this.container?.remove()
    this.map = null
    this.container = null
    this.button = null
  }

  private handleClick = (): void => {
    if (!this.map) return

    const is3D = this.map.getPitch() > 0
    this.map.easeTo({
      pitch: is3D ? 0 : this.pitch3D,
      duration: 300,
    })
  }

  private updateLabel = (): void => {
    if (!this.button || !this.map) return
    const is3D = this.map.getPitch() > 0
    this.button.textContent = is3D ? '2D' : '3D'
  }
}
