<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isSidebarOpen = ref(false)

const userData = ref({ full_name: 'Guest', role: 'crew' })

onMounted(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try { userData.value = JSON.parse(savedUser) } 
    catch (e) { console.error(e) }
  }
})

const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value
watch(() => route.path, () => isSidebarOpen.value = false)

const logout = () => {
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-[#F1F5F9] flex flex-col font-sans overflow-x-hidden">
    
    <nav class="bg-white text-slate-800 px-4 md:px-6 h-16 shadow-sm border-b border-slate-200 fixed top-0 left-0 right-0 z-[60] flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button @click="toggleSidebar" class="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <span class="material-symbols-outlined text-2xl">{{ isSidebarOpen ? 'close' : 'menu' }}</span>
        </button>

        <div class="flex items-center gap-2 bg-slate-50 p-1.5 md:p-2 rounded-xl border border-slate-100 shadow-sm">
          <img src="/logo-top.png" alt="TOP" class="h-6 md:h-8 w-auto object-contain" onerror="this.src='https://placehold.co/30x30?text=TOP'">
          <div class="w-px h-5 md:h-6 bg-slate-300 mx-0.5"></div>
          <img src="/logo-turangga.png" alt="Turangga" class="h-6 md:h-8 w-auto object-contain" onerror="this.src='https://placehold.co/30x30?text=TR'">
        </div>
        
        <div class="hidden lg:block ml-2">
          <h1 class="font-bold text-xl tracking-tight text-slate-800">WCP Admin</h1>
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-4">
        <div class="hidden sm:flex flex-col items-end border-r border-slate-200 pr-4 mr-1 text-right">
          <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider leading-none">
            {{ userData.role === 'spv' ? 'Supervisor Account' : 'Field Crew Account' }}
          </span>
          <span class="text-sm font-semibold text-slate-800">{{ userData.full_name }}</span>
        </div>
        <button @click="logout" class="bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 py-2 px-3 md:px-5 rounded-lg transition-all font-bold text-xs flex items-center gap-2 shadow-sm">
          <span class="material-symbols-outlined text-base">logout</span>
          <span class="hidden xs:inline">Logout</span>
        </button>
      </div>
    </nav>

    <div class="flex flex-1 w-full pt-16 relative">
      <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden"></div>

      <aside 
        class="bg-slate-900 flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] transition-all duration-300 ease-in-out z-50 overflow-y-auto w-72 border-r border-slate-800"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
      >
        <div class="p-6">
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Monitoring Network</h3>
          <nav class="flex flex-col gap-3">
            <router-link v-for="n in 3" :key="n" :to="{ name: 'wcp' + n }" 
              class="flex items-center gap-4 p-3.5 rounded-xl transition-all border group shadow-sm"
              :class="$route.name === 'wcp' + n ? 'bg-blue-600 border-blue-400 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'"
            >
              <span class="material-symbols-outlined text-xl">construction</span>
              <div class="flex flex-col text-left">
                <span class="text-sm font-semibold text-white/90">WCP {{ n }} Site</span>
                <span class="text-[10px] font-medium text-amber-500/70">Coming Soon</span>
              </div>
            </router-link>

            <router-link :to="{ name: 'dashboard' }" 
              class="flex items-center gap-4 p-3.5 rounded-xl transition-all border group shadow-sm mt-2"
              :class="$route.name === 'dashboard' ? 'bg-blue-600 border-blue-400 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'"
            >
              <span class="material-symbols-outlined text-xl">monitoring</span>
              <div class="flex flex-col text-left">
                <span class="text-sm font-semibold text-white/90">WCP 4 Site</span>
                <span class="text-[10px] font-medium text-green-400">Active Site</span>
              </div>
            </router-link>
          </nav>
          <div v-if="userData.role === 'spv'" class="mt-8 border-t border-slate-800 pt-6">
            <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Admin Panel</h3>
            <router-link :to="{ name: 'user-management' }" 
              class="flex items-center gap-4 p-3.5 rounded-xl transition-all border group shadow-sm"
              :class="$route.name === 'user-management' ? 'bg-purple-600 border-purple-400 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'"
            >
              <span class="material-symbols-outlined text-xl">manage_accounts</span>
              <div class="flex flex-col text-left">
                <span class="text-sm font-semibold" :class="$route.name === 'user-management' ? 'text-white' : 'text-slate-400 group-hover:text-white'">Manajemen Akun</span>
                <span class="text-[9px] font-medium" :class="$route.name === 'user-management' ? 'text-purple-200' : 'text-slate-500'">Approval & Reset</span>
              </div>
            </router-link>
          </div>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 md:ml-72">
        <main class="p-4 md:p-8 w-full flex-grow">
          <RouterView />
        </main>

        <footer class="p-8 border-t border-slate-200 bg-white">
          <div class="w-full flex flex-col items-center justify-center text-center gap-1.5">
            <p class="text-slate-700 text-sm font-bold">© 2026 PT. Telen Orbit Prima. All rights reserved.</p>
            <p class="text-slate-500 text-xs font-medium max-w-2xl">Proprietary monitoring technology for Safety, Health, and Environment Department.</p>
            <p class="text-slate-400 text-[11px] font-bold mt-2">Made with Gab's <span class="text-red-500">❤️</span>😀</p>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>