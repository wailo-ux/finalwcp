<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import mqtt from 'mqtt'

const mqttConfig = {
  host: '64bfa2f7c0184568b06541ef6d59d621.s1.eu.hivemq.cloud',
  port: 8884,
  username: 'topaabp',
  password: 'Admin123_',
}

const client = ref(null)
const mqttConnected = ref(false)
const sensorData = ref({ rain: 0, temp: 0, hum: 0, r: 0, d: 0, main_10: true, buf_100: false, buf_90: true, mode: 'auto' })
const manualMode = ref(false)
const localRefill = ref(false)
const localDose = ref(false)

// Variabel untuk Parameter
const inputRainLimit = ref(0)
const inputDelaySec = ref(0)
let isParamInitialized = false // Agar input tidak tertimpa terus saat ngetik

const historyLogs = ref([])
const isLoading = ref(false)

const connectMQTT = () => {
  const url = `wss://${mqttConfig.host}:${mqttConfig.port}/mqtt`
  client.value = mqtt.connect(url, {
    clientId: 'VueDash-' + Math.random().toString(16).substring(2, 8),
    username: mqttConfig.username,
    password: mqttConfig.password,
    clean: true,
  })

  client.value.on('connect', () => {
    mqttConnected.value = true
    client.value.subscribe('pt_top/dosing/site_a/data')
  })

  client.value.on('message', (topic, message) => {
    if (topic === 'pt_top/dosing/site_a/data') {
      try {
        const payload = JSON.parse(message.toString())
        sensorData.value = { ...sensorData.value, ...payload }
        localRefill.value = payload.r == 1
        localDose.value = payload.d == 1
        manualMode.value = payload.mode === 'manual'

        // Mengambil data parameter terakhir dari ESP32 saat web baru dibuka
        if (!isParamInitialized && payload.rain_limit !== undefined && payload.delay_sec !== undefined) {
          inputRainLimit.value = payload.rain_limit
          inputDelaySec.value = payload.delay_sec
          isParamInitialized = true
        }
      } catch (e) { console.error("JSON Error", e) }
    }
  })

  client.value.on('close', () => { mqttConnected.value = false })
  client.value.on('error', () => { mqttConnected.value = false })
}

const sendCommand = (payloadObj) => {
  if (client.value && mqttConnected.value) {
    client.value.publish('pt_top/dosing/site_a/command', JSON.stringify(payloadObj))
  }
}

const toggleAuto = () => {
  sendCommand({ mode: manualMode.value ? 'manual' : 'auto' })
}

const controlValve = (type) => {
  if (type === 'REFILL') sendCommand({ valve1: !localRefill.value })
  else sendCommand({ valve2: !localDose.value })
}

// Fungsi Simpan Parameter ke ESP32
const saveParameters = () => {
  if (client.value && mqttConnected.value) {
    const payload = {
      cmd: "set_param",
      rain_limit: Number(inputRainLimit.value),
      delay_sec: Number(inputDelaySec.value)
    }
    client.value.publish('pt_top/dosing/site_a/command', JSON.stringify(payload))
    alert("Berhasil! Parameter telah dikirim ke mesin.")
  } else {
    alert("Gagal: MQTT belum terhubung!")
  }
}

const fetchHistory = async () => {
  isLoading.value = true
  try {
    const response = await fetch('http://localhost/wcp_top/api_logs.php')
    historyLogs.value = await response.json()
  } catch (error) {
    console.error("Fetch history error:", error)
  } finally {
    isLoading.value = false
  }
}

let intervalId;
onMounted(() => {
  connectMQTT()
  fetchHistory()
  intervalId = setInterval(fetchHistory, 10000)
})

onUnmounted(() => {
  if (client.value) client.value.end()
  clearInterval(intervalId)
})
</script>

