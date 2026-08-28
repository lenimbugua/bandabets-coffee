<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import ChangeEvent from "./ChangeEvent.vue";

const { ChangeEventModal } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const closeButtonRef = ref(null);

const showBetslip = computed(() => {
  return modalType.value === ChangeEventModal && showModal.value;
});
</script>

<template>
  <TransitionRoot appear :show="showBetslip" as="template">
    <Dialog
      as="div"
      class="relative z-100"
      :initial-focus="closeButtonRef"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="modal-backdrop" />
      </TransitionChild>
      <div class="fixed z-50 inset-x-0 bottom-0">
        <div class="flex justify-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 translate-y-full"
            enter-to="opacity-100 translate-y-0"
            leave="duration-200 ease-in"
            leave-from="opacity-100 translate-y-0"
            leave-to="opacity-0 translate-y-full"
          >
            <DialogPanel class="modal-card">
              <!-- Header -->
              <div class="modal-header">
                <div class="header-left">
                  <div class="icon-wrap">
                    <Icon name="tabler:refresh" class="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div>
                    <DialogTitle class="modal-title">Change Event</DialogTitle>
                    <p class="modal-subtitle">Select a different match</p>
                  </div>
                </div>
                <button
                  ref="closeButtonRef"
                  class="close-btn"
                  aria-label="Close"
                  @click="closeModal"
                >
                  <Icon name="tabler:x" class="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <!-- Body -->
              <div class="modal-body">
                <ChangeEvent />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: oklch(0% 0 0 / 0.5);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 56rem;
  border-radius: 1rem 1rem 0 0;
  overflow: hidden;
  background: oklch(100% 0 0);
  border: 1px solid oklch(0% 0 0 / 0.08);
  box-shadow:
    0 20px 60px oklch(0% 0 0 / 0.15),
    0 4px 16px oklch(0% 0 0 / 0.08);
  text-align: left;
}
[data-theme="dark"] .modal-card {
  background: var(--card);
  border-color: oklch(100% 0 0 / 0.06);
  box-shadow:
    0 20px 60px oklch(0% 0 0 / 0.4),
    0 4px 16px oklch(0% 0 0 / 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .modal-header {
  border-bottom-color: oklch(100% 0 0 / 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
}
[data-theme="dark"] .icon-wrap {
  background: color-mix(in oklch, var(--primary) 12%, transparent);
}

.modal-title {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: oklch(15% 0 0);
}
[data-theme="dark"] .modal-title {
  color: oklch(100% 0 0 / 0.9);
}

.modal-subtitle {
  font-size: 0.6rem;
  color: oklch(55% 0 0);
  margin-top: 0.0625rem;
}
[data-theme="dark"] .modal-subtitle {
  color: oklch(100% 0 0 / 0.4);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: oklch(50% 0 0);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover {
  background: oklch(0% 0 0 / 0.05);
  color: oklch(30% 0 0);
}
[data-theme="dark"] .close-btn {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .close-btn:hover {
  background: oklch(100% 0 0 / 0.06);
  color: oklch(100% 0 0 / 0.7);
}

.modal-body {
  height: 60vh;
  overflow-y: auto;
  background: var(--surface-sunken);
}
[data-theme="dark"] .modal-body {
  background: var(--background);
}
</style>
