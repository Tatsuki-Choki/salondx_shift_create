import React from 'react';
import { Users, Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import Card from '@/components/common/Card';
import { useAppContext } from '@/context/AppContext';

interface DashboardHomeProps {
  onNavigate?: (section: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const { state } = useAppContext();
  
  // Calculate statistics
  const totalShifts = Object.values(state.shifts).reduce((acc, day) => 
    acc + (day.morning?.length || 0) + (day.evening?.length || 0), 0
  );
  
  const currentMonth = new Date().toLocaleDateString('ja-JP', { month: 'long' });
  
  const stats = [
    {
      title: 'スタッフ数',
      value: state.staff.length,
      icon: Users,
      trend: TrendingUp,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      title: `${currentMonth}のシフト数`,
      value: totalShifts,
      icon: Calendar,
      trend: BarChart3,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    },
    {
      title: '本日の開店時間',
      value: state.storeSettings.openTime,
      icon: Clock,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-4xl font-bold text-gray-900 mb-2" 
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          ダッシュボード
        </h1>
        <p className="text-gray-600 text-lg">シフト管理システム</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendComponent = stat.trend;
          
          return (
            <Card 
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate && onNavigate('staff')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                {TrendComponent && (
                  <TrendComponent className="w-5 h-5 text-green-500" />
                )}
              </div>
              <h3 className="text-2xl font-light">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-medium mb-4">最近のアクティビティ</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">システムが正常に動作しています</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">スタッフ管理機能が利用可能です</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">シフト作成機能が利用可能です</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium mb-4">システム情報</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">データベース</span>
              <span className="text-sm font-medium">ローカルストレージ</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">AI機能</span>
              <span className="text-sm font-medium">利用可能</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">最終更新</span>
              <span className="text-sm font-medium">{new Date().toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-medium mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate && onNavigate('shift')}
            className="p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <Calendar className="w-8 h-8 text-gray-600 group-hover:text-black transition-colors mb-2" />
            <div className="font-medium">シフト作成</div>
            <div className="text-sm text-gray-500">新しいシフトを作成</div>
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('staff')}
            className="p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <Users className="w-8 h-8 text-gray-600 group-hover:text-black transition-colors mb-2" />
            <div className="font-medium">スタッフ管理</div>
            <div className="text-sm text-gray-500">スタッフ情報を管理</div>
          </button>
          
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            className="p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <Clock className="w-8 h-8 text-gray-600 group-hover:text-black transition-colors mb-2" />
            <div className="font-medium">店舗設定</div>
            <div className="text-sm text-gray-500">営業時間などを設定</div>
          </button>
          
          <button
            className="p-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
          >
            <BarChart3 className="w-8 h-8 text-gray-600 group-hover:text-black transition-colors mb-2" />
            <div className="font-medium">レポート</div>
            <div className="text-sm text-gray-500">分析とレポート</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHome;