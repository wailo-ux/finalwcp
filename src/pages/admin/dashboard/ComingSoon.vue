<template>
  <div class="w-full h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in">
    <div class="relative mb-8">
      <div class="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl relative z-10">
        <span class="material-symbols-outlined text-7xl text-blue-600">engineering</span>
      </div>
    </div>
    
    <h2 class="text-4xl font-black text-slate-800 tracking-tight mb-3">STATION UNDER CONSTRUCTION</h2>
    <div class="w-16 h-1.5 bg-blue-600 rounded-full mb-6"></div>
    <p class="text-slate-500 text-sm max-w-md leading-relaxed font-medium">
      Modul monitoring dan integrasi panel kontrol (PLC/ESP32) untuk stasiun pemantauan ini sedang dalam tahap instalasi fisik di lapangan😁
    </p>

    <router-link 
      :to="{ name: 'dashboard' }" 
      class="mt-10 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3 tracking-wide"
    >
      <span class="material-symbols-outlined">arrow_back</span>
      KEMBALI KE WCP 4 (ACTIVE)
    </router-link>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>