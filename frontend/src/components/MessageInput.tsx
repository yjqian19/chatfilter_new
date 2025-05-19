interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading?: boolean;
  }

  export const MessageInput = ({ value, onChange, onSubmit, isLoading = false }: MessageInputProps) => (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!isLoading && value.trim()) {
        onSubmit();
        }
      }}
      className="flex gap-2 mt-4"
    >
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Type a message..."
        disabled={isLoading}
        className={`
          flex-1 px-3 py-2 border border-gray-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-gray-200
          ${isLoading ? 'bg-gray-50 text-gray-400' : ''}
        `}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className={`
          px-4 py-2 rounded-lg transition-colors
          ${isLoading || !value.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-600 text-white hover:bg-gray-700'}
        `}
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
