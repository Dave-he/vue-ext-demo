import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '../components/Popup.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')