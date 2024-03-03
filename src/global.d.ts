declare function importModule(moduleUrl: string): Promise<any>;

declare const BUILD_INJECT_FILE_PATH;
declare const BUILD_INJECT_LINE_NUMBER;

declare module '*.graphql' {
    import { DocumentNode } from 'graphql';
    const Schema: DocumentNode;
    export = Schema;
  }