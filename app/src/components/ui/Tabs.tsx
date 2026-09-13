import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabs">
      <div className="tabs-header flex space-x-4 border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button py-2 px-4 ${activeTab === index ? 'font-bold border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content py-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Tabs;