import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { LngLat } from 'mapbox-gl';

export const useMainStore = defineStore('main', () => {
  const isProfileModalOpen = ref(false);
  const isPasswordModalOpen = ref(false);
  const isLeftSidebarOpen = ref(false);
  const isRemarkPopoverOpen = ref(false);
  const remarkPopoverTitle = ref('');
  const remarkPopoverText = ref('');
  const isShowingMapsetSelection = ref(false);
  const mapCenterLatLon = ref<LngLat | null>(null);
  const mapMarkerLatLon = ref<LngLat | null>(null);

  return {
    isProfileModalOpen,
    isPasswordModalOpen,
    isLeftSidebarOpen,
    isShowingMapsetSelection,
    isRemarkPopoverOpen,
    remarkPopoverTitle,
    remarkPopoverText,
    mapCenterLatLon,
    mapMarkerLatLon,
  };
});