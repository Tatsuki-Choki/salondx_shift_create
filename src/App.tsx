import React, { useState } from 'react';
import { Settings, Users, Calendar, Clock } from 'lucide-react';
import { AppProvider } from '@/context/AppContext';
import { ErrorBoundary, ToastContainer, PlaceholderComponent } from '@/components/common';
import { AdminLayout, StaffLayout } from '@/components/layout';
import { DashboardHome } from '@/components/dashboard';
import { StaffManagement } from '@/components/staff';

// Role switcher component
const RoleSwitcher: React.FC<{ role: string; setRole: (role: string) => void }> = ({ role, setRole }) => (
  <div className="fixed bottom-6 right-6 z-50">
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center">
      <button
        onClick={() => setRole('admin')}
        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
          role === 'admin'
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Settings className="w-4 h-4" />
        管理者
      </button>
      <button
        onClick={() => setRole('staff')}
        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
          role === 'staff'
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Users className="w-4 h-4" />
        スタッフ
      </button>
    </div>
  </div>
);

// Admin content component
const AdminContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardHome />;
    case 'staff':
      return <StaffManagement />;
    case 'shift':
      return (
        <PlaceholderComponent
          title="シフト作成"
          description="シフトカレンダー機能は準備中です"
          icon={Calendar}
        />
      );
    case 'settings':
      return (
        <PlaceholderComponent
          title="店舗設定"
          description="店舗設定機能は準備中です"
          icon={Settings}
        />
      );
    default:
      return <DashboardHome />;
  }
};

// Staff content component
const StaffContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  switch (activeTab) {
    case 'view':
      return (
        <PlaceholderComponent
          title="シフト確認"
          description="シフト確認機能は準備中です"
          icon={Calendar}
        />
      );
    case 'request':
      return (
        <PlaceholderComponent
          title="希望提出"
          description="希望提出機能は準備中です"
          icon={Clock}
        />
      );
    default:
      return (
        <PlaceholderComponent
          title="シフト確認"
          description="シフト確認機能は準備中です"
          icon={Calendar}
        />
      );
  }
};

function App() {
  const [role, setRole] = useState<string>('admin');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [staffTab, setStaffTab] = useState<string>('view');

  return (
    <ErrorBoundary>
      <AppProvider>
        <div 
          className="relative min-h-screen" 
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          {/* Role Switcher */}
          <RoleSwitcher role={role} setRole={setRole} />

          {/* Main Content */}
          {role === 'admin' ? (
            <AdminLayout activeTab={adminTab} onTabChange={setAdminTab}>
              <AdminContent activeTab={adminTab} />
            </AdminLayout>
          ) : (
            <StaffLayout activeTab={staffTab} onTabChange={setStaffTab}>
              <StaffContent activeTab={staffTab} />
            </StaffLayout>
          )}

          {/* Toast Notifications */}
          <ToastContainer />
        </div>

        <style>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes scale-up {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
          
          .animate-scale-up {
            animation: scale-up 0.3s ease-out;
          }
        `}</style>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;