<script setup>
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
// LIVE CHAT DISABLED — restore later
// import { useSupport } from "@/composables/useSupport";

const { customerSupportModal } = useModalTypes();
const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
// LIVE CHAT DISABLED — restore later
// const { openTawkChat } = useSupport();

// Same contacts the organisation schema and T&Cs publish.
const supportEmail = "support@bandabets.com";
const supportPhone = "+254 711 082 800";

const showDialog = computed(() => {
  return modalType.value === customerSupportModal && showModal.value;
});
</script>

<template>
  <TransitionRoot appear :show="showDialog" as="template">
    <Dialog
      as="div"
      style="z-index: 1000"
      class="relative z-50"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-end sm:items-center justify-center sm:p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="w-full sm:max-w-sm bg-card rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden border border-border/50"
            >
              <!-- Header -->
              <div class="flex items-center justify-between px-5 pt-5 pb-1">
                <div>
                  <h2 class="text-base font-bold text-foreground">
                    Get in Touch
                  </h2>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Choose how you'd like to reach us
                  </p>
                </div>
                <button
                  class="p-1.5 -mr-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  aria-label="Close"
                  @click="closeModal"
                >
                  <Icon name="tabler:x" class="w-5 h-5" />
                </button>
              </div>

              <!-- Options -->
              <div class="p-5 space-y-2.5">
                <!-- LIVE CHAT DISABLED — restore later
                <button
                  class="w-full flex items-center gap-4 p-4 rounded-xl bg-accent/50 hover:bg-accent border border-border/50 hover:border-border transition-all duration-150 cursor-pointer group text-left"
                  @click="openTawkChat"
                >
                  <div
                    class="w-11 h-11 rounded-xl bg-brand-bright flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-foreground">
                      Live Chat
                    </p>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      Chat with an agent now
                    </p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors shrink-0"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                -->

                <!-- Email -->
                <a
                  :href="`mailto:${supportEmail}`"
                  class="w-full flex items-center gap-4 p-4 rounded-xl bg-accent/50 hover:bg-accent border border-border/50 hover:border-border transition-all duration-150 cursor-pointer group text-left"
                >
                  <div
                    class="w-11 h-11 rounded-xl bg-brand-bright flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <Icon name="tabler:mail" class="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-foreground">Email Us</p>
                    <p class="text-xs text-muted-foreground mt-0.5 truncate">
                      {{ supportEmail }}
                    </p>
                  </div>
                  <Icon name="tabler:chevron-right" class="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors shrink-0" aria-hidden="true" />
                </a>

                <!-- Phone -->
                <a
                  :href="`tel:${supportPhone.replace(/\s/g, '')}`"
                  class="w-full flex items-center gap-4 p-4 rounded-xl bg-accent/50 hover:bg-accent border border-border/50 hover:border-border transition-all duration-150 cursor-pointer group text-left"
                >
                  <div
                    class="w-11 h-11 rounded-xl bg-brand-bright flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <Icon name="tabler:phone" class="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-foreground">Call Us</p>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      {{ supportPhone }}
                    </p>
                  </div>
                  <Icon name="tabler:chevron-right" class="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground/50 transition-colors shrink-0" aria-hidden="true" />
                </a>
              </div>

              <!-- Footer -->
              <div class="px-5 pb-5">
                <p class="text-[0.65rem] text-muted-foreground/60 text-center">
                  Available 24/7
                </p>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
