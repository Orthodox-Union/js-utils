import { ref, Ref } from 'vue'
import { Router } from 'vue-router'
import oidcClient, { User, UserManagerSettings } from 'oidc-client'

export const routerInjectionSymbol = Symbol('router')

const oktaUser: Ref<User | null> = ref(null)

oidcClient.Log.logger = console

let userManager: oidcClient.UserManager | null = null

export const setupAuthentication = (settings: UserManagerSettings) => {
  if (userManager) {
    throw new Error('The oidc client is already initialized')
  }
  if (!settings.client_id || typeof settings.client_id !== 'string') {
    throw new Error('OIDC client ID should be provided when setting up oidc client')
  }

  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port
  const composedSettings: UserManagerSettings = {
    authority: 'https://ou.okta.com',
    redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/callback`,
    silent_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/silent-renew`,
    post_logout_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/`,
    automaticSilentRenew: true,
    response_type: 'id_token token',
    scope: 'openid profile email',
    userStore: new oidcClient.WebStorageStateStore({
      store: window.localStorage
    }),
    ...settings
  }
  userManager = new oidcClient.UserManager(composedSettings)
  userManager.events.addUserLoaded((user) => {
    // @ts-expect-error ts doesn't allow using symbols to store data in the global window object
    const router: Router | undefined = window[routerInjectionSymbol]
    if (!router) {
      throw new Error(
        `Router wasn't provided using 'routerInjectionSymbol' from this module. 
        Please, call 'window[routerInjectionSymbol] = router' in your vue main.ts file`
      )
    }
    oktaUser.value = user
    const desiredUrl: string | undefined = user.state
    const currentURL = window.location.pathname
    if (desiredUrl && desiredUrl !== currentURL) {
      router.push(desiredUrl)
    }
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useAuthentication = () => {
  if (!userManager) {
    throw new Error('User manager is not initialized. Please, call setupAuthentication first')
  }
  const login = async (currentUrl: string) => {
    if (!userManager) return
    if (currentUrl === '/silent-renew') {
      await userManager.signinSilentCallback()
      return
    }

    const user = await userManager.getUser()
    const isTokenExpired =
      new Date().getTime() > new Date(user ? user.expires_at * 1000 : 0).getTime()
    if (user && !isTokenExpired) {
      oktaUser.value = user
      return
    }
    if (currentUrl === '/callback') {
      await userManager.signinCallback()
      return
    }
    userManager.signinRedirect({ state: currentUrl })
  }

  const onLogout = async () => {
    if (!userManager) return
    oktaUser.value = null
    await userManager.signoutRedirect()
  }
  return { oktaUser, login, onLogout }
}

export default useAuthentication
