import { useToast, ToastInterface } from 'vue-toastification'

// for some unholy reason ToastOptions are not exported from the package, so they need to be extracted in this way
export type ToastOptions = Omit<
  Exclude<Parameters<ToastInterface['success']>[1], undefined>,
  'type'
>

const { success, error } = useToast()

type ShowMessage = (message: string, options?: ToastOptions) => void
const defaultOptions: ToastOptions = { timeout: 5000 }

const useToasted = () => {
  const showSuccess: ShowMessage = (message, options = {}) => {
    success(message, { ...defaultOptions, ...options })
  }
  const showError: ShowMessage = (message, options = {}) => {
    error(message, { ...defaultOptions, ...options })
  }
  return { showSuccess, showError }
}

export default useToasted
