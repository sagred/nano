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
            color: '#f4f4f5',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#f4f4f5',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.05)',
              }
            }}
            placeholder="Enter a name for your instruction"
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            color: '#f4f4f5',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Instruction
          </label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#f4f4f5',
              fontSize: '14px',
              height: '160px',
              outline: 'none',
              resize: 'vertical',
              minHeight: '160px',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.05)',
              }
            }}
            placeholder="Enter your custom instruction template. Use {text} where the selected text should be inserted."
          />
        </div>
        
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
            transition: 'all 0.2s ease',
            '&:hover': {
              background: '#16a34a',
            }
          }}
        >
          {editingInstruction ? 'Update Instruction' : 'Create Instruction'}
        </button>
      </form>
    </div>
  );
}; 