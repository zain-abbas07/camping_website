import './assets/output.css';
// import 'leaflet/dist/leaflet.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import App from './App.vue'
import router from './router'

// import './assets/main.css';
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueGoogleMaps, {
    load: {
      key: 'AIzaSyDueUsrUuJz2br5gM__5ynMz7ff4DJ2-8Y', 
    },
  })
app.mount('#app')
