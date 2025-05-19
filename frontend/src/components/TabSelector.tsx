interface TabSelectorProps {
  activeTab: 'all' | 'filtered';
  onTabChange: (tab: 'all' | 'filtered') => void;
}

export const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div className="relative flex border-b border-gray-300 py-2">
      {/* 底部滑动指示器 */}
      <div
        className={`
          absolute bottom-0 h-0.5 w-1/2 bg-gray-600
          transition-transform duration-300 ease-in-out
          ${activeTab === 'filtered' ? 'translate-x-full' : 'translate-x-0'}
        `}
      />

      <button
        onClick={() => onTabChange('all')}
        className={`
          flex-1 py-2 text-center text-sm font-medium
          transition-colors duration-200
          ${activeTab === 'all'
            ? 'text-gray-800'
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        <strong>ALL MESSAGES</strong>
      </button>
      <button
        onClick={() => onTabChange('filtered')}
        className={`
          flex-1 py-2 text-center text-sm font-medium
          transition-colors duration-200
          ${activeTab === 'filtered'
            ? 'text-gray-800'
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        <strong>TOPIC FILTER</strong>
      </button>
    </div>
  );
};
