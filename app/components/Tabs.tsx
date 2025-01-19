interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Tabs({ activeTab, setActiveTab }: TabsProps) {
  const TABS = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "growth",
      label: "Growth",
    },
    {
      id: "sustainability",
      label: "Sustainability",
    },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-purple-400 hover:border-purple-300"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
