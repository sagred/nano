import { CustomInstruction } from '@/types/instructions';

export const instructionsDb = {
  async getAllInstructions(): Promise<CustomInstruction[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['instructions'], (result) => {
        resolve(result.instructions || []);
      });
    });
  },

  async addInstruction(instruction: Omit<CustomInstruction, 'id'>): Promise<void> {
    const instructions = await this.getAllInstructions();
    const newInstruction = {
      ...instruction,
      id: crypto.randomUUID()
    };
    
    return new Promise((resolve) => {
      chrome.storage.local.set({
        instructions: [...instructions, newInstruction]
      }, resolve);
    });
  },

  async deleteInstruction(id: string): Promise<void> {
    const instructions = await this.getAllInstructions();
    return new Promise((resolve) => {
      chrome.storage.local.set({
        instructions: instructions.filter(inst => inst.id !== id)
      }, resolve);
    });
  },

  async updateInstruction(instruction: CustomInstruction): Promise<void> {
    const instructions = await this.getAllInstructions();
    return new Promise((resolve) => {
      chrome.storage.local.set({
        instructions: instructions.map(inst => 
          inst.id === instruction.id ? instruction : inst
        )
      }, resolve);
    });
  }
}; 