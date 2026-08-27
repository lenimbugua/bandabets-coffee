// Subpath imports pull only the PBKDF2 + AES + Hex/Utf8 pieces of crypto-js
// (≈10 KB gzip) instead of the whole library (≈45 KB gzip) into the login
// chunk that is preloaded on every page. AES's default mode is already CBC
// with Pkcs7 padding, which is what the previous explicit `mode: CBC` used,
// so the output is byte-identical (verified against fixed inputs).
import PBKDF2 from "crypto-js/pbkdf2";
import AES from "crypto-js/aes";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";

const keyValue = "cXB4DaTfYrsYuPdZ"; // your key value (eg: key)
const ivKey = "a2xhcgHgXCV6R4wD";
const salt = "BM3ex5RtPToYioP7";

function deriveKey() {
  return PBKDF2(keyValue, salt, { keySize: 256 / 32, iterations: 100 });
}

export function encryptData(data) {
  if (data) {
    const key = deriveKey();
    const iv = Utf8.parse(ivKey);
    const encrypted = AES.encrypt(JSON.stringify(data), key, { iv });
    return encrypted.ciphertext.toString(Hex);
  }
}

export function decrypteData(data) {
  if (data) {
    const key = deriveKey();
    const iv = Utf8.parse(ivKey);
    const decrypted = AES.decrypt({ ciphertext: Hex.parse(data) }, key, { iv });
    return decrypted.toString(Utf8);
  }
}
