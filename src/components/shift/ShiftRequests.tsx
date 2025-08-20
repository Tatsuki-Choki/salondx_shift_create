import React, { useState } from 'react';
import { 
  Calendar, 
  X, 
  Coffee, 
  Moon, 
  Check, 
  Plus, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAppContext } from '@/context/AppContext';
import { RequestType } from '@/types';

const ShiftRequests: React.FC = () => {
  const { state, addRequest, deleteRequest, showToast } = useAppContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('off');

  const requestTypes = [
    { value: 'off' as RequestType, label: '休み希望', icon: X, color: 'red' },
    { value: 'morning' as RequestType, label: '早番希望', icon: Coffee, color: 'orange' },
    { value: 'evening' as RequestType, label: '遅番希望', icon: Moon, color: 'purple' },
    { value: 'any' as RequestType, label: '指定なし', icon: Check, color: 'gray' }
  ];

  const handleSubmit = () => {
    if (!selectedDate || !state.currentStaffId) {
      showToast('日付を選択してください', 'error');
      return;
    }
    
    const newRequest = {
      id: Date.now().toString(),
      staffId: state.currentStaffId,
      date: selectedDate,
      type: requestType,
      priority: 'medium' as const,
      status: 'pending' as const,
      submitted: new Date()
    };
    
    addRequest(newRequest);
    showToast('希望を提出しました');
    setSelectedDate('');
  };

  const handleDelete = (id: string) => {
    deleteRequest(id);
    showToast('希望を削除しました');
  };

  const myRequests = state.requests.filter(r => r.staffId === state.currentStaffId);
  const currentStaffName = state.staff.find(s => s.id === state.currentStaffId)?.name || '';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2">希望を提出</h2>
        <p className="text-gray-600">{currentStaffName} さんのシフト希望</p>
      </div>
      
      {state.shiftStatus === 'confirmed' ? (
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
          <Card className="mb-6">
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
              
              <Button
                onClick={handleSubmit}
                variant="primary"
                className="w-full"
              >
                希望を提出
              </Button>
            </div>
          </Card>

          {/* Submitted Requests */}
          <Card>
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
                  const Icon = requestTypeInfo?.icon || Check;
                  
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
                            <p className="text-sm text-gray-600">{requestTypeInfo?.label}</p>
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
          </Card>
        </>
      )}
    </div>
  );
};

export default ShiftRequests;