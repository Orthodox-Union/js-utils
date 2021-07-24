import { ref, Ref, inject } from 'vue'
import { Router } from 'vue-router'
import oidcClient, { User, UserManagerSettings } from 'oidc-client'

const client_id = process.env.VUE_APP_OIDC_CLIENT_ID
if (!client_id) throw new Error(`VUE_APP_OIDC_CLIENT_ID should be present in process.env`)

export const routerInjectionSymbol = Symbol('router')

const oktaUser: Ref<User | null> = ref(null)

oidcClient.Log.logger = console
const protocol = window.location.protocol
const hostname = window.location.hostname
const port = window.location.port
const settings: UserManagerSettings = {
  authority: 'https://ou.okta.com',
  client_id,
  redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/callback`,
  silent_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/silent-renew`,
  post_logout_redirect_uri: `${protocol}//${hostname}${port ? `:${port}` : ''}/`,
  automaticSilentRenew: true,
  response_type: 'id_token token',
  scope: 'openid profile email',
  userStore: new oidcClient.WebStorageStateStore({
    store: window.localStorage
  })
}

const userManager = new oidcClient.UserManager(settings)
userManager.events.addUserLoaded((user) => {
  const router: Router | undefined = inject(routerInjectionSymbol)
  if (!router) {
    throw new Error(
      `Router wasn't provided using 'routerInjectionSymbol' from this module. 
      Please, call 'provide(routerInjectionSymbol, router)' in your vue main.ts file`
    )
  }
  oktaUser.value = user
  const desiredUrl: string | undefined = user.state
  const currentURL = window.location.pathname
  if (desiredUrl && desiredUrl !== currentURL) {
    router.push(desiredUrl)
  }
})

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const useAuthentication = () => {
  const login = async (currentUrl: string) => {
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
    oktaUser.value = null
    await userManager.signoutRedirect()
  }
  return { oktaUser, login, onLogout }
}

export default useAuthentication
