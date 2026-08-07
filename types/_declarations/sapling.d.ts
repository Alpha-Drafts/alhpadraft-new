declare module "@saplingai/sapling-js/observer" {
  export interface SaplingConfig {
    key: string;
    endpointHostname?: string;
    editPathname?: string;
    statusBadge?: boolean;
    mode?: "dev" | "prod";
  }

  export interface SaplingEdit {
    id: string;
    start: number;
    end: number;
    replacement: string;
    sentence: string;
    rule: {
      id: string;
      description: string;
      examples: string[];
    };
  }

  export class Sapling {
    static init(config: SaplingConfig): void;
    static observe(element: Element | null): void;
    static unobserve(element: Element | null): void;
    static getEdits(): SaplingEdit[];
    static acceptEdit(editId: string): void;
    static rejectEdit(editId: string): void;
  }
}
