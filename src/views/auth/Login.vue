
<script setup lang="ts">
import { type Ref, ref } from 'vue';
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

const router = useRouter()
const sessionStore = useSessionStore()
const orgsStore = useOrgsStore()

/**
 * Form information
 */
const loginFailed: Ref<boolean> = ref(false) 
const showPassword: Ref<boolean> = ref(false)
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
const handleSubmit = async function() {  
  try {
    loginFailed.value = false

    await validate()

    if (! isValid.value) {
      scrolltoError('.validation__message', { offset: 60 })
    } else {
      await sessionStore.login(
        formData.value.email, 
        formData.value.password
      )

      await orgsStore.loadAvailableOrgs()

      // TODO: Get previous route before 'Login' & redirect back to that route
      router.push({ name: 'home' })
    }
  } catch(e) {
    console.log(e)
    loginFailed.value = true
  }
}
</script>

<template>
  <AuthWrapper title="Inlogpagina voor de Fundermaps Applicatie">
    <Card title="Inloggen" shadow rounded wide>

      <div 
        v-if="loginFailed"
        class="flex justify-between">
        <p class="text-red-500">
          De e-mail en wachtwoord combinatie is onjuist.
        </p>
      </div>
      
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <Input 
          id="email" 
          label="E-mail" 
          type="email"
          v-model="formData.email" 
          placeholder="Voer je e-mail in"
          autocomplete="username"
          :validationStatus="getStatus('email')"
          :validationMessage="getError('email')"
          :tabindex="1"
          required />

        <Input 
          id="password"
          label="Wachtwoord"
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.password"
          placeholder="Voer je wachtwoord in"
          autocomplete="current-password" 
          :validationStatus="getStatus('password')"
          :validationMessage="getError('password')"
          :tabindex="2"
          required >

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

        <Button type="submit" label="Log in">
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