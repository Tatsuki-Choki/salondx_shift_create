import React, { useState } from 'react';
import { Edit3, Trash2, Users } from 'lucide-react';
import { Button, Modal } from '@/components/common';
import { Staff } from '@/types';
import { useStaff } from '@/hooks';
import StaffForm from './StaffForm';

interface StaffListProps {
  staff: Staff[];
}

const StaffList: React.FC<StaffListProps> = ({ staff }) => {
  const { removeStaff } = useStaff();
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingStaff(null);
  };

  const handleDelete = (staffId: string) => {
    if (window.confirm('このスタッフを削除しますか？')) {
      removeStaff(staffId);
    }
  };

  if (staff.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg mb-2">スタッフが登録されていません</p>
        <p className="text-gray-400">新規追加ボタンからスタッフを追加してください</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {staff.map((member) => (
          <div 
            key={member.id} 
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-medium">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.role}</p>
                  {member.email && (
                    <p className="text-xs text-gray-400">{member.email}</p>
                  )}
                  {member.phone && (
                    <p className="text-xs text-gray-400">{member.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Edit3}
                  onClick={() => handleEdit(member)}
                >
                  編集
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => handleDelete(member.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  削除
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="スタッフ情報を編集"
        size="lg"
      >
        <div className="p-6">
          {editingStaff && (
            <StaffForm
              initialData={{
                name: editingStaff.name,
                role: editingStaff.role,
                email: editingStaff.email,
                phone: editingStaff.phone
              }}
              isEditing
              staffId={editingStaff.id}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default StaffList;