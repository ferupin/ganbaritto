import { brand } from "@/config";

/**
 * Persistência 100% local (localStorage). Sem backend, sem banco de dados.
 * Tudo em try/catch: em modo privado ou com o armazenamento bloqueado o app
 * continua funcionando, só sem salvar. Quem lê valida com Zod.
 */
export const P = brand.storagePrefix;

export function readRaw(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeRaw(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignora */
  }
}

export function storageAvailable(): boolean {
  try {
    const k = `${P}.__test`;
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/** Chaves do app (com o prefixo). Usado pelo backup para achar tentativas e históricos. */
export function listKeys(): string[] {
  try {
    const out: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(`${P}.`)) out.push(k);
    }
    return out;
  } catch {
    return [];
  }
}
