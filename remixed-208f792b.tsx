import React, { useState, useContext, createContext, useEffect } from 'react';
import { Calendar, Users, Settings, ChevronLeft, ChevronRight, Check, X, Loader2, AlertCircle, Home, Bell, Search, Menu, Plus, Trash2, Edit3, Clock, UserCheck, Coffee, Moon, Sun, TrendingUp, BarChart3, Sparkles, ChevronDown } from 'lucide-react';

// Context for global state management
const AppContext = createContext();

// Design Tokens - Modern Monochrome
const theme = {
  colors: {
    primary: '#000000',
    secondary: '#FFFFFF', 
    accent: '#404040',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
};

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-white text-green-800 border-green-300',
    error: 'bg-white text-red-800 border-red-300',
    warning: 'bg-white text-yellow-800 border-yellow-300'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in border-2 ${colors[type]}`}>
      <div className={`${type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
        {icons[type]}
      </div>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
      <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
    </div>
  </div>
);

// Dashboard Home Component
const DashboardHome = ({ onNavigate }) => {
  const { staff, shifts, storeSettings } = useContext(AppContext);
  
  // Calculate statistics
  const totalShifts = Object.values(shifts).reduce((acc, day) => 
    acc + (day.morning?.length || 0) + (day.evening?.length || 0), 0
  );
  
  const currentMonth = new Date().toLocaleDateString('ja-JP', { month: 'long' });
  
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>ダッシュボード</h1>
        <p className="text-gray-600 text-lg">シフト管理システム</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-light">{staff.length}</h3>
          <p className="text-gray-600 text-sm">スタッフ数</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Calendar className="w-6 h-6 text-gray-700" />
            </div>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-2xl font-light">{totalShifts}</h3>
          <p className="text-gray-600 text-sm">{currentMonth}のシフト数</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <h3 className="text-2xl font-light">{storeSettings.openTime}</h3>
          <p className="text-gray-600 text-sm">本日の開店時間</p>
        </div>
      </div>
    </div>
  );
};

