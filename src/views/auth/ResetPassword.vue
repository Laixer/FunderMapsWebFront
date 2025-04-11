<script setup lang="ts">
import { type Ref, ref, onBeforeMount } from 'vue';
import { z } from 'zod'

import AuthWrapper from '@/components/Layout/AuthWrapper.vue';
import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'
import BackArrowIcon from '@/components/Common/Icons/BackArrowIcon.vue'

import Input from '@/components/Common/Inputs/Input.vue';
import LockedIcon from '@assets/svg/icons/locked.svg'
import UnlockedIcon from '@assets/svg/icons/unlocked.svg'

import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api';
import useValidation from '@/services/useValidation';
const route = useRoute()
const router = useRouter()


// No reset key = No go!
onBeforeMount(() => {
  if (!route.params?.resetKey) {
    router.push({ name: 'forgotten' })
  }
})

/**
 * Form information
 */
const resetFailed: Ref<boolean> = ref(false)
const resetSucceeded: Ref<boolean> = ref(false)
const showPassword: Ref<boolean> = ref(true)
const formData = ref({
  email: '',
  password: '',
  passwordConfirm: ''
})

/** 
 * Keeping it simple. Let the API decide what is valid
 */
const validationSchema = z.object({
  email: z.string({ required_error: 'Dit veld is vereist' }).trim().min(1, 'E-mail is vereist.'),
  password: z.string({ required_error: 'Dit veld is vereist' }).trim().min(5, 'Het wachtwoord moet minimaal 5 karakters lang zijn.'),
  passwordConfirm: z.string({ required_error: 'Dit veld is vereist' }).trim()
})
  .strict()
  .refine((data) => data.password === data.passwordConfirm, {
    message: "De wachtwoorden komen niet overeen.",
    path: ["passwordConfirm"], // path of error
  })

// Activate validator
const {
  validate,
  isValid,
  getError,
  getStatus,
  scrolltoError
} = useValidation(validationSchema, formData)

const handleSubmit = async function handleSubmit() {
  if (!route.params.resetKey) return

  try {
    resetFailed.value = false
    resetSucceeded.value = false

    await validate()

    if (!isValid.value) {
      scrolltoError('.validation__message', { offset: 60 })
    } else {
      await api.auth.resetPassword(
        formData.value.email,
        route.params.resetKey as string,
        formData.value.password
      )

      resetSucceeded.value = true
    }
  } catch (e) {
    resetFailed.value = true
  }
}


</script>

<template>
  <AuthWrapper title="Wachtwoord wijzigen pagina voor de Fundermaps Applicatie">
    <Card v-if="!resetSucceeded" title="Voer nieuw wachtwoord in" shadow rounded wide>

      <div v-if="resetFailed" class="flex justify-between">
        <p class="text-red-500">
          Het wijzigen van het wachtwoord is niet gelukt.
          Mogelijk is de eenmalige reset sleutel reeds verlopen.
          In dat geval moet je <router-link :to="{ name: 'forgotten' }">een nieuw verzoek indienen om het wachtwoord te
            wijzigen</router-link>.
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <Input id="email" label="E-mail" type="email" v-model="formData.email" placeholder="Voer je e-mail in"
          autocomplete="username" :validationStatus="getStatus('email')" :validationMessage="getError('email')"
          :tabindex="1" required />

        <Input id="password" label="Nieuw wachtwoord" :type="showPassword ? 'text' : 'password'"
          v-model="formData.password" placeholder="Voer je nieuwe nieuwe wachtwoord in" autocomplete="new-password"
          :validationStatus="getStatus('password')" :validationMessage="getError('password')" :tabindex="2" required>

        <template #before>
          <button type="button">
            <LockedIcon v-show="!showPassword" class="aspect-square w-4 text-grey-700" aria-hidden="true"
              @click="() => showPassword = true" />
            <UnlockedIcon v-show="showPassword" class="aspect-square w-4 text-grey-700" aria-hidden="true"
              @click="() => showPassword = false" />
            <span class="sr-only"> Toggle wachtwoord zichtbaarheid </span>
          </button>
        </template>

        </Input>

        <Input id="confirm-password" label="Herhaal nieuw wachtwoord" :type="showPassword ? 'text' : 'password'"
          v-model="formData.passwordConfirm" placeholder="Herhaal hier je nieuwe wachtwoord" autocomplete="new-password"
          :validationStatus="getStatus('passwordConfirm')" :validationMessage="getError('passwordConfirm')" required>

        <template #before>
          <button type="button">
            <LockedIcon v-show="!showPassword" class="aspect-square w-4 text-grey-700" aria-hidden="true"
              @click="() => showPassword = true" />
            <UnlockedIcon v-show="showPassword" class="aspect-square w-4 text-grey-700" aria-hidden="true"
              @click="() => showPassword = false" />
            <span class="sr-only"> Toggle wachtwoord zichtbaarheid </span>
          </button>
        </template>

        </Input>

        <Button type="submit" label="Stel een nieuw wachtwoord in">
          <template v-slot:after>
            <AnimatedArrowIcon />
          </template>
        </Button>
      </form>

      <template v-slot:footer>
        <router-link class="flex gap-3" :to="{ name: 'login' }">
          <BackArrowIcon />
          <span>Terug naar de inlog pagina</span>
        </router-link>
      </template>
    </Card>

    <Card v-else title="Gelukt">
      <p>Je wachtwoord is nu veranderd en je kunt hier vanaf nu mee inloggen.</p>

      <Button type="button" label="Terug naar het inlogscherm" @click.prevent="router.push({ name: 'login' })">
        <template v-slot:after>
          <AnimatedArrowIcon />
        </template>
      </Button>
    </Card>

  </AuthWrapper>
</template>