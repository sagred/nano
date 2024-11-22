import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-4 right-4">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg opacity-90 hover:opacity-100"
        onClick={onClick}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </div>
  );
}; 