<template>
  <div class="w-full flex flex-col gap-6">
    <h1 class="font-bold text-3xl text-gray-800">Automatic Dosing Flocculant</h1>
    
    <div class="w-full bg-slate-900 text-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-blue-500">
      <div>
        <h2 class="text-xl font-bold m-0">Site: Water Compliance Point 4 PT. Telen Orbit Prima</h2>
        <p class="text-slate-400 text-sm mt-1">Monitoring Real-time & Kontrol Dosing</p>
      </div>
      <div class="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
        <div class="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]" :class="mqttConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'"></div>
        <span class="font-bold text-sm tracking-wide">{{ mqttConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED' }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
        <div class="p-4 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><span class="material-symbols-outlined text-3xl">water_drop</span></div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Curah Hujan</p>
          <h2 class="text-2xl font-bold text-slate-800 m-0">{{ sensorData.rain }} <span class="text-lg text-slate-400 font-medium">mm</span></h2>
        </div>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
        <div class="p-4 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><span class="material-symbols-outlined text-3xl">thermostat</span></div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Suhu Area</p>
          <h2 class="text-2xl font-bold text-slate-800 m-0">{{ sensorData.temp }} <span class="text-lg text-slate-400 font-medium">°C</span></h2>
        </div>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
        <div class="p-4 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><span class="material-symbols-outlined text-3xl">cloud</span></div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Kelembaban</p>
          <h2 class="text-2xl font-bold text-slate-800 m-0">{{ sensorData.hum }} <span class="text-lg text-slate-400 font-medium">%</span></h2>
        </div>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
        <div class="p-4 rounded-xl flex items-center justify-center" :class="sensorData.mode === 'auto' ? 'bg-indigo-50 text-indigo-600' : 'bg-yellow-50 text-yellow-600'">
          <span class="material-symbols-outlined text-3xl">{{ sensorData.mode === 'auto' ? 'smart_toy' : 'back_hand' }}</span>
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Mode Sistem</p>
          <h2 class="text-2xl font-bold text-slate-800 m-0 uppercase">{{ sensorData.mode }}</h2>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div class="p-5 rounded-2xl text-white shadow-md transition-colors duration-300" :class="sensorData.main_10 ? 'bg-emerald-500' : 'bg-red-500'">
        <h3 class="font-bold text-sm mb-1 opacity-90">Tangki Utama (1200L)</h3>
        <p class="font-bold text-2xl">{{ sensorData.main_10 ? 'AMAN (>10%)' : 'KRITIS / KOSONG' }}</p>
      </div>
      <div class="p-5 rounded-2xl text-white shadow-md transition-colors duration-300" :class="sensorData.buf_100 ? 'bg-amber-500' : 'bg-blue-500'">
        <h3 class="font-bold text-sm mb-1 opacity-90">Buffer Atas (100%)</h3>
        <p class="font-bold text-2xl">{{ sensorData.buf_100 ? 'PENUH' : 'BELUM PENUH' }}</p>
      </div>
      <div class="p-5 rounded-2xl text-white shadow-md transition-colors duration-300" :class="sensorData.buf_90 ? 'bg-emerald-500' : 'bg-amber-500'">
        <h3 class="font-bold text-sm mb-1 opacity-90">Buffer Bawah (90%)</h3>
        <p class="font-bold text-2xl">{{ sensorData.buf_90 ? 'AMAN (>90%)' : 'TURUN (<90%)' }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-500">settings</span> Status Aktuator
        </h3>
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-blue-500 text-3xl">propane_tank</span>
              <div>
                <div class="font-bold text-slate-700">Valve Refill (V1)</div>
                <div class="text-xs text-slate-500">Isi Tangki Buffer</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wide" :class="sensorData.r ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
              {{ sensorData.r ? 'TERBUKA' : 'TERTUTUP' }}
            </span>
          </div>
          <div class="flex justify-between items-center p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined text-blue-500 text-3xl">water_pump</span>
              <div>
                <div class="font-bold text-slate-700">Valve Dosing (V2)</div>
                <div class="text-xs text-slate-500">Dosing ke WTP</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold tracking-wide" :class="sensorData.d ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
              {{ sensorData.d ? 'TERBUKA' : 'TERTUTUP' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-opacity" :class="!manualMode ? 'bg-slate-50/50' : ''">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500">tune</span> Kontrol Manual
          </h3>
          <label class="flex items-center cursor-pointer bg-slate-100 p-1 rounded-full border border-slate-200">
            <span class="px-3 py-1 text-xs font-bold rounded-full transition-colors" :class="!manualMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'">AUTO</span>
            <input type="checkbox" v-model="manualMode" @change="toggleAuto" class="hidden" />
            <span class="px-3 py-1 text-xs font-bold rounded-full transition-colors" :class="manualMode ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'">MANUAL</span>
          </label>
        </div>

        <div v-if="!manualMode" class="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
          <span class="material-symbols-outlined text-blue-500">info</span>
          <div>
            <strong class="text-blue-800 text-sm">Mode Otomatis Aktif.</strong>
            <div class="text-xs text-blue-600 mt-1">Sistem berjalan otomatis berdasarkan sensor. Matikan auto untuk kontrol manual.</div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <button @click="controlValve('REFILL')" :disabled="!manualMode || sensorData.buf_100 || !sensorData.main_10" class="flex items-center justify-center gap-2 h-14 font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed" :class="localRefill ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'">
            <span class="material-symbols-outlined">{{ localRefill ? 'stop_circle' : 'play_circle' }}</span> {{ localRefill ? 'STOP REFILL' : 'START REFILL' }}
          </button>
          <button @click="controlValve('DOSE')" :disabled="!manualMode || (!sensorData.buf_90 && !sensorData.main_10)" class="flex items-center justify-center gap-2 h-14 font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed" :class="localDose ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'">
            <span class="material-symbols-outlined">{{ localDose ? 'stop_circle' : 'science' }}</span> {{ localDose ? 'STOP DOSING' : 'START DOSING' }}
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 class="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
          <span class="material-symbols-outlined text-purple-500">display_settings</span> Parameter Sistem
        </h3>
        
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reset Hujan (Timeout)</label>
            <div class="relative">
              <input type="number" v-model="inputRainReset" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 font-bold bg-slate-50">
              <span class="absolute right-4 top-3 text-slate-400 font-medium">menit</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">*Waktu tunggu setelah hujan reda untuk mereset sensor ke 0</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Syarat Hujan Awet</label>
            <div class="relative">
              <input type="number" v-model="inputRainDuration" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 font-bold bg-slate-50">
              <span class="absolute right-4 top-3 text-slate-400 font-medium">menit</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">*Dosing aktif jika hujan non-stop melebihi durasi ini</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Jeda Aktuator (Debounce)</label>
            <div class="relative">
              <input type="number" v-model="inputValveDelay" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 font-bold bg-slate-50">
              <span class="absolute right-4 top-3 text-slate-400 font-medium">detik</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">*Jeda pengaman sebelum valve berubah status buka/tutup</p>
          </div>

          <button @click="saveParameters" :disabled="!mqttConnected" class="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">save</span>
            SIMPAN PARAMETER
          </button>
        </div>
      </div>

    </div>
  </div>
</template>