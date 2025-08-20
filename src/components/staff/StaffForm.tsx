import React, { useState } from 'react';
import { Button, Input, Select } from '@/components/common';
import { useStaff } from '@/hooks';
import { StaffFormData, StaffRole } from '@/types';

interface StaffFormProps {
  initialData?: StaffFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  staffId?: string;
}

const StaffForm: React.FC<StaffFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  isEditing = false,
  staffId
}) => {
  const { createStaff, editStaff, validateStaffData } = useStaff();
  const [formData, setFormData] = useState<StaffFormData>(
    initialData || {
      name: '',
      role: 'スタイリスト',
      email: '',
      phone: ''
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'スタイリスト', label: 'スタイリスト' },
    { value: 'アシスタント', label: 'アシスタント' },
    { value: 'レセプショニスト', label: 'レセプショニスト' },
    { value: 'ネイリスト', label: 'ネイリスト' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form data
    const validation = validateStaffData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    try {
      let success = false;
      
      if (isEditing && staffId) {
        success = editStaff(staffId, formData);
      } else {
        success = createStaff(formData);
      }

      if (success) {
        setFormData({ name: '', role: 'スタイリスト', email: '', phone: '' });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="氏名"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="山田 太郎"
          required
        />

        <Select
          label="役職"
          options={roleOptions}
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value as StaffRole)}
          error={errors.role}
          required
        />

        <Input
          label="メールアドレス（任意）"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="yamada@example.com"
        />

        <Input
          label="電話番号（任意）"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="03-1234-5678"
        />
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            キャンセル
          </Button>
        )}
        <Button
          type="submit"
          loading={isSubmitting}
        >
          {isEditing ? '更新' : '追加'}
        </Button>
      </div>
    </form>
  );
};

export default StaffForm;