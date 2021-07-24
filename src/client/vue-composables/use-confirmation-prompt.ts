import { Ref, ref, DefineComponent, defineComponent, createApp } from 'vue'

let confirmationModalComponent: DefineComponent<unknown, unknown, unknown> | null = null
const isMounted = false

export type SetupOptions = {
  message: Ref<string>
  confirmText: Ref<string>
  cancelText: Ref<string>
  processing: Ref<boolean>
  show: Ref<boolean>
}
let setupOptions: SetupOptions | null = null
let selectedEntity: Ref<unknown> | null = null
let confirmCallbacks: Array<(entity: unknown) => Promise<void>> = []

const resetOptions = () => {
  if (!setupOptions) {
    return
  }
  setupOptions.show.value = false
  setupOptions.processing.value = false
  setupOptions.cancelText.value = ''
  setupOptions.confirmText.value = ''
  setupOptions.message.value = ''
}

export const setupConfirmationPrompt = (
  modalComponent: DefineComponent<unknown, unknown, unknown>
) => {
  if (confirmationModalComponent) {
    throw new Error('Confirmation prompt has been set up already')
  }
  confirmationModalComponent = modalComponent
}

type Options<Entity extends unknown> = {
  onConfirmed: (entity: Entity) => Promise<void>
  confirmText?: string
  cancelText?: string
  question?: string | ((entity: Entity) => string)
}
const useConfirmationPrompt = <Entity extends unknown>(options: Options<Entity>) => {
  if (!confirmationModalComponent) {
    throw new Error('Confirmation prompt needs to be set up first')
  }
  if (!setupOptions) {
    setupOptions = {
      cancelText: ref(''),
      confirmText: ref(''),
      processing: ref(false),
      message: ref(''),
      show: ref(false)
    }
  }
  if (!selectedEntity) {
    selectedEntity = ref(null)
  }
  if (!isMounted) {
    const modalView = defineComponent({
      extends: confirmationModalComponent,
      data() {
        if (!setupOptions) {
          throw new Error('Setup options should be present here')
        }
        return {
          ...setupOptions,
          onCancel: () => {
            confirmCallbacks = []
            resetOptions()
          },
          onConfirm: async () => {
            if (!setupOptions) return
            const currentEntity = selectedEntity?.value ?? null
            setupOptions.processing.value = true
            try {
              await Promise.all(confirmCallbacks.map((callback) => callback(currentEntity)))
            } catch {
              //
            }
            resetOptions()
            // @ts-expect-error entity type is lost here
            options.onConfirmed(currentEntity)
          }
        }
      }
    })
    const div = document.createElement('div')
    const element = document.getElementById('app')
    if (!element) {
      throw new Error('There is no `#app` html element')
    }
    element.appendChild(div)
    createApp(modalView).mount(div)
  }
  const trigger = (entity: Entity) => {
    if (!setupOptions || !selectedEntity) {
      throw new Error('Setup options or entity ref are not present')
    }
    if (setupOptions.show.value || selectedEntity.value) return
    setupOptions.message.value =
      typeof options.question === 'function' ? options.question(entity) : options.question ?? ''
    setupOptions.cancelText.value = options.cancelText ?? 'Cancel'
    setupOptions.confirmText.value = options.confirmText ?? 'OK'
    selectedEntity.value = entity
    setupOptions.show.value = true
    setupOptions.processing.value = false
    const callback = options.onConfirmed as (ent: unknown) => Promise<void>
    confirmCallbacks.push(callback)
  }

  return { trigger }
}

export default useConfirmationPrompt
