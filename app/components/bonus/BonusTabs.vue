<script setup>
defineProps({
  activeTab: { type: String, required: true },
});

const emit = defineEmits(["update:activeTab"]);
</script>

<template>
  <div class="flex bg-gray-100 dark:bg-secondary/30 rounded-full p-0.5 border border-gray-200 dark:border-border">
    <button
      :class="
        [
          'flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all duration-300',
          activeTab === 'active'
            ? 'bg-white dark:bg-card text-primary shadow-md border border-primary/30 shadow-glow-green'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
        ]
      "
      type="button"
      @click="emit('update:activeTab', 'active')"
    >
      Active Bonus
    </button>
    <button
      :class="
        [
          'flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all duration-300',
          activeTab === 'history'
            ? 'bg-white dark:bg-card text-primary shadow-md border border-primary/30 shadow-glow-green'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
        ]
      "
      type="button"
      @click="emit('update:activeTab', 'history')"
    >
      Bonus History
    </button>
  </div>
</template>
