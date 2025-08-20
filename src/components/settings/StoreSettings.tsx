import React, { useState } from 'react';
import { Clock, Sun, Moon, Coffee, Users } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAppContext } from '@/context/AppContext';
import { StoreSettings as StoreSettingsType } from '@/types';

const StoreSettings: React.FC = () => {
  const { state, setStoreSettings, showToast } = useAppContext();
  const [settings, setSettings] = useState<StoreSettingsType>(state.storeSettings);
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
        <Card>
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
        </Card>

        {/* Shift Times */}
        <Card>
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
        </Card>

        {/* Minimum Staff Requirements */}
        <Card>
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
        </Card>

        <Button
          onClick={handleSave}
          variant="primary"
          size="lg"
          className="w-full"
        >
          設定を保存
        </Button>
      </div>
    </div>
  );
};

export default StoreSettings;