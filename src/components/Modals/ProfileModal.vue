<script setup lang="ts">

import { type Ref, ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { z } from 'zod'
import { DutchMobilePhoneRegex } from '@/utils/validation'

import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';
import Button from '@/components/Common/Buttons/Button.vue'
import Input from '@/components/Common/Inputs/Input.vue';
// import Modal from '@/components/Common/Modal.vue'
import OverlayModal from '@/components//Common/OverlayModal.vue';
import LoadingIndicator from '@/components/Branding/LoadingIndicator.vue';

import { useSessionStore } from '@/store/session'
import { useMainStore } from '@/store/main'

import api from '@/services/api'

import useValidation from '@/services/useValidation';
const { isProfileModalOpen } = storeToRefs( useMainStore() )
const { isAuthenticated } = storeToRefs( useSessionStore() )

/**
 * Whether the profile data has been retrieved from the API
 */
const isProfileDataAvailable: Ref<boolean> = ref(false)

/**
 * Saving indicator 
 */
const busySaving: Ref<boolean> = ref(false)

/**
 * The profile data (filled with placeholder data to satisfy the validator)
 */
const profileData = ref()

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
  errors, 
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
      console.log("Activate")
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
  
  console.log("PROFILE - Submit")
  console.log(busySaving.value, ! isProfileDataAvailable.value, busySaving.value || ! isProfileDataAvailable.value)

  // Ignore submit attempts before we have profile data, 
  // or are already busy saving the data
  if (busySaving.value || ! isProfileDataAvailable.value) return 

  busySaving.value = true

  await validate()

  if (! isValid.value) {
    console.log("PROFILE - NOT valid")
    console.log(errors)
    
    scrolltoError('.validation__message', { offset: 60 });
    busySaving.value = false

  } else {
    
    await api.userprofile.putUserProfile({
      email: profileData.value.email, // required input
      givenName: profileData.value.givenName.trim() || '',
      lastName: profileData.value.lastName.trim() || '',
      jobTitle: profileData.value.jobTitle.trim() || null,
      phoneNumber: profileData.value.phoneNumber.trim() || null
    }) 
    
    // TODO: Error handling & all that fun stuff

    busySaving.value = false
  }
}

// TODO: Show a warning if anything was changed without saving ?
const handleClose = function handleClose() {
  isProfileModalOpen.value = false
}

</script>
<template>

  <OverlayModal 
    v-show="isProfileModalOpen"
    variant="narrow" 
    title="Profiel instellingen"
    @close="handleClose">

    <Transition mode="out-in">
      <div class="-mx-6 space-y-4 px-6" v-if="isProfileDataAvailable">
        <form 
          action="#" 
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
            :disabled="busySaving"
            :validationStatus="getStatus('givenName')"
            :validationMessage="getError('givenName')"
            required />

          <Input 
            id="lastName" 
            label="Achternaam" 
            type="text"
            v-model="profileData.lastName" 
            placeholder="Voer je achternaam in"
            autocomplete="family-name"
            :disabled="busySaving"
            :validationStatus="getStatus('lastName')"
            :validationMessage="getError('lastName')"
            required />

          <Input 
            id="email" 
            label="E-mail" 
            type="email"
            v-model="profileData.email" 
            placeholder="Voer je e-mail in"
            autocomplete="username"
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
            :disabled="busySaving"
            :validationStatus="getStatus('jobTitle')"
            :validationMessage="getError('jobTitle')"
          />

          <Input 
            id="phoneNumber" 
            label="Telefoon" 
            type="text"
            v-model="profileData.phoneNumber" 
            placeholder="Voer je telefoonnummer in"
            autocomplete="tel"
            :disabled="busySaving"
            :validationStatus="getStatus('phoneNumber')"
            :validationMessage="getError('phoneNumber')"
          />

          <Button 
            type="submit" 
            label="Bewaar instellingen"
            :disabled="busySaving">
            <template v-slot:after>
              <AnimatedArrowIcon class="h-4" />
            </template>
          </Button>
        </form>
      </div>
      <div 
        v-else
        class="flex flex-col items-center space-y-6">
        <LoadingIndicator label="Uw profiel informatie wordt opgehaald..." />
      </div>
    </Transition>
  </OverlayModal>

</template>