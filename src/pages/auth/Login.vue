<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const formData = reactive({
  username: '',
  password: '',
  keepLoggedIn: false,
})

const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const submit = async () => {
  if (!formData.username || !formData.password) {
    errorMessage.value = "Username dan Password wajib diisi!"
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const req = await fetch('http://localhost/wcp_top/api_auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const res = await req.json()

    if (res.status === 'success') {
      alert(`Halo, ${res.data.full_name}!`) // Pengganti VaToast sementara
      localStorage.setItem('user', JSON.stringify(res.data))
      router.push({ name: 'dashboard' })
    } else {
      errorMessage.value = res.message
    }
  } catch (e) {
    errorMessage.value = "Gagal koneksi ke server"
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="flex flex-col gap-4">
    <div class="mb-4">
      <h1 class="font-bold text-3xl text-gray-800 mb-2">Log in</h1>
      <p class="text-sm text-gray-500">
        Belum punya akun? <a href="#" class="font-bold text-blue-600 hover:underline">Daftar disini</a>
      </p>
    </div>

    <div v-if="errorMessage" class="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
      {{ errorMessage }}
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-semibold text-gray-700">Username</label>
      <input 
        v-model="formData.username" 
        type="text" 
        placeholder="Masukkan username"
        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-sm font-semibold text-gray-700">Password</label>
      <div class="relative w-full">
        <input 
          v-model="formData.password" 
          :type="showPassword ? 'text' : 'password'" 
          placeholder="Masukkan password"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="button" 
          @click="showPassword = !showPassword" 
          class="absolute right-3 top-3.5 text-sm font-bold text-gray-400 hover:text-gray-600"
        >
          {{ showPassword ? 'SEMBUNYIKAN' : 'LIHAT' }}
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center mt-2">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="formData.keepLoggedIn" class="w-4 h-4 rounded border-gray-300 text-blue-600" />
        <span class="text-sm text-gray-600">Ingat Saya</span>
      </label>
      <a href="#" class="text-sm font-semibold text-blue-600 hover:underline">Lupa Password?</a>
    </div>

    <button 
      type="submit" 
      :disabled="isLoading"
      class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
    >
      {{ isLoading ? 'Memproses...' : 'Login' }}
    </button>
  </form>
</template>