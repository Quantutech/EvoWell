import React from 'react';
import { User } from '@/types';
import { UsersPeopleTab } from '@/features/admin/people/views/UsersPeopleTab';
import { UserManagementUser } from '../types/user.types';

interface UserManagementViewProps {
  onAddUser?: () => void;
  onEditUser?: (user: UserManagementUser) => void;
}

function toUserManagementUser(user: User): UserManagementUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.isDeleted ? 'SUSPENDED' : 'ACTIVE',
    createdAt: user.createdAt,
  };
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  onAddUser,
  onEditUser,
}) => {
  return (
    <UsersPeopleTab
      onAddUser={onAddUser}
      onSelectUser={(user) => onEditUser?.(toUserManagementUser(user))}
    />
  );
};
