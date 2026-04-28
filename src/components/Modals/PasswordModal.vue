<script setup lang="ts">

import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { z } from 'zod'

import Button from '@/components/Common/Buttons/Button.vue'
import Input from '@/components/Common/Inputs/Input.vue';
import OverlayModal from '@/components/Common/OverlayModal.vue';
import LockedIcon from '@assets/svg/icons/locked.svg'
import UnlockedIcon from '@assets/svg/icons/unlocked.svg'

import { useMainStore } from '@/store/main'

import api from '@/services/api'

import useValidation from '@/services/useValidation';
const { isPasswordModalOpen } = storeToRefs( useMainStore() )

/**
 * Form information
 */
const changeFailed = ref(false)
const changeSucceeded = ref(false)
const showPassword = ref(true)
const formData = ref({
  oldPassword: '',
  newPassword: '',
  passwordConfirm: ''
})

/**
 * Saving indicator 
 */
const busySaving = ref(false)

/** 
 * Keeping it simple. Let the API decide what is valid
 */
const validationSchema = z.object({
  oldPassword: z.string({ error: 'Dit veld is vereist' }).trim(),
  newPassword: z.string({ error: 'Dit veld is vereist' }).trim().min(5, 'Het wachtwoord moet minimaal 5 karakters lang zijn.'),
  passwordConfirm: z.string({ error: 'Dit veld is vereist' }).trim()
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
  } catch (e) {
    console.error('Failed to change password:', e)
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
    :active="isPasswordModalOpen"
    variant="narrow"
    title="Wachtwoord wijzigen"
    class="PasswordModal"
    @close="handleClose">

    <div class="space-y-4">
      <p v-if="changeFailed" class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500" role="alert">
        Het wijzigen van het wachtwoord is niet gelukt.
      </p>
      <p v-if="changeSucceeded" class="rounded-lg border-l-4 border-green-500 bg-green-100 px-4 py-3 text-sm text-green-700" role="status">
        Het wijzigen van het wachtwoord is gelukt.
      </p>

      <form
        v-if="! changeSucceeded"
        @submit.prevent="handleSubmit"
        class="space-y-6">

        <Input
          id="current-password"
          label="Huidige wachtwoord"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.oldPassword"
          placeholder="Voer je huidige wachtwoord in"
          autocomplete="current-password"
          :validationStatus="getStatus('oldPassword')"
          :validationMessage="getError('oldPassword')"
          :tabindex="1"
          required>

          <template #before>
            <button type="button" :aria-pressed="showPassword" aria-label="Toggle wachtwoord zichtbaarheid" @click="showPassword = !showPassword">
              <LockedIcon
                v-show="! showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
              />
            </button>
          </template>
        </Input>

        <Input
          id="new-password"
          label="Nieuw wachtwoord"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.newPassword"
          placeholder="Voer je nieuwe wachtwoord in"
          autocomplete="new-password"
          :validationStatus="getStatus('newPassword')"
          :validationMessage="getError('newPassword')" 
          :tabindex="2"
          required>

          <template #before>
            <button type="button" :aria-pressed="showPassword" aria-label="Toggle wachtwoord zichtbaarheid" @click="showPassword = !showPassword">
              <LockedIcon
                v-show="! showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
              />
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
            <button type="button" :aria-pressed="showPassword" aria-label="Toggle wachtwoord zichtbaarheid" @click="showPassword = !showPassword">
              <LockedIcon
                v-show="! showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
              />
              <UnlockedIcon
                v-show="showPassword"
                class="aspect-square w-4 text-grey-700"
                aria-hidden="true"
              />
            </button>
          </template>

        </Input>

        <Button
          type="submit"
          label="Stel een nieuw wachtwoord in"
          :disabled="busySaving" />
      </form>
    </div>
  </OverlayModal>

</template>

<style scoped>
.PasswordModal .panel__content {
  overflow: hidden;
}
</style>