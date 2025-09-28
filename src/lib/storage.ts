import { EncryptedPayload, STORAGE_PREFIX } from "./types";

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const PBKDF2_ITERATIONS = 250_000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

const getCrypto = (): Crypto => {
  const crypto = globalThis.crypto || (globalThis as unknown as { msCrypto?: Crypto }).msCrypto;
  if (!crypto || !crypto.subtle) {
    throw new Error("Web Crypto API is not available in this environment.");
  }
  return crypto;
};

const toBase64 = (bytes: ArrayBuffer): string => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.byteLength; i += 1) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(value, "base64"));
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const toBufferSource = (view: Uint8Array): ArrayBuffer => {
  if (view.byteOffset === 0 && view.byteLength === view.buffer.byteLength) {
    return view.buffer as ArrayBuffer;
  }
  return (view.buffer as ArrayBuffer).slice(
    view.byteOffset,
    view.byteOffset + view.byteLength
  );
};

const deriveKey = async (passphrase: string, salt: Uint8Array): Promise<CryptoKey> => {
  const crypto = getCrypto();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
  salt: toBufferSource(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptState = async <T>(state: T, passphrase: string): Promise<EncryptedPayload> => {
  const crypto = getCrypto();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const data = TEXT_ENCODER.encode(JSON.stringify(state));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toBufferSource(iv) },
    key,
    data
  );

  return {
    version: 1,
    salt: toBase64(salt.buffer),
    iv: toBase64(iv.buffer),
    data: toBase64(encrypted),
  };
};

export const decryptState = async <T>(payload: EncryptedPayload, passphrase: string): Promise<T> => {
  const crypto = getCrypto();
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const key = await deriveKey(passphrase, salt);
  const cipherBuffer = fromBase64(payload.data);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toBufferSource(iv) },
    key,
    toBufferSource(cipherBuffer)
  );
  return JSON.parse(TEXT_DECODER.decode(decrypted)) as T;
};

const STORAGE_KEY = `${STORAGE_PREFIX}:encrypted`;

export const saveEncryptedState = async (
  payload: EncryptedPayload,
  key = "latest"
): Promise<void> => {
  if (typeof window === "undefined") return;
  const { set } = await import("idb-keyval");
  await set(`${STORAGE_KEY}:${key}`, payload);
};

export const loadEncryptedState = async (
  key = "latest"
): Promise<EncryptedPayload | undefined> => {
  if (typeof window === "undefined") return undefined;
  const { get } = await import("idb-keyval");
  return (await get(`${STORAGE_KEY}:${key}`)) as EncryptedPayload | undefined;
};

export const clearEncryptedState = async (key?: string): Promise<void> => {
  if (typeof window === "undefined") return;
  const { del, keys } = await import("idb-keyval");
  if (key) {
    await del(`${STORAGE_KEY}:${key}`);
    return;
  }
  const allKeys = (await keys()) as IDBValidKey[];
  const prefix = `${STORAGE_KEY}:`;
  await Promise.all(
    allKeys
      .filter((entry) => typeof entry === "string" && entry.startsWith(prefix))
      .map((entry) => del(entry))
  );
};

export const listEncryptedStateKeys = async (): Promise<string[]> => {
  if (typeof window === "undefined") return [];
  const { keys } = await import("idb-keyval");
  const allKeys = (await keys()) as IDBValidKey[];
  const prefix = `${STORAGE_KEY}:`;
  return allKeys
    .filter((entry): entry is string => typeof entry === "string" && entry.startsWith(prefix))
    .map((entry) => entry.slice(prefix.length));
};
