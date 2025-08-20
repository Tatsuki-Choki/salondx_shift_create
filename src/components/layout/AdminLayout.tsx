import React from 'react';
import { Home, Calendar, Users, Settings } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'shift', label: 'シフト作成', icon: Calendar },
    { id: 'staff', label: 'スタッフ管理', icon: Users },
    { id: 'settings', label: '店舗設定', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-light text-gray-800">Salon Manager</h1>
          </div>
          <nav className="px-4 pb-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full mb-2 px-4 py-3 rounded-lg flex items-center gap-3 transition-all font-medium ${
                    activeTab === tab.id
                      ? 'bg-black text-white shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;