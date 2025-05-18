interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
  }

  export const MessageInput = ({ value, onChange, onSubmit }: MessageInputProps) => (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex gap-2 mt-4"
    >
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Send
      </button>
    </form>
  );
