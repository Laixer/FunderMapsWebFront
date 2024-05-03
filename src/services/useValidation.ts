/** 
 * Shamelessly copied from https://dev.to/kouts/a-simple-vue-form-validation-composable-with-zod-38m8
 * And modified on 13-04-2024
 */


// Import necessary libraries
import { type ZodTypeAny, z } from 'zod'
// We use `get` and `groupBy` from `lodash` for brevity
import { get, groupBy } from 'lodash-es' 
import { ref, watch, computed, toValue, type MaybeRefOrGetter } from 'vue'

export default function <T extends ZodTypeAny>(schema: T, data: MaybeRefOrGetter<Record<string, unknown>>, options?: { mode: 'eager' | 'lazy' }) {
  // Merge default options with user-defined options
  const opts = Object.assign({}, { mode: 'lazy' }, options)

  // Reactive variables to track form validity and errors
  const isValid = ref(true)
  const errors = ref<Record<string, z.ZodIssue[]> | null>(null)
  const hasRun = ref(false)

  // Function to clear errors
  const clearErrors = () => {
    errors.value = null
  }

  // Function to initiate validation watch
  let unwatch = ref<null | (() => void)>(null)
  const validationWatch = () => {
    if (unwatch.value !== null) {
      return
    }

    unwatch.value = watch(
      () => toValue(data),
      async () => {
        await validate()
      },
      { deep: true }
    )
  }
  // Alias
  const activate = validationWatch

  // Function to deactivate the active validation process
  const deactivate = () => {
    if (unwatch.value) {
      unwatch.value()
      unwatch.value = null
    }
  }
  
  // Reactive variable to track whether the validation is actively watching
  const isActive = computed<boolean>(() => {
    return unwatch.value !== null
  })

  // Function to perform validation
  const validate = async () => {
    clearErrors()

    // Validate the form data using Zod schema
    const result = await schema.safeParseAsync(toValue(data))

    // Update validity and errors based on validation result
    isValid.value = result.success
    hasRun.value = true

    if (!result.success) {
      errors.value = groupBy(result.error.issues, 'path')
      validationWatch()
    }

    return errors
  }

  // Function to scroll to the first error in the form
  const scrolltoError = (selector = '.is-error', options = { offset: 0 }) => {
    const element = document.querySelector(selector)

    if (element) {
      const topOffset = element.getBoundingClientRect().top - document.body.getBoundingClientRect().top - options.offset

      window.scrollTo({
        behavior: 'smooth',
        top: topOffset
      })
    }
  }

  // Function to get the error message for a specific form field, can be used to get errors for nested objects using dot notation path.
  const getError = (path: string) => get(errors.value, `${path.replaceAll('.', ',')}.0.message`)

  // Function to check whether a specific field has cleared or failed validation
  const getStatus = (path: string) => {
    if (hasRun.value === false) return 'none'
    return get(errors.value, `${path.replaceAll('.', ',')}.0.message`) ? 'error' : 'success'
  }

  // Function to deactivate and reset validation
  const reset = () => {
    deactivate()
    clearErrors()
    isValid.value = true
    hasRun.value = false
  }

  // Activate validation watch based on the chosen mode
  if (opts.mode === 'eager') {
    validationWatch()
  }

  // Expose functions and variables for external use
  return { validate, errors, isValid, isActive, deactivate, activate, reset, getStatus, clearErrors, getError, scrolltoError }
}