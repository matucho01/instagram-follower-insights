import { wrap, Remote } from "comlink";
import type { ParseWorkerApi } from "@/workers/parser.worker";
import type { ParseWorkerResult } from "@/lib/types";

let remoteWorker: Remote<ParseWorkerApi> | null = null;
let workerInstance: Worker | null = null;

const createWorker = (): Worker =>
  new Worker(new URL("../../workers/parser.worker.ts", import.meta.url), {
    type: "module",
    name: "instagram-parser",
  });

export const getParserWorker = (): Remote<ParseWorkerApi> => {
  if (typeof window === "undefined") {
    throw new Error("El worker de parsing solo está disponible en el cliente.");
  }

  if (!remoteWorker) {
    workerInstance = createWorker();
    remoteWorker = wrap<ParseWorkerApi>(workerInstance);
  }

  return remoteWorker;
};

export const parseWithWorker = async (files: File[]): Promise<ParseWorkerResult> => {
  const worker = getParserWorker();
  return worker.parseFiles(files);
};

export const terminateParserWorker = (): void => {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    remoteWorker = null;
  }
};
