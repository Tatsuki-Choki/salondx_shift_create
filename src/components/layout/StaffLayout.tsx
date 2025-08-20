import React, { useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface StaffLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const StaffLayout: React.FC<StaffLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { state, setCurrentStaffId } = useAppContext();
  const [showStaffMenu, setShowStaffMenu] = useState(false);

  const currentStaff = state.staff.find(s => s.id === state.currentStaffId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light text-gray-800">Salon Manager</h1>
            
            {/* Staff Selector */}
            <div className="relative">
              <button
                onClick={() => setShowStaffMenu(!showStaffMenu)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {currentStaff ? (
                  <>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {currentStaff.name.charAt(0)}
                    </div>
                    <span className="font-medium">{currentStaff.name}</span>
                  </>
                ) : (
                  <span className="text-gray-600">スタッフを選択</span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showStaffMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    {state.staff.map(member => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setCurrentStaffId(member.id);
                          setShowStaffMenu(false);
                        }}
                        className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                          state.currentStaffId === member.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {state.currentStaffId ? (
        <>
          {/* Navigation Tabs */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-8">
              <div className="flex gap-6">
                <button
                  onClick={() => onTabChange('view')}
                  className={`py-4 px-6 border-b-2 transition-all font-medium ${
                    activeTab === 'view'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  シフト確認
                </button>
                <button
                  onClick={() => onTabChange('request')}
                  className={`py-4 px-6 border-b-2 transition-all font-medium ${
                    activeTab === 'request'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  希望提出
                </button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="container mx-auto">
            {children}
          </div>
        </>
      ) : (
        <div className="container mx-auto px-8 py-12">
          <div className="text-center">
            <Users className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-light text-gray-700 mb-2">スタッフを選択してください</h2>
            <p className="text-gray-500">右上のメニューからスタッフを選択すると、シフトの確認や希望の提出ができます。</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffLayout;