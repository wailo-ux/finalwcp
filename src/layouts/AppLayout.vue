<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <nav class="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
      <div class="font-bold text-xl tracking-wider">WTP ADMIN</div>
      <button @click="logout" class="bg-red-500 hover:bg-red-600 text-sm font-bold py-2 px-4 rounded-lg transition">
        Logout
      </button>
    </nav>
    
    <main class="flex-1 w-full p-4 md:p-8 flex justify-center">
      <div class="w-full max-w-7xl">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const logout = () => {
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}
</script>