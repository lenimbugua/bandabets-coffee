import { encryptData } from "@/composables/useEncryption";
import { storeToRefs } from "pinia";
import { onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useGoogleDataLayers } from "../composables/useGoogleDataLayers";
import { useRegisterStore } from "../stores/register";

export function useRegister() {
  const { pushDataLayerToGoogle } = useGoogleDataLayers();

  const { createAccount, resetError, updatePassword, updateConfirmPassword } =
    useRegisterStore();

  const {
    error,
    pending,
    msisdn,
    password,
    responseOK,
    passwordMatch,
    confirmPassword,
    showPasswordDoNotMatch,
  } = storeToRefs(useRegisterStore());
  const router = useRouter();

  const termsAndConditions = ref(false);

  function unsuccessfulLoginData() {
    pushDataLayerToGoogle({
      event: "sign_up_failed",
      error_message: error.value,
    });
  }

  async function submit() {
    if (!passwordMatch.value) {
      return;
    }
    const body = {
      msisdn: msisdn.value,
      password: await encryptData(password.value),
      confirmPassword: await encryptData(confirmPassword.value),
    };
    await createAccount(body, router);

    if (!responseOK.value) {
      unsuccessfulLoginData();
    }
  }

  return {
    submit,
    pending,
    resetError,
    onBeforeUnmount,
    updatePassword,
    termsAndConditions,
    updateConfirmPassword,
    showPasswordDoNotMatch,
  };
}
