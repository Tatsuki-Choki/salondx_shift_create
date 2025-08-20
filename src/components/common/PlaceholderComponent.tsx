import React from 'react';
import { LucideIcon } from 'lucide-react';
import Card from './Card';

interface PlaceholderComponentProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

const PlaceholderComponent: React.FC<PlaceholderComponentProps> = ({
  title,
  description,
  icon: Icon
}) => {
  return (
    <div className="p-8">
      <Card className="text-center" padding="lg">
        {Icon && <Icon className="w-16 h-16 mx-auto text-gray-300 mb-4" />}
        <h2 className="text-2xl font-light text-gray-700 mb-2">{title}</h2>
        {description && <p className="text-gray-500">{description}</p>}
      </Card>
    </div>
  );
};

export default PlaceholderComponent;