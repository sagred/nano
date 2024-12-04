// src/App.tsx
import { Chat } from '@/components/Chat';

function App() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-lg overflow-hidden border border-[#27272a] shadow-xl m-4">
        <header className="flex items-center px-6 py-4 border-b border-[#27272a] bg-black">
          <h1 className="text-xl font-semibold text-[#f4f4f5]">NanoScope</h1>
        </header>
        <main className="flex-1 overflow-hidden bg-black">
          <Chat />
        </main>
      </div>
    </div>
  );
}

export default App;