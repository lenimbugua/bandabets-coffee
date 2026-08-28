<script setup>
import { ref, toRefs } from "vue";
import { useFeedbackStore } from "../stores/feedback";

const { sendFeedback } = useFeedbackStore();
const { pending } = toRefs(useFeedbackStore());

const tabs = [
  { name: "New Feature", value: "NEW_FEATURE", icon: "💡" },
  { name: "Improvement", value: "HELP_US_IMPROVE", icon: "🔧" },
  { name: "Complaint", value: "MAKE_COMPLAINT", icon: "⚠️" },
];

const idea = ref("");
const error = ref("");
const category = ref("NEW_FEATURE");
const minLength = 30;
const maxLength = 2000;

const handleSubmit = async () => {
  if (!isValidIdea()) return;
  await sendFeedback({ category: category.value, comment: idea.value });
  idea.value = "";
};

function isValidIdea() {
  return idea.value.length >= minLength;
}

function validateField() {
  if (idea.value.length < minLength) {
    error.value = `Must be at least ${minLength} characters`;
  } else if (idea.value.length > maxLength) {
    error.value = `Cannot exceed ${maxLength} characters`;
  } else {
    error.value = "";
  }
}

function updateCharacterCount() {
  if (error.value) validateField();
}
</script>

<template>
  <HeaderLinks />

  <div class="max-w-lg mx-auto px-4 py-6">
    <!-- Back button -->
    <button
      class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      @click="$router.go(-1)"
    >
      <Icon name="tabler:arrow-left" class="w-4 h-4" />
      Back
    </button>

    <!-- Main card -->
    <div class="bg-card rounded-xl overflow-hidden border border-border/30">
      <!-- Branded header -->
      <div class="relative px-5 pt-6 pb-5 bg-gradient-to-br from-brand-bright/10 via-brand-bright/5 to-transparent dark:from-brand-bright/15 dark:via-brand-bright/5 dark:to-transparent">
        <div class="absolute top-0 right-0 w-32 h-32 bg-brand-bright/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div class="relative">
          <div class="inline-flex items-center gap-2 rounded-full bg-brand-bright/10 dark:bg-brand-bright/15 px-3 py-1 mb-3">
            <Icon name="tabler:send" class="w-3.5 h-3.5 text-brand-bright" aria-hidden="true" />
            <span class="text-[11px] font-semibold text-brand-bright uppercase tracking-wider">Share Your Voice</span>
          </div>
          <h1 class="text-xl font-bold text-foreground leading-tight">
            Help Shape Bandabets
          </h1>
          <p class="text-sm text-muted-foreground mt-1.5 max-w-xs">
            Your feedback drives what we build next. Every idea matters.
          </p>
        </div>
      </div>

      <!-- Incentive strip -->
      <div class="flex items-center gap-2.5 px-5 py-3 bg-gold-bright/5 dark:bg-gold-bright/8 border-y border-gold-bright/10">
        <Icon name="tabler:star" class="w-4 h-4 text-gold-bright shrink-0" aria-hidden="true" />
        <p class="text-xs text-foreground">
          Share your idea & enter the daily <span class="font-bold text-gold-bright">Shinda Freebet</span> draw!
        </p>
      </div>

      <!-- Form body -->
      <div class="p-5 space-y-5">
        <!-- Category pills -->
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">
            What type of feedback?
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              :class="[
                'flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 text-center transition-all duration-150 border',
                category === tab.value
                  ? 'bg-brand-bright/10 dark:bg-brand-bright/15 border-brand-bright/30 text-brand-bright'
                  : 'bg-background border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60',
              ]"
              @click="category = tab.value"
            >
              <span class="text-lg leading-none">{{ tab.icon }}</span>
              <span class="text-[11px] font-semibold leading-tight">{{ tab.name }}</span>
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <div>
          <label for="idea" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Your feedback
          </label>
          <div class="relative">
            <textarea
              id="idea"
              v-model="idea"
              required
              :minlength="minLength"
              :maxlength="maxLength"
              rows="5"
              placeholder="Tell us what you think — feature ideas, things to improve, or anything on your mind..."
              :class="[
                'w-full bg-background border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand-bright/30 focus:border-brand-bright/50 transition-all resize-y leading-relaxed',
                error ? 'border-red-500' : 'border-border/50',
              ]"
              @input="updateCharacterCount"
              @blur="validateField"
            ></textarea>
            <span class="absolute bottom-3 right-3 text-[10px] text-muted-foreground/40 tabular-nums select-none">
              {{ idea.length }}/{{ maxLength }}
            </span>
          </div>
          <p v-if="error" class="text-xs text-red-500 mt-1.5">{{ error }}</p>
          <p v-else-if="idea.length > 0 && idea.length < minLength" class="text-xs text-muted-foreground mt-1.5">
            {{ minLength - idea.length }} more characters needed
          </p>
        </div>

        <!-- Progress bar (visual feedback) -->
        <div v-if="idea.length > 0 && idea.length < minLength" class="h-1 bg-border/30 rounded-full overflow-hidden">
          <div
            class="h-full bg-brand-bright/60 rounded-full transition-all duration-300"
            :style="{ width: Math.min((idea.length / minLength) * 100, 100) + '%' }"
          ></div>
        </div>

        <!-- Submit button -->
        <button
          type="button"
          :class="[
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-150',
            isValidIdea()
              ? 'bg-brand-bright text-primary-foreground hover:bg-brand-bright/90 active:scale-[0.98] cursor-pointer shadow-sm'
              : 'bg-muted text-muted-foreground/30 cursor-not-allowed',
          ]"
          :disabled="!isValidIdea()"
          @click="handleSubmit"
        >
          <TheButtonSpin v-if="pending" />
          <template v-else>
            <Icon name="tabler:send" class="w-4 h-4" aria-hidden="true" />
            Submit Feedback
          </template>
        </button>
      </div>
    </div>
  </div>
  <Footer />
</template>
