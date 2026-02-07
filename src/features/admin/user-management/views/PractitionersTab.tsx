import React from 'react';
import { ProvidersPeopleTab } from '@/features/admin/people/views/ProvidersPeopleTab';

interface PractitionersTabProps {
  onAddSpecialist?: () => void;
}

export const PractitionersTab: React.FC<PractitionersTabProps> = () => {
  return <ProvidersPeopleTab />;
};
