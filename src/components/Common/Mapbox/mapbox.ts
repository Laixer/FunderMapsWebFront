import { Map, type AnySourceData } from "mapbox-gl";
import { onBeforeUnmount } from "vue";

export function useMapSource({ 
  sourceName, 
  sourceConfig 
}: { 
  sourceName: string, 
  sourceConfig: AnySourceData
}) {
  let mapInstance: Map

  function removeSource() {
    if (! mapInstance) return 

    if (mapInstance.getSource(sourceName)) {
      mapInstance.removeSource(sourceName)
    }
  }

  function addSource() {
    if (! mapInstance) return 

    removeSource()
    mapInstance.addSource(sourceName, sourceConfig)
  }

  function onLoad(map: Map) {
    mapInstance = map
    addSource()
  }

  onBeforeUnmount(removeSource)

  return {
    removeSource,
    addSource,
    onLoad
  }
}

export const loadImage = async (map: Map, url: string, name: string, sdf: boolean) => {
  return await new Promise(
    (resolve, reject) => {
      map.loadImage(
      url,
      (err, image) => {
        if (err) {
          console.log(`Failed to load a map icon: ${name}`)
          reject()
        } else {

          if (image !== undefined && ! map.hasImage(name)) {
            map.addImage(name, image, { sdf: !! sdf })
          }
          resolve(null)
        }
    })
  })
}