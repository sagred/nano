declare namespace chrome {
  export namespace ai {
    export namespace languageModel {
      export function capabilities(): Promise<{ available: "readily" | "not-supported" }>;
      export function create(options: { systemPrompt: string }): Promise<{
        prompt: (input: string) => Promise<string>;
      }>;
    }
  }
} 