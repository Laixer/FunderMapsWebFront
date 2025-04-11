<script setup lang="ts">
import { type Ref, ref } from 'vue';

import AuthWrapper from '@/components/Layout/AuthWrapper.vue';
import Card from '@/components/Common/Card.vue'
import Button from '@/components/Common/Buttons/Button.vue'
import AnimatedArrowIcon from '@/components/Common/Icons/AnimatedArrowIcon.vue'
import BackArrowIcon from '@/components/Common/Icons/BackArrowIcon.vue'
import Input from '@/components/Common/Inputs/Input.vue';
import api from '@/services/api';

const requestSubmitted: Ref<boolean> = ref(false)

// No validation here. Everything is always ok.
const email: Ref<string> = ref('')

const handleSubmit = async function handleSubmit() {
  if (email.value) {
    await api.auth.requestPasswordReset(email.value)
    requestSubmitted.value = true
  }
}

</script>

<template>
  <AuthWrapper title="Wachtwoord vergeten pagina voor de Fundermaps Applicatie">
    <Card v-if="!requestSubmitted" title="Wachtwoord vergeten" shadow rounded wide>
      <p>
        Om een nieuw wachtwoord aan te maken dien je eerst je e-mail
        in te vullen. Daarna ontvang je een link waarmee je
        een nieuw wachtwoord in kan stellen.
      </p>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <Input id="email" label="E-mail" type="email" v-model="email" placeholder="Voer je e-mail in"
          autocomplete="username" required />

        <Button type="submit" label="Vraag een nieuw wachtwoord aan">
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
    <Card v-else title="Wachtwoord vergeten" shadow rounded wide>

      <p>
        Indien het e-mail adres "{{ email }}" bekend is, ontvang je binnen enkele minuten een e-mail.
        Daarin staat de link waarmee je een nieuw wachtwoord in kan stellen.
      </p>

      <template v-slot:footer>
        <router-link class="flex gap-3" :to="{ name: 'login' }">
          <BackArrowIcon />
          <span>Terug naar de inlog pagina</span>
        </router-link>
      </template>
    </Card>
  </AuthWrapper>
</template>