// Web Crypto replacement for crypto-js: PBKDF2 (SHA-256, 100 iterations,
// 256-bit key — crypto-js 4.2.0's PBKDF2 default hasher is SHA-256) + AES-CBC
// with PKCS#7 padding, matching crypto-js's defaults exactly so ciphertext
// stays byte-identical for the backend, which still decrypts with the old
// crypto-js-derived key/iv/salt (verified against fixed inputs). `crypto.subtle`
// is available both in the browser and on the Node 24 server (no `window`
// dependency), so these functions work unchanged during SSR route middleware.
const keyValue = "cXB4DaTfYrsYuPdZ"; // your key value (eg: key)
const ivKey = "a2xhcgHgXCV6R4wD";
const salt = "BM3ex5RtPToYioP7";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function deriveKey() {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(keyValue),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: textEncoder.encode(salt),
      iterations: 100,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptData(data) {
  if (data) {
    const key = await deriveKey();
    const iv = textEncoder.encode(ivKey);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      textEncoder.encode(JSON.stringify(data)),
    );
    return toHex(encrypted);
  }
}

export async function decrypteData(data) {
  if (data) {
    const key = await deriveKey();
    const iv = textEncoder.encode(ivKey);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      key,
      fromHex(data),
    );
    return textDecoder.decode(decrypted);
  }
}
