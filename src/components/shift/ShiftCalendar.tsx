import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  Moon, 
  Sparkles,
  Check,
  Edit3,
  UserCheck,
  AlertCircle,
  X,
  Loader2,
  Users
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAppContext } from '@/context/AppContext';
import { Shifts } from '@/types';

interface ShiftCalendarProps {
  isAdmin?: boolean;
}

const ShiftCalendar: React.FC<ShiftCalendarProps> = ({ isAdmin = false }) => {
  const { 
    state, 
    setShifts, 
    setShiftStatus, 
    showToast 
  } = useAppContext();
  
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedStaff, setDraggedStaff] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProposal, setAiProposal] = useState<{ shifts: Shifts; summary: string } | null>(null);

  const getDaysInMonth = (date: Date) => {
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

  const getWeekDays = (date: Date) => {
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

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent, staffId: string) => {
    setDraggedStaff(staffId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, dateStr: string, shift: string) => {
    e.preventDefault();
    setDraggedOver(`${dateStr}-${shift}`);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date, shift: 'morning' | 'evening') => {
    e.preventDefault();
    setDraggedOver(null);
    
    if (!draggedStaff || !isAdmin) return;
    
    const dateStr = formatDate(date);
    const newShifts = { ...state.shifts };
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

  const removeFromShift = (date: Date, shift: 'morning' | 'evening', staffId: string) => {
    if (!isAdmin) return;
    
    const dateStr = formatDate(date);
    const newShifts = { ...state.shifts };
    if (newShifts[dateStr] && newShifts[dateStr][shift]) {
      newShifts[dateStr][shift] = newShifts[dateStr][shift].filter(id => id !== staffId);
      setShifts(newShifts);
      showToast('シフトから削除しました');
    }
  };

  const getStaffName = (staffId: string) => {
    const member = state.staff.find(s => s.id === staffId);
    return member ? member.name : '';
  };

  const getRequiredStaff = (date: Date, shift: 'morning' | 'evening') => {
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    return state.storeSettings.minStaff[dayIndex][shift];
  };

  const getAssignedStaff = (date: Date, shift: 'morning' | 'evening') => {
    const dateStr = formatDate(date);
    return state.shifts[dateStr] && state.shifts[dateStr][shift] ? state.shifts[dateStr][shift].length : 0;
  };

  const generateAIShift = async () => {
    setAiLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const proposal: Shifts = {};
      const days = getDaysInMonth(currentDate);
      
      days.forEach(date => {
        const dateStr = formatDate(date);
        proposal[dateStr] = { morning: [], evening: [] };
        
        const morningRequired = getRequiredStaff(date, 'morning');
        const eveningRequired = getRequiredStaff(date, 'evening');
        
        const availableStaff = state.staff.filter(s => {
          const request = state.requests.find(r => r.staffId === s.id && r.date === dateStr);
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
                <Button
                  onClick={generateAIShift}
                  disabled={aiLoading}
                  variant="secondary"
                  icon={aiLoading ? Loader2 : Sparkles}
                >
                  {aiLoading ? '生成中' : 'AI作成'}
                </Button>
                {state.shiftStatus === 'draft' ? (
                  <Button
                    onClick={confirmShift}
                    variant="success"
                    icon={Check}
                  >
                    確定
                  </Button>
                ) : (
                  <Button
                    onClick={editShift}
                    variant="warning"
                    icon={Edit3}
                  >
                    再編集
                  </Button>
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
          state.shiftStatus === 'confirmed' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
        }`}>
          {state.shiftStatus === 'confirmed' ? (
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
            <Card className="sticky top-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                スタッフ一覧
              </h3>
              <div className="space-y-2">
                {state.staff.map(member => (
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
            </Card>
          </div>
        )}

        {/* Calendar */}
        <div className="flex-1">
          <Card className="overflow-hidden" padding="none">
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
              <div className="grid grid-cols-7 gap-2 mb-2">
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
                  const dayRequests = state.requests.filter(r => r.date === dateStr);
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
                      
                      {(['morning', 'evening'] as const).map(shift => {
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
                              {state.shifts[dateStr] && state.shifts[dateStr][shift] && 
                                state.shifts[dateStr][shift].map(staffId => (
                                  <div
                                    key={staffId}
                                    className={`flex justify-between items-center px-2 py-1 rounded text-xs transition-all ${
                                      state.currentStaffId === staffId ? 'bg-gray-800 text-white font-medium' : 'bg-white'
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
          </Card>
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
              <Button
                onClick={() => setAiProposal(null)}
                variant="secondary"
              >
                キャンセル
              </Button>
              <Button
                onClick={applyAIProposal}
                variant="primary"
              >
                適用する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftCalendar;