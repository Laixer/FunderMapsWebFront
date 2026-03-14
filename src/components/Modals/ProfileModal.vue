<script setup lang="ts">

import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { z } from 'zod'
import { DutchMobilePhoneRegex } from '@/utils/validation'

import Button from '@/components/Common/Buttons/Button.vue'
import Input from '@/components/Common/Inputs/Input.vue';
import OverlayModal from '@/components/Common/OverlayModal.vue';

import { useSessionStore } from '@/store/session'
import { useMainStore } from '@/store/main'

import api from '@/services/api'

import useValidation from '@/services/useValidation';
const { isProfileModalOpen } = storeToRefs( useMainStore() )
const { isAuthenticated } = storeToRefs( useSessionStore() )

/**
 * Whether the profile data has been retrieved from the API
 */
const isProfileDataAvailable = ref(false)

/**
 * Saving indicator
 */
const busySaving = ref(false)

/**
 * The profile data (filled with placeholder data to satisfy the validator)
 */
const profileData = ref()

/**
 * Whether the api call to store the profile returned successfully recently
 */
const recentSuccess = ref(false)
let recentSuccessTimer: ReturnType<typeof setTimeout>|null = null



const setCleanProfileData = function setCleanProfileData() {
  profileData.value = { // : Ref<IUserProfile> // Remove to avoid TS error with validator
    givenName: '',
    lastName: '',
    email: '', // required input in API call
    jobTitle: '',
    phoneNumber: ''
  }
  isProfileDataAvailable.value = false
}
setCleanProfileData()

/** 
 * The profile validation schema composed with ZOD
 */
const validationSchema = z.object({
  givenName: z.string({
    required_error: 'Een voornaam is vereist'
  })
    .trim().min(2, 'Een voornaam moet minimaal 2 karakters bevatten'),

  lastName: z.string({
    required_error: 'Een achternaam is vereist'
  })
    .trim().min(2, 'Een achternaam moet minimaal 2 karakters bevatten'),
  
  jobTitle: z
    .union([
      z.string().trim().length(0), 
      z.string().trim().min(1, "Een functienaam moet minimaal 2 karakters bevatten")
    ])
    .optional()
    .transform(e => e === "" ? "" : e),

  // Because required input & set to strict
  email: z.string(),

  phoneNumber: z
    .union([
      z.string().trim().length(0), 
      z.string().trim().regex(DutchMobilePhoneRegex, 'Voer alstublieft een geldig mobiel telefoonnummer in')
    ])
    .optional()
    .transform(e => e === "" ? undefined : e),
}).strict()

// Activate validator
const { 
  validate, 
  isValid, 
  isActive, 
  deactivate, 
  activate, 
  getError,
  // errors, 
  scrolltoError 
} = useValidation(validationSchema, profileData) 

/**
 * Load the profile upon opening the profile modal for the first time after logging in
 *  The component is mounted in the main view, so the data remains available until logging out
 */
watch(
  () => isProfileModalOpen.value, 
  async (value) => {
    
    if (value === true && isProfileDataAvailable.value === false) {
      const response = await api.userprofile.getUserProfile()

      // TODO: Error handling & all that fun stuff

      profileData.value = {
        email: response.email, // required input
        givenName: response.givenName || '',
        lastName: response.lastName || '',
        jobTitle: response.jobTitle || '',
        phoneNumber: response.phoneNumber || ''
      }

      isProfileDataAvailable.value = true
    }
  }
)

/**
 * Stop the validation process when the modal closes
 *  Start back up if there is still validation work to do
 */
watch(
  () => isProfileModalOpen.value, 
  (value) => {
    if (value === false) {
      deactivate()
    } 
    else if (value === true && isValid.value !== true) {
      activate()
    }
  }
)

/**
 * Reset the profile modal state when the user logs out
 */
watch(
  () => isAuthenticated.value,
  (value) => {
    if (value === false) {
      isProfileModalOpen.value = false
      setCleanProfileData()
      deactivate()
    }
  }
)

/**
 * After 10 seconds, success is no longer recent
 */
watch(
  () => recentSuccess.value,
  (value) => {
    if (value) {
      if (recentSuccessTimer !== null) {
        clearTimeout(recentSuccessTimer)
      }

      recentSuccessTimer = setTimeout(() => {
        recentSuccess.value = false
        recentSuccessTimer = null
      }, 10 * 1000)
    }
  }
)

/**
 * Whether to show validation feedback
 *  yes while invalid, actively validating or still busy saving
 */
const showValidationFeedback = computed<boolean>(() => {
  return busySaving.value || isActive.value || ! isValid.value
})

/**
 * Get the validation status for a specific input field by path
 */
const getStatus = function(path: string): 'none'|'success'|'error' {
  if (showValidationFeedback.value) {
    return getError(path) ? 'error' : 'success'
  }
  return 'none'
}

/**
 * Handle saving the profile information
 */
const handleSubmit = async function handleSubmit() {
  // Ignore submit attempts before we have profile data,
  // or are already busy saving the data
  if (busySaving.value || ! isProfileDataAvailable.value) return 

  busySaving.value = true
  recentSuccess.value = false

  await validate()

  if (! isValid.value) {
    scrolltoError('.validation__message', { offset: 60 });
    busySaving.value = false

  } else {
    try {
      await api.userprofile.putUserProfile({
        email: profileData.value.email, // required input
        givenName: profileData.value.givenName.trim() || '',
        lastName: profileData.value.lastName.trim() || '',
        jobTitle: profileData.value.jobTitle.trim() || null,
        phoneNumber: profileData.value.phoneNumber.trim() || null
      }) 

      recentSuccess.value = true

    } catch(e) {
      // TODO: Error handling & all that fun stuff

      console.error("Failed to save profile", e)
    }
    
    busySaving.value = false
  }
}

onBeforeUnmount(() => {
  if (recentSuccessTimer !== null) {
    clearTimeout(recentSuccessTimer)
  }
})

// TODO: Show a warning if anything was changed without saving ?
const handleClose = function handleClose() {
  isProfileModalOpen.value = false
}

</script>
<template>

  <OverlayModal
    v-show="isProfileModalOpen"
    :active="isProfileModalOpen"
    variant="narrow"
    title="Profiel instellingen"
    class="ProfileModal"
    @close="handleClose">

    <div class="-mx-6 space-y-4 px-6">
      <form
        @submit.prevent="handleSubmit"
        class="space-y-6">

        <h6>Algemeen</h6>
        <Input
          id="givenName"
          label="Voornaam"
          type="text"
          v-model="profileData.givenName"
          placeholder="Voer je voornaam in"
          autocomplete="given-name"
          :disabled="busySaving || !isProfileDataAvailable"
          :validationStatus="getStatus('givenName')"
          :validationMessage="getError('givenName')"
          :tabindex="1"
          required />

        <Input
          id="lastName"
          label="Achternaam"
          type="text"
          v-model="profileData.lastName"
          placeholder="Voer je achternaam in"
          autocomplete="family-name"
          :disabled="busySaving || !isProfileDataAvailable"
          :validationStatus="getStatus('lastName')"
          :validationMessage="getError('lastName')"
          :tabindex="2"
          required />

        <Input
          id="email"
          label="E-mail"
          type="email"
          v-model="profileData.email"
          placeholder="Voer je e-mail in"
          autocomplete="email"
          instruction="Dit e-mail adres kan niet gewijzigd worden"
          :validationStatus="getStatus('email')"
          :validationMessage="getError('email')"
          :disabled="true" />

        <h6>Aanvullend</h6>
        <Input
          id="jobTitle"
          label="Functie"
          type="text"
          v-model="profileData.jobTitle"
          placeholder="Voer je functie in"
          autocomplete="organization-title"
          :disabled="busySaving || !isProfileDataAvailable"
          :validationStatus="getStatus('jobTitle')"
          :validationMessage="getError('jobTitle')"
          :tabindex="3"
        />

        <Input
          id="phoneNumber"
          label="Telefoon"
          type="tel"
          v-model="profileData.phoneNumber"
          placeholder="Voer je telefoonnummer in"
          autocomplete="tel"
          :disabled="busySaving || !isProfileDataAvailable"
          :validationStatus="getStatus('phoneNumber')"
          :validationMessage="getError('phoneNumber')"
          :tabindex="4"
        />

        <Transition>
          <p v-if="recentSuccess" class="rounded-lg border-l-4 border-green-500 bg-green-100 px-4 py-3 text-sm text-green-700" role="status">
            Uw instellingen zijn opgeslagen
          </p>
        </Transition>

        <Button
          type="submit"
          label="Bewaar instellingen"
          :disabled="busySaving || !isProfileDataAvailable" />
      </form>
    </div>
  </OverlayModal>

</template>

<style scoped>
.ProfileModal .panel__content {
  overflow: hidden;
}
</style>