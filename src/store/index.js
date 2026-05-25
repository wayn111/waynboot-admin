import { createStore } from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import permission from './modules/permission'
import user from './modules/user'

const store = createStore({
  modules: {
    app,
    settings,
    permission,
    user
  },
  getters
})

export default store
