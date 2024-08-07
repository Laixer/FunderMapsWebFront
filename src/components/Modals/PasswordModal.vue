<script setup lang="ts">

import { type Ref, ref, onBeforeMount } from 'vue';
import { storeToRefs } from 'pinia';
import { z } from 'zod'
import { useRouter } from 'vue-router'

import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue';
import Button from '@/components/Common/Buttons/Button.vue'
import Input from '@/components/Common/Inputs/Input.vue';
// import Modal from '@/components/Common/Modal.vue'
import OverlayModal from '@/components//Common/OverlayModal.vue';
import LockedIcon from '@assets/svg/icons/locked.svg'
import UnlockedIcon from '@assets/svg/icons/unlocked.svg'

import { useSessionStore } from '@/store/session'
import { useMainStore } from '@/store/main'

import api from '@/services/api'

import useValidation from '@/services/useValidation';
const { isPasswordModalOpen } = storeToRefs( useMainStore() )
const { isAuthenticated } = storeToRefs( useSessionStore() )

const router = useRouter()

// Not logged in => redirect to login page
onBeforeMount(() => {
  if (! isAuthenticated) {
    router.push({ name: 'login' })
  }
})

/**
 * Form information
 */
const changeFailed: Ref<boolean> = ref(false) 
const changeSucceeded: Ref<boolean> = ref(false) 
const showPassword: Ref<boolean> = ref(true)
const formData = ref({
  oldPassword: '',
  newPassword: '',
  passwordConfirm: ''
})

/**
 * Saving indicator 
 */
const busySaving: Ref<boolean> = ref(false)

/** 
 * Keeping it simple. Let the API decide what is valid
 */
const validationSchema = z.object({
  oldPassword: z.string({ required_error: 'Dit veld is vereist' }).trim(),
  newPassword: z.string({ required_error: 'Dit veld is vereist' }).trim().min(5, 'Het wachtwoord moet minimaal 5 karakters lang zijn.'),
  passwordConfirm: z.string({ required_error: 'Dit veld is vereist' }).trim()
})
.strict()
.refine((data) => data.newPassword === data.passwordConfirm, {
  message: "De wachtwoorden komen niet overeen.",
  path: ["passwordConfirm"], // path of error
})

// Activate validator
const { 
  validate, 
  isValid, 
  getError,
  getStatus,
  scrolltoError,
  deactivate,
  reset 
} = useValidation(validationSchema, formData) 

const handleSubmit = async function handleSubmit() {
  
  try {
    busySaving.value = true
    changeFailed.value = false
    changeSucceeded.value = false

    await validate()

    if (! isValid.value) {
      scrolltoError('.validation__message', { offset: 60 })
    } else {
      await api.auth.changePassword(
        formData.value.oldPassword,
        formData.value.newPassword
      )

      changeSucceeded.value = true

      // clear fields & reset validation
      deactivate()
      formData.value.oldPassword = ''
      formData.value.newPassword = ''
      formData.value.passwordConfirm = ''
      reset()
    } 

    busySaving.value = false
  } catch(e) {
    changeFailed.value = true
    busySaving.value = false
  }
}


// TODO: Show a warning if anything was changed without saving ?
const handleClose = function handleClose() {
  isPasswordModalOpen.value = false
}

</script>
<template>

  <OverlayModal 
    v-show="isPasswordModalOpen"
    variant="narrow" 
    title="Wachtwoord wijzigen"
    class="ProfileModal"
    @close="handleClose">

    <div class="-mx-6 space-y-4 px-6">
      <div 
        v-if="changeFailed"
        class="flex justify-between">
        <p class="text-red-500">
          Het wijzigen van het wachtwoord is niet gelukt.
        </p>
      </div>
      <div 
        v-if="changeSucceeded"
        class="flex justify-between">
        <p class="text-green-500">
          Het wijzigen van het wachtwoord is gelukt.
        </p>
      </div>

      <form 
        v-if="! changeSucceeded"
        action="#" 
        @submit.prevent="handleSubmit"
        class="space-y-6">

        <Input 
          id="oldPassword" 
          label="Huidige wachtwoord" 
          type="password"
          v-model="formData.oldPassword" 
          placeholder="Voer je huidige wachtwoord in"
          autocomplete="password"
          :validationStatus="getStatus('oldPassword')"
          :validationMessage="getError('oldPassword')"
          :tabindex="1"
          required>

          <template #before>
            <button type="button">
              <LockedIcon
                v-show="! showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => showPassword = true"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => showPassword = false"
              />
              <span class="sr-only"> Toggle wachtwoord zichtbaarheid </span>
            </button>
          </template>
        </Input>

        <Input 
          id="password"
          label="Nieuw wachtwoord"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.newPassword"
          placeholder="Voer je nieuwe nieuwe wachtwoord in"
          autocomplete="new-password"
          :validationStatus="getStatus('newPassword')"
          :validationMessage="getError('newPassword')" 
          :tabindex="2"
          required>

          <template #before>
            <button type="button">
              <LockedIcon
                v-show="! showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => showPassword = true"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => showPassword = false"
              />
              <span class="sr-only"> Toggle wachtwoord zichtbaarheid </span>
            </button>
          </template>
        </Input>

        <Input 
          id="confirm-password"
          label="Herhaal nieuw wachtwoord"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.passwordConfirm"
          placeholder="Herhaal hier je nieuwe wachtwoord"
          autocomplete="new-password"
          :validationStatus="getStatus('passwordConfirm')"
          :validationMessage="getError('passwordConfirm')"  
          required>

          <template #before>
            <button type="button">
              <LockedIcon
                v-show="! showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => showPassword = true"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
                @click="() => showPassword = false"
              />
              <span class="sr-only"> Toggle wachtwoord zichtbaarheid </span>
            </button>
          </template>

        </Input>

        <Button 
          type="submit" 
          label="Stel een nieuw wachtwoord in"
          :disabled="busySaving">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </form>
    </div>
  </OverlayModal>

</template>

<style>
.ProfileModal .panel__content {
  overflow: hidden;
}
</style>