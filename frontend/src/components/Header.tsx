// src/components/Header.tsx
interface HeaderProps {
    onProfile: () => void;
    onLogout: () => void;
  }

  export const Header = ({ onProfile, onLogout }: HeaderProps) => (
    <div className="flex justify-between items-center p-4 bg-gray-100 border-b-2 border-gray-300">
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">NYC Trip</h1>
      <div className="flex gap-3">
        <button
          onClick={onProfile}
          className="px-4 py-1.5 text-sm bg-white rounded-lg hover:bg-gray-100 transition-colors"
        >
          Profile
        </button>
        <button
          onClick={onLogout}
          className="px-4 py-1.5 text-sm bg-white rounded-lg hover:bg-gray-100 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
