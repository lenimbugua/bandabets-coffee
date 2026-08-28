<script setup>
defineProps({
  activeTab: { type: String, required: true },
})

const emit = defineEmits(["update:activeTab"])

const navItems = [
  { id: "home", label: "Home", icon: "tabler:home" },
  { id: "bonuses", label: "Bonuses", icon: "tabler:gift", badge: 4 },
  { id: "deposit", label: "Deposit", icon: "tabler:wallet", highlight: true },
  { id: "profile", label: "Profile", icon: "tabler:user" },
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
    <div class="max-w-md mx-auto flex items-center justify-around py-2 px-2">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="[
          'flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all relative',
          item.highlight
            ? 'bg-bet text-bet-foreground shadow-glow-gold -mt-4 px-5 py-2'
            : activeTab === item.id
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        ]"
        @click="emit('update:activeTab', item.id)"
      >
        <div class="relative">
          <Icon :name="item.icon" :class="item.highlight ? 'w-6 h-6' : 'w-5 h-5'" />
          <span
            v-if="item.badge"
            class="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
          >
            {{ item.badge }}
          </span>
        </div>
        <span :class="item.highlight ? 'text-xs font-bold' : 'text-[10px] font-medium'">
          {{ item.label }}
        </span>
        <div
          v-if="activeTab === item.id && !item.highlight"
          class="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary"
        />
      </button>
    </div>
  </nav>
</template>
