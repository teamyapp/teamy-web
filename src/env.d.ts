/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENVIRONMENT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare const GIT_SHORT_COMMIT_HASH;
declare const GIT_LONG_COMMIT_HASH;
