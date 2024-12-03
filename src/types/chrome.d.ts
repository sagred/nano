declare namespace chrome {
  export namespace ai {
    export namespace languageModel {
      export function capabilities(): Promise<{ 
        available: "readily" | "not-supported";
        defaultTemperature?: number;
        defaultTopK?: number;
        maxTopK?: number;
      }>;
      export function create(options: { systemPrompt: string }): Promise<{
        prompt: (input: string) => Promise<string>;
        promptStreaming: (input: string) => AsyncGenerator<string>;
      }>;
    }
  }
  
  export namespace sidePanel {
    export function setOptions(options: {
      path: string;
      enabled: boolean;
    }): Promise<void>;
    
    export function open(options: {
      windowId: number;
    }): Promise<void>;
  }
} 