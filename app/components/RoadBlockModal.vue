<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useCasino } from "@/composables/useCasino";
import { useModalStore } from "@/stores/modal";
import { useRoadblockStore } from "@/stores/roadblock";

import { useModalTypes } from "@/composables/useModalTypes";

import { useRouter } from "vue-router";
const { launchCasino } = useCasino();
const { public: config } = useRuntimeConfig();
const jetXId = config.jetxGameId;
const router = useRouter();

const { roadblock } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());
const {
  roadBlockImage,
  currentRoadblock,
//   roadBlockClickAction,
  depositRoadBlock,
  aviatorRoadBlock,
  jetxRoadBlock,
} = storeToRefs(useRoadblockStore());

// const { setRoadBlockClickAction } = useRoadblockStore();

const showDialog = computed(() => {
  return modalType.value === roadblock && showModal.value;
});
const { closeModal } = useModalStore();

function launchJetX() {
  launchCasino(jetXId, "jetX");
}

function goToAviator() {
  router.push({ name: "aviator" });
}
function goToDeposit() {
  router.push({ name: "deposit" });
}

function getRoadBlockAction(roadBlock) {
  switch (roadBlock) {
    case depositRoadBlock.value:
      return goToDeposit();
    case aviatorRoadBlock.value:
      return goToAviator();
    case jetxRoadBlock.value:
      return launchJetX();
  }
}

const handleRoadBlockClick = () => {
 getRoadBlockAction(currentRoadblock.value);
  closeModal(roadblock);
};


</script>
<template>
  <AppDialog
    :open="showDialog"
    aria-label="Promotional offer"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="cursor-pointer w-full max-w-[18rem] md:max-w-md transform rounded-2xl bg-white dark:bg-card text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <div class="w-full flex justify-center">
        <button
          ref="closeButtonRef"
          class="focus:outline-hidden absolute -bottom-7  p-1 rounded-full bg-black/60 border border-slate-400"
          aria-label="Close promotional offer"
          @click="closeModal"
        >
          <Icon name="tabler:x" class="text-slate-400 dark:text-white w-4 h-4" />
        </button>
    </div>
    <img
      class="cursor-pointer"
      :src="roadBlockImage"
      alt="Promotional offer"
      loading="lazy"
      @click="handleRoadBlockClick"
    />
    <!-- <div class="flex uppercase">
      <button
        class="bg-red-600 w-1/2 text-white py-2 focus:outline-hidden"
        @click="closeModal"
      >
        Cancel
      </button>
      <button
        class="bg-brand-bright w-1/2 text-gold-foreground py-2"
        @click="handleRoadBlockClick"
      >
        Continue
      </button>
    </div> -->
  </AppDialog>
</template>
