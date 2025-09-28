/// <reference lib="webworker" />

import { expose } from "comlink";
import JSZip from "jszip";
import type {
  AccountInfo,
  ParsedDataset,
  ParserWarning,
  ParseWorkerResult,
} from "@/lib/types";
import { buildStateFromDatasets } from "@/lib/instagram/assembler";
import { parseInstagramDataset } from "@/lib/instagram/parsers";

const annotateDatasetWarnings = (
  fileName: string,
  dataset: ParsedDataset,
  warnings: ParserWarning[]
): ParsedDataset => {
  if (dataset.kind === "unknown") {
    warnings.push({
      file: fileName,
      message:
        "Archivo reconocido pero sin categoría conocida. Asegúrate de arrastrar los archivos de la carpeta followers_and_following.",
    });
  }

  if (dataset.kind !== "profile_information" && dataset.entries.length === 0) {
    warnings.push({
      file: fileName,
      message:
        "No se detectaron usuarios en este archivo. Verifica que sea un JSON exportado desde Instagram sin modificar.",
    });
  }

  return dataset;
};

const parseJsonString = (
  fileName: string,
  content: string,
  warnings: ParserWarning[]
): ParsedDataset | null => {
  try {
    const json = JSON.parse(content);
    const dataset = parseInstagramDataset(fileName, json);
    return annotateDatasetWarnings(fileName, dataset, warnings);
  } catch (error) {
    warnings.push({
      file: fileName,
      message: `No se pudo parsear JSON: ${(error as Error).message}`,
    });
    return null;
  }
};

const parseJsonFile = async (file: File, warnings: ParserWarning[]): Promise<ParsedDataset | null> => {
  const text = await file.text();
  return parseJsonString(file.name, text, warnings);
};

const parseZipFile = async (
  file: File,
  warnings: ParserWarning[]
): Promise<{ datasets: ParsedDataset[]; timestamp: number }> => {
  const datasets: ParsedDataset[] = [];
  let latest = file.lastModified ?? 0;

  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());

    const entries = Object.values(zip.files);
    for (const entry of entries) {
      if (entry.dir) continue;
      if (!entry.name.toLowerCase().endsWith(".json")) continue;

      try {
        const content = await entry.async("string");
        const dataset = parseJsonString(entry.name, content, warnings);
        if (dataset) {
          datasets.push(dataset);
        }
        if (entry.date instanceof Date) {
          latest = Math.max(latest, entry.date.getTime());
        }
      } catch (error) {
        warnings.push({
          file: entry.name,
          message: `Error al extraer del ZIP: ${(error as Error).message}`,
        });
      }
    }
  } catch (error) {
    warnings.push({
      file: file.name,
      message: `No se pudo abrir ZIP: ${(error as Error).message}`,
    });
  }

  return { datasets, timestamp: latest };
};

const extractAccountInfo = (
  datasets: ParsedDataset[],
  fallbackTimestamp: number
): AccountInfo => {
  const account: AccountInfo = {};
  const profileDataset = datasets.find((dataset) => dataset.kind === "profile_information");

  if (profileDataset) {
    const raw = profileDataset.raw as Record<string, unknown> | undefined;
    const username = findUsername(raw);
    if (username) {
      account.username = username;
    }

    const timestamp = findTimestamp(raw);
    if (timestamp) {
      account.snapshotDate = new Date(timestamp).toISOString();
    }
  }

  if (!account.snapshotDate && Number.isFinite(fallbackTimestamp) && fallbackTimestamp > 0) {
    account.snapshotDate = new Date(fallbackTimestamp).toISOString();
  }

  if (!account.snapshotDate) {
    account.snapshotDate = new Date().toISOString();
  }

  return account;
};

const findUsername = (raw: Record<string, unknown> | undefined): string | undefined => {
  if (!raw) return undefined;
  const direct = raw.username;
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  const profileUser = raw.profile_user;
  if (profileUser && typeof profileUser === "object") {
    const username = (profileUser as Record<string, unknown>).username;
    if (typeof username === "string" && username.trim()) {
      return username.trim();
    }
  }

  const profile = raw.profile;
  if (profile && typeof profile === "object") {
    const username = (profile as Record<string, unknown>).username;
    if (typeof username === "string" && username.trim()) {
      return username.trim();
    }
  }

  return undefined;
};

const findTimestamp = (raw: Record<string, unknown> | undefined): number | undefined => {
  if (!raw) return undefined;
  const direct = raw.timestamp;
  if (typeof direct === "number") {
    return direct * (direct > 10_000_000_000 ? 1 : 1000);
  }

  const profileUser = raw.profile_user;
  if (profileUser && typeof profileUser === "object") {
    const timestamp = (profileUser as Record<string, unknown>).timestamp;
    if (typeof timestamp === "number") {
      return timestamp * (timestamp > 10_000_000_000 ? 1 : 1000);
    }
  }

  return undefined;
};

interface ParseWorkerApi {
  parseFiles(files: File[]): Promise<ParseWorkerResult>;
}

const api: ParseWorkerApi = {
  async parseFiles(files: File[]): Promise<ParseWorkerResult> {
    const warnings: ParserWarning[] = [];
    const datasets: ParsedDataset[] = [];
    let latestTimestamp = 0;

    for (const file of files) {
      latestTimestamp = Math.max(latestTimestamp, file.lastModified ?? 0);
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith(".zip")) {
        const result = await parseZipFile(file, warnings);
        datasets.push(...result.datasets);
        latestTimestamp = Math.max(latestTimestamp, result.timestamp);
      } else if (lowerName.endsWith(".json")) {
        const dataset = await parseJsonFile(file, warnings);
        if (dataset) datasets.push(dataset);
      } else {
        warnings.push({
          file: file.name,
          message: "Tipo de archivo no soportado. Usa ZIP o JSON exportados desde Instagram.",
        });
      }
    }

    const account = extractAccountInfo(datasets, latestTimestamp);
    const result = buildStateFromDatasets(datasets, account);
    result.state.files = datasets;

    return {
      ...result,
      warnings,
    };
  },
};

export type { ParseWorkerApi };

expose(api);
