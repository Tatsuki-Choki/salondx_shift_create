import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, Input, Button } from '@/components/common';
import { useStaff } from '@/hooks';
import StaffForm from './StaffForm';
import StaffList from './StaffList';

const StaffManagement: React.FC = () => {
  const { staff, searchStaff } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredStaff = searchTerm ? searchStaff(searchTerm) : staff;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-light mb-2">スタッフ管理</h2>
        <p className="text-gray-600">スタッフの管理を行います</p>
      </div>
      
      {/* Add Staff Card */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-700" />
            スタッフ管理
          </h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            icon={Plus}
            size="sm"
          >
            {showAddForm ? '閉じる' : '新規追加'}
          </Button>
        </div>
        
        {showAddForm && (
          <StaffForm onSuccess={() => setShowAddForm(false)} />
        )}
      </Card>

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="スタッフを検索"
          icon={Search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Staff List */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-6">
            スタッフ一覧 ({filteredStaff.length}名)
          </h3>
          <StaffList staff={filteredStaff} />
        </div>
      </Card>
    </div>
  );
};

export default StaffManagement;