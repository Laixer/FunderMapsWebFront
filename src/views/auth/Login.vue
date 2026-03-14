<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod'

import AuthWrapper from '@/components/Layout/AuthWrapper.vue';
import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'

import Input from '@/components/Common/Inputs/Input.vue';
import LockedIcon from '@assets/svg/icons/locked.svg'
import UnlockedIcon from '@assets/svg/icons/unlocked.svg'

import useValidation from '@/services/useValidation';

import { useRouter } from 'vue-router'
import { useSessionStore } from '@/store/session';
import { useOrgsStore } from '@/store/orgs'
import { useMetadataStore } from '@/store/metadata'

const router = useRouter()
const sessionStore = useSessionStore()
const orgsStore = useOrgsStore()
const metadataStore = useMetadataStore()

/**
 * Form information
 */
const loginFailed = ref(false)
const busyLoggingIn = ref(false)
const showPassword = ref(false)
const formData = ref({
  email: '',
  password: ''
})

/** 
 * Keeping it simple. Let the API decide what is valid
 */
const validationSchema = z.object({
  email: z.string().min(1, 'E-mail is vereist.'),
  password: z.string().min(1, 'Wachtwoord is vereist.'),
}).strict()

// Activate validator
const {
  validate,
  isValid,
  getError,
  getStatus,
  scrolltoError
} = useValidation(validationSchema, formData)

/**
 * Handle form submit
 */
const handleSubmit = async function () {
  try {
    loginFailed.value = false
    busyLoggingIn.value = true

    await validate()

    if (!isValid.value) {
      scrolltoError('.validation__message', { offset: 60 })
    } else {
      await sessionStore.login(
        formData.value.email,
        formData.value.password
      )

      await orgsStore.loadAvailableOrgs()

      await metadataStore.retrieve()

      // TODO: Get previous route before 'Login' & redirect back to that route
      router.push({ name: 'home' })
    }
  } catch (e) {
    console.error('Login failed:', e)
    loginFailed.value = true
  } finally {
    busyLoggingIn.value = false
  }
}
</script>

<template>
  <AuthWrapper title="Inlogpagina voor de Fundermaps Applicatie">
    <Card title="Inloggen" shadow rounded wide>

      <p v-if="loginFailed" class="rounded-lg border-l-4 border-red-500 bg-yellow-100 px-4 py-3 text-sm text-red-500" role="alert">
        De e-mail en wachtwoord combinatie is onjuist.
      </p>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <Input id="email" label="E-mail" type="email" v-model="formData.email" placeholder="Voer je e-mail in"
          autocomplete="username" :validationStatus="getStatus('email')" :validationMessage="getError('email')"
          :tabindex="1" required />

        <Input id="password" label="Wachtwoord" :type="showPassword ? 'text' : 'password'" v-model="formData.password"
          placeholder="Voer je wachtwoord in" autocomplete="current-password" :validationStatus="getStatus('password')"
          :validationMessage="getError('password')" :tabindex="2" required>

        <template #before>
          <button type="button" :aria-pressed="showPassword" aria-label="Toggle wachtwoord zichtbaarheid" @click="showPassword = !showPassword">
            <LockedIcon v-show="!showPassword" class="aspect-square w-4 text-grey-700" aria-hidden="true" />
            <UnlockedIcon v-show="showPassword" class="aspect-square w-4 text-grey-700" aria-hidden="true" />
          </button>
        </template>

        </Input>

        <Button type="submit" label="Log in" :disabled="busyLoggingIn">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </form>

      <template v-slot:footer>
        <router-link :to="{ name: 'forgotten' }">
          Help, ik ben mijn wachtwoord vergeten
        </router-link>
      </template>
    </Card>
  </AuthWrapper>
</template>