/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNAL_SERVER: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
