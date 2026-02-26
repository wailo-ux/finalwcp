import { reactive } from 'vue'

export const mqttState = reactive({
  mqttOnline: false, // Status internet website ke server HiveMQ
  espOnline: false   // Status alat ESP32 di lapangan
})