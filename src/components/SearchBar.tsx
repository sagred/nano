// src/components/SearchBar.tsx
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#71717a]" />
      <Input
        type="text"
        placeholder="Search your bookmarks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 bg-transparent border-[#27272a] text-[#f4f4f5] placeholder:text-[#71717a] focus:ring-[#22c55e]"
      />
    </div>
  );
};
