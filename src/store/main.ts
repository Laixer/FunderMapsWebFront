import { type Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import type { LngLat } from 'mapbox-gl';

export const useMainStore = defineStore('main', () => {
  const isProfileModalOpen: Ref<boolean> = ref(false);
  const isPasswordModalOpen: Ref<boolean> = ref(false);
  const isLeftSidebarOpen: Ref<boolean> = ref(false);
  const isInfoPopoverOpen: Ref<boolean> = ref(false);
  const isRemarkPopoverOpen: Ref<boolean> = ref(false);
  const remarkPopoverTitle: Ref<string> = ref('');
  const remarkPopoverText: Ref<string> = ref('');
  const isShowingMapsetSelection: Ref<boolean> = ref(false);
  const mapCenterLatLon: Ref<LngLat | null> = ref(null);
  const mapMarkerLatLon: Ref<LngLat | null> = ref(null);

  return {
    isProfileModalOpen,
    isPasswordModalOpen,
    isLeftSidebarOpen,
    isShowingMapsetSelection,
    isInfoPopoverOpen,
    isRemarkPopoverOpen,
    remarkPopoverTitle,
    remarkPopoverText,
    mapCenterLatLon,
    mapMarkerLatLon,
  };
});