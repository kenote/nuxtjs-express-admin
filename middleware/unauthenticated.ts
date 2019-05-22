import nuxt from '~/types/nuxt'
import * as auth from '~/store/modules/auth'
import { responseDocument } from '~/server/types/proxys/user'

export default function (context: nuxt.Context): void {
  // If the user is not authenticated
  let { store, redirect, route } = context
  let Auth: auth.State = store.state.auth
  let user: responseDocument | null = Auth.user
  if (user) {
    return redirect(`/dashboard`)
  }
}