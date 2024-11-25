import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { instructionsDb } from '@/services/storage/instructions';
import { CustomInstruction } from '@/types/instructions';

interface AddInstructionFormProps {
  onClose: () => void;
  onAdd: () => void;
  editingInstruction?: CustomInstruction;
}

export const AddInstructionForm: React.FC<AddInstructionFormProps> = ({ 
  onClose, 
  onAdd, 
  editingInstruction 
}) => {
  const [name, setName] = useState(editingInstruction?.name || '');
  const [instruction, setInstruction] = useState(editingInstruction?.instruction || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !instruction.trim()) return;

    if (editingInstruction) {
      await instructionsDb.updateInstruction({
        id: editingInstruction.id,
        name: name.trim(),
        instruction: instruction.trim(),
        icon: 'sparkles',
        createdAt: editingInstruction.createdAt
      });
    } else {
      await instructionsDb.addInstruction({
        name: name.trim(),
        instruction: instruction.trim(),
        icon: 'sparkles',
        createdAt: Date.now()
      });
    }

    onAdd();
    onClose();
  };

  return (
    <div style={{ padding: '24px' }}>
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        width: '90%',
        margin: '0 auto'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            color: '#a1a1aa',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '95%',
              padding: '12px',
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#f4f4f5',
              fontSize: '14px',
              outline: 'none'
            }}
            placeholder="Enter a name for your instruction"
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            color: '#a1a1aa',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Instruction
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            style={{
              width: '95%',
              padding: '12px',
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#f4f4f5',
              fontSize: '14px',
              height: '160px',
              outline: 'none',
              resize: 'vertical',
              minHeight: '160px',
              fontFamily: 'inherit'
            }}
            placeholder="Enter your custom instruction template. Use {text} where the selected text should be inserted."
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          width: '100%' 
        }}>
          <button
            type="submit"
            disabled={!name.trim() || !instruction.trim()}
            style={{
              padding: '12px',
              background: '#22c55e',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              opacity: (!name.trim() || !instruction.trim()) ? 0.5 : 1,
              width: '100%',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {editingInstruction ? 'Update Instruction' : 'Create Instruction'}
          </button>
        </div>
      </form>
    </div>
  );
}; 