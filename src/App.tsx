import React, { useState } from 'react';
import { Settings, Users } from 'lucide-react';
import { AppProvider } from '@/context/AppContext';
import { ErrorBoundary, ToastContainer } from '@/components/common';
import { AdminLayout, StaffLayout } from '@/components/layout';
import { DashboardHome } from '@/components/dashboard';
import { StaffManagement } from '@/components/staff';
import { ShiftCalendar, ShiftRequests } from '@/components/shift';
import { StoreSettings } from '@/components/settings';

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
      return <ShiftCalendar isAdmin={true} />;
    case 'settings':
      return <StoreSettings />;
    default:
      return <DashboardHome />;
  }
};

// Staff content component
const StaffContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  switch (activeTab) {
    case 'view':
      return <ShiftCalendar isAdmin={false} />;
    case 'request':
      return <ShiftRequests />;
    default:
      return <ShiftCalendar isAdmin={false} />;
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

      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;