// Staff Management Component
const StaffManagement = () => {
  const { staff, setStaff, showToast } = useContext(AppContext);
  const [newStaff, setNewStaff] = useState({ name: '', role: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const roles = ['スタイリスト', 'アシスタント', 'レセプショニスト', 'ネイリスト'];

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.role) {
      showToast('氏名と役職を入力してください', 'error');
      return;
    }
    const id = Date.now().toString();
    setStaff([...staff, { id, ...newStaff }]);
    setNewStaff({ name: '', role: '' });
    showToast('スタッフを追加しました');
  };

  const handleUpdateStaff = (id, updatedStaff) => {
    setStaff(staff.map(s => s.id === id ? { ...s, ...updatedStaff } : s));
    setEditingId(null);
    showToast('スタッフ情報を更新しました');
  };

  const handleDeleteStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id));
    showToast('スタッフを削除しました');
  };

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2">スタッフ管理</h2>
        <p className="text-gray-600">スタッフの管理を行います</p>
      </div>
      
      {/* Add Staff Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-gray-700" />
          新規スタッフ追加
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="氏名"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
            value={newStaff.name}
            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
          />
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
            value={newStaff.role}
            onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
          >
            <option value="">役職を選択</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button
            onClick={handleAddStaff}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            追加
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="スタッフを検索"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-6">スタッフ一覧 ({filteredStaff.length}名)</h3>
          <div className="space-y-3">
            {filteredStaff.map((member) => (
              <div key={member.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {editingId === member.id ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-medium"
                      defaultValue={member.name}
                      id={`name-${member.id}`}
                    />
                    <select
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none font-medium"
                      defaultValue={member.role}
                      id={`role-${member.id}`}
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpdateStaff(member.id, {
                        name: document.getElementById(`name-${member.id}`).value,
                        role: document.getElementById(`role-${member.id}`).value
                      })}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(member.id)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Store Settings Component
const StoreSettings = () => {
  const { storeSettings, setStoreSettings, showToast } = useContext(AppContext);
  const [settings, setSettings] = useState(storeSettings);
  const days = ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'];

  const handleSave = () => {
    setStoreSettings(settings);
    showToast('店舗設定を保存しました');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2">店舗設定</h2>
        <p className="text-gray-600">営業時間やシフト設定を管理します</p>
      </div>
      
      <div className="space-y-6">
        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-700" />
            営業時間
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">開店時間</label>
              <input
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                value={settings.openTime}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">閉店時間</label>
              <input
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                value={settings.closeTime}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Shift Times */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Sun className="w-5 h-5 text-gray-700" />
            シフト時間設定
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-gray-600" />
                  早番
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                    value={settings.shifts.morning.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      shifts: { ...settings.shifts, morning: { ...settings.shifts.morning, start: e.target.value }}
                    })}
                  />
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                    value={settings.shifts.morning.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      shifts: { ...settings.shifts, morning: { ...settings.shifts.morning, end: e.target.value }}
                    })}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-gray-600" />
                  遅番
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                    value={settings.shifts.evening.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      shifts: { ...settings.shifts, evening: { ...settings.shifts.evening, start: e.target.value }}
                    })}
                  />
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                    value={settings.shifts.evening.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      shifts: { ...settings.shifts, evening: { ...settings.shifts.evening, end: e.target.value }}
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimum Staff Requirements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-700" />
            最低必要人数（曜日別）
          </h3>
          <div className="space-y-3">
            {days.map((day, index) => (
              <div key={day} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{day}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        min="0"
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors text-center font-medium"
                        value={settings.minStaff[index].morning}
                        onChange={(e) => {
                          const newMinStaff = [...settings.minStaff];
                          newMinStaff[index].morning = parseInt(e.target.value) || 0;
                          setSettings({ ...settings, minStaff: newMinStaff });
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        min="0"
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors text-center font-medium"
                        value={settings.minStaff[index].evening}
                        onChange={(e) => {
                          const newMinStaff = [...settings.minStaff];
                          newMinStaff[index].evening = parseInt(e.target.value) || 0;
                          setSettings({ ...settings, minStaff: newMinStaff });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium text-lg"
        >
          設定を保存
        </button>
      </div>
    </div>
  );
};

// Enhanced Shift Calendar Component
const ShiftCalendar = ({ isAdmin = false }) => {
  const { shifts, setShifts, staff, storeSettings, requests, shiftStatus, setShiftStatus, showToast, currentStaffId } = useContext(AppContext);
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [draggedStaff, setDraggedStaff] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      week.push(new Date(startOfWeek));
      startOfWeek.setDate(startOfWeek.getDate() + 1);
    }
    return week;
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDragStart = (e, staffId) => {
    setDraggedStaff(staffId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e, dateStr, shift) => {
    e.preventDefault();
    setDraggedOver(`${dateStr}-${shift}`);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = (e, date, shift) => {
    e.preventDefault();
    setDraggedOver(null);
    
    if (!draggedStaff || !isAdmin) return;
    
    const dateStr = formatDate(date);
    const newShifts = { ...shifts };
    if (!newShifts[dateStr]) {
      newShifts[dateStr] = { morning: [], evening: [] };
    }
    if (!newShifts[dateStr][shift].includes(draggedStaff)) {
      newShifts[dateStr][shift].push(draggedStaff);
      setShifts(newShifts);
      showToast('シフトを割り当てました');
    }
    setDraggedStaff(null);
  };

  const removeFromShift = (date, shift, staffId) => {
    if (!isAdmin) return;
    
    const dateStr = formatDate(date);
    const newShifts = { ...shifts };
    if (newShifts[dateStr] && newShifts[dateStr][shift]) {
      newShifts[dateStr][shift] = newShifts[dateStr][shift].filter(id => id !== staffId);
      setShifts(newShifts);
      showToast('シフトから削除しました');
    }
  };

  const getStaffName = (staffId) => {
    const member = staff.find(s => s.id === staffId);
    return member ? member.name : '';
  };

  const getRequiredStaff = (date, shift) => {
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    return storeSettings.minStaff[dayIndex][shift];
  };

  const getAssignedStaff = (date, shift) => {
    const dateStr = formatDate(date);
    return shifts[dateStr] && shifts[dateStr][shift] ? shifts[dateStr][shift].length : 0;
  };

  const generateAIShift = async () => {
    setAiLoading(true);
    
    setTimeout(() => {
      const proposal = {};
      const days = getDaysInMonth(currentDate);
      
      days.forEach(date => {
        const dateStr = formatDate(date);
        proposal[dateStr] = { morning: [], evening: [] };
        
        const morningRequired = getRequiredStaff(date, 'morning');
        const eveningRequired = getRequiredStaff(date, 'evening');
        
        const availableStaff = staff.filter(s => {
          const request = requests.find(r => r.staffId === s.id && r.date === dateStr);
          return !request || request.type !== 'off';
        });
        
        for (let i = 0; i < morningRequired && i < availableStaff.length; i++) {
          proposal[dateStr].morning.push(availableStaff[i].id);
        }
        
        const eveningStaff = availableStaff.filter(s => !proposal[dateStr].morning.includes(s.id));
        for (let i = 0; i < eveningRequired && i < eveningStaff.length; i++) {
          proposal[dateStr].evening.push(eveningStaff[i].id);
        }
      });
      
      setAiProposal({
        shifts: proposal,
        summary: '全スタッフの希望を考慮し、各日の最低必要人数を満たすようにシフトを作成しました。'
      });
      setAiLoading(false);
    }, 2000);
  };

  const applyAIProposal = () => {
    if (aiProposal) {
      setShifts(aiProposal.shifts);
      setAiProposal(null);
      showToast('AIシフトを適用しました');
    }
  };

  const confirmShift = () => {
    setShiftStatus('confirmed');
    showToast('シフトを確定しました');
  };

  const editShift = () => {
    setShiftStatus('draft');
    showToast('シフトを再編集モードにしました');
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-light mb-2">
              {isAdmin ? 'シフト作成' : 'シフト確認'}
            </h2>
            <p className="text-gray-600">
              {isAdmin ? 'ドラッグ&ドロップでシフトを作成' : '確定されたシフトを確認'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={generateAIShift}
                  disabled={aiLoading}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      生成中
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      AI作成
                    </>
                  )}
                </button>
                {shiftStatus === 'draft' ? (
                  <button
                    onClick={confirmShift}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 font-medium"
                  >
                    <Check className="w-5 h-5" />
                    確定
                  </button>
                ) : (
                  <button
                    onClick={editShift}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-sm flex items-center gap-2 font-medium"
                  >
                    <Edit3 className="w-5 h-5" />
                    再編集
                  </button>
                )}
              </>
            )}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  viewMode === 'month' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                月表示
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg transition-all font-medium ${
                  viewMode === 'week' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                週表示
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {!isAdmin && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
          shiftStatus === 'confirmed' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
        }`}>
          {shiftStatus === 'confirmed' ? (
            <>
              <UserCheck className="w-5 h-5" />
              <span className="font-medium">確定版のシフトです</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">管理者が作成中のシフトです</span>
            </>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Staff List for Admin */}
        {isAdmin && (
          <div className="hidden lg:block w-64">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                スタッフ一覧
              </h3>
              <div className="space-y-2">
                {staff.map(member => (
                  <div
                    key={member.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, member.id)}
                    className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Calendar Navigation */}
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else {
                    newDate.setDate(newDate.getDate() - 7);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-medium">
                {viewMode === 'month' 
                  ? `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`
                  : `${days[0].getMonth() + 1}月${days[0].getDate()}日 - ${days[6].getMonth() + 1}月${days[6].getDate()}日`
                }
              </h3>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else {
                    newDate.setDate(newDate.getDate() + 7);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className={`grid grid-cols-7 gap-2 mb-2`}>
                {weekDays.map((day, index) => (
                  <div 
                    key={day} 
                    className={`text-center font-medium py-2 ${
                      index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {viewMode === 'month' && Array(days[0].getDay()).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {days.map(date => {
                  const dateStr = formatDate(date);
                  const dayRequests = requests.filter(r => r.date === dateStr);
                  const isToday = formatDate(new Date()) === dateStr;
                  
                  return (
                    <div
                      key={dateStr}
                      className={`border rounded-lg p-3 min-h-[140px] transition-all ${
                        isToday ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm mb-2 flex justify-between items-center">
                        <span className={date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : ''}>
                          {date.getDate()}
                        </span>
                        {isToday && <span className="text-xs text-gray-500 font-normal">今日</span>}
                      </div>
                      
                      {['morning', 'evening'].map(shift => {
                        const assigned = getAssignedStaff(date, shift);
                        const required = getRequiredStaff(date, shift);
                        const isShort = assigned < required;
                        const isDraggedOver = draggedOver === `${dateStr}-${shift}`;
                        
                        return (
                          <div
                            key={shift}
                            onDrop={(e) => handleDrop(e, date, shift)}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => handleDragEnter(e, dateStr, shift)}
                            onDragLeave={handleDragLeave}
                            className={`mb-2 p-2 rounded-lg text-xs transition-all ${
                              isDraggedOver ? 'bg-gray-200 border-2 border-black border-dashed' :
                              isShort ? 'bg-red-50' : 'bg-green-50'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium flex items-center gap-1">
                                {shift === 'morning' ? <Coffee className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                                {shift === 'morning' ? '早番' : '遅番'}
                              </span>
                              <span className={`font-semibold ${isShort ? 'text-red-600' : 'text-green-600'}`}>
                                {assigned}/{required}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {shifts[dateStr] && shifts[dateStr][shift] && 
                                shifts[dateStr][shift].map(staffId => (
                                  <div
                                    key={staffId}
                                    className={`flex justify-between items-center px-2 py-1 rounded text-xs transition-all ${
                                      currentStaffId === staffId ? 'bg-gray-800 text-white font-medium' : 'bg-white'
                                    } hover:shadow-sm`}
                                  >
                                    <span>{getStaffName(staffId)}</span>
                                    {isAdmin && (
                                      <button
                                        onClick={() => removeFromShift(date, shift, staffId)}
                                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Proposal Modal */}
      {aiProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-up">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-light flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-gray-700" />
                AIシフト提案
              </h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{aiProposal.summary}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>プレビュー機能は準備中です</p>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setAiProposal(null)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={applyAIProposal}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium"
              >
                適用する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Shift Requests Component
const ShiftRequests = () => {
  const { requests, setRequests, shiftStatus, currentStaffId, showToast, staff } = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState('');
  const [requestType, setRequestType] = useState('off');

  const requestTypes = [
    { value: 'off', label: '休み希望', icon: X, color: 'red' },
    { value: 'morning', label: '早番希望', icon: Coffee, color: 'orange' },
    { value: 'evening', label: '遅番希望', icon: Moon, color: 'purple' },
    { value: 'any', label: '指定なし', icon: Check, color: 'gray' }
  ];

  const handleSubmit = () => {
    if (!selectedDate || !currentStaffId) {
      showToast('日付を選択してください', 'error');
      return;
    }
    
    const newRequest = {
      id: Date.now().toString(),
      staffId: currentStaffId,
      date: selectedDate,
      type: requestType
    };
    
    setRequests([...requests.filter(r => !(r.staffId === currentStaffId && r.date === selectedDate)), newRequest]);
    showToast('希望を提出しました');
    setSelectedDate('');
  };

  const handleDelete = (id) => {
    setRequests(requests.filter(r => r.id !== id));
    showToast('希望を削除しました');
  };

  const myRequests = requests.filter(r => r.staffId === currentStaffId);
  const currentStaffName = staff.find(s => s.id === currentStaffId)?.name || '';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2">希望を提出</h2>
        <p className="text-gray-600">{currentStaffName} さんのシフト希望</p>
      </div>
      
      {shiftStatus === 'confirmed' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">シフトが確定されています</h3>
            <p className="text-yellow-700">新しい希望は提出できません。変更が必要な場合は管理者にご相談ください。</p>
          </div>
        </div>
      ) : (
        <>
          {/* Submit Request Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gray-700" />
              新規希望提出
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors font-medium"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望種別</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {requestTypes.map(type => {
                    const Icon = type.icon;
                    const isSelected = requestType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setRequestType(type.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          isSelected ? 'text-black' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-medium ${
                          isSelected ? 'text-black' : 'text-gray-600'
                        }`}>
                          {type.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium"
              >
                希望を提出
              </button>
            </div>
          </div>

          {/* Submitted Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium mb-6">提出済みの希望 ({myRequests.length}件)</h3>
            {myRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">提出された希望はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map(request => {
                  const requestTypeInfo = requestTypes.find(t => t.value === request.type);
                  const Icon = requestTypeInfo.icon;
                  
                  return (
                    <div key={request.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                            <Icon className="w-5 h-5 text-gray-700" />
                          </div>
                          <div>
                            <p className="font-medium">{new Date(request.date).toLocaleDateString('ja-JP', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              weekday: 'short'
                            })}</p>
                            <p className="text-sm text-gray-600">{requestTypeInfo.label}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Admin Layout Component
const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'shift', label: 'シフト作成', icon: Calendar },
    { id: 'staff', label: 'スタッフ管理', icon: Users },
    { id: 'settings', label: '店舗設定', icon: Settings }
  ];

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
  };

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
                  onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'dashboard' && <DashboardHome onNavigate={handleNavigate} />}
          {activeTab === 'shift' && <ShiftCalendar isAdmin={true} />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'settings' && <StoreSettings />}
        </main>
      </div>
    </div>
  );
};

// Staff Layout Component
const StaffLayout = () => {
  const { staff, currentStaffId, setCurrentStaffId } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('view');
  const [showStaffMenu, setShowStaffMenu] = useState(false);

  const currentStaff = staff.find(s => s.id === currentStaffId);

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
                    {staff.map(member => (
                      <button
                        key={member.id}
                        onClick={() => {
                          setCurrentStaffId(member.id);
                          setShowStaffMenu(false);
                        }}
                        className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                          currentStaffId === member.id ? 'bg-gray-50' : ''
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
      
      {currentStaffId && (
        <>
          {/* Navigation Tabs */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-8">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`py-4 px-6 border-b-2 transition-all font-medium ${
                    activeTab === 'view'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  シフト確認
                </button>
                <button
                  onClick={() => setActiveTab('request')}
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
            {activeTab === 'request' && <ShiftRequests />}
            {activeTab === 'view' && <ShiftCalendar isAdmin={false} />}
          </div>
        </>
      )}
      
      {!currentStaffId && (
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

// Main App Component
function App() {
  const [role, setRole] = useState('admin');
  const [staff, setStaff] = useState([
    { id: '1', name: '田中太郎', role: 'スタイリスト' },
    { id: '2', name: '佐藤花子', role: 'アシスタント' },
    { id: '3', name: '鈴木一郎', role: 'スタイリスト' },
    { id: '4', name: '山田美咲', role: 'ネイリスト' },
    { id: '5', name: '高橋真理', role: 'スタイリスト' },
    { id: '6', name: '伊藤健太', role: 'アシスタント' },
    { id: '7', name: '渡辺さくら', role: 'レセプショニスト' },
    { id: '8', name: '小林優子', role: 'スタイリスト' },
    { id: '9', name: '加藤大輔', role: 'アシスタント' },
    { id: '10', name: '木村愛美', role: 'ネイリスト' }
  ]);
  const [storeSettings, setStoreSettings] = useState({
    openTime: '09:00',
    closeTime: '20:00',
    shifts: {
      morning: { start: '09:00', end: '15:00' },
      evening: { start: '14:00', end: '20:00' }
    },
    minStaff: [
      { morning: 2, evening: 2 },
      { morning: 2, evening: 2 },
      { morning: 2, evening: 3 },
      { morning: 2, evening: 3 },
      { morning: 3, evening: 3 },
      { morning: 3, evening: 3 },
      { morning: 2, evening: 2 }
    ]
  });
  const [shifts, setShifts] = useState({});
  const [requests, setRequests] = useState([]);
  const [shiftStatus, setShiftStatus] = useState('draft');
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Save to localStorage
  useEffect(() => {
    const data = { staff, storeSettings, shifts, requests, shiftStatus };
    localStorage.setItem('salonShiftData', JSON.stringify(data));
  }, [staff, storeSettings, shifts, requests, shiftStatus]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('salonShiftData');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.staff) setStaff(data.staff);
      if (data.storeSettings) setStoreSettings(data.storeSettings);
      if (data.shifts) setShifts(data.shifts);
      if (data.requests) setRequests(data.requests);
      if (data.shiftStatus) setShiftStatus(data.shiftStatus);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      staff, setStaff,
      storeSettings, setStoreSettings,
      shifts, setShifts,
      requests, setRequests,
      shiftStatus, setShiftStatus,
      currentStaffId, setCurrentStaffId,
      showToast
    }}>
      <div className="relative min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        
        {/* Role Switcher */}
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

        {/* Main content */}
        {role === 'admin' ? <AdminLayout /> : <StaffLayout />}

        {/* Toast notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <style jsx>{`
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
    </AppContext.Provider>
  );
}

export default App;