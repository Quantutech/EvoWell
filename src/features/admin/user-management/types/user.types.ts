import { UserRole, ModerationStatus } from '@/types';

export interface UserManagementUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
  createdAt: string;
  lastLogin?: string;
}

export interface PractitionerDetail extends UserManagementUser {
  professionalTitle: string;
  specialties: string[];
  licenseNumber?: string;
  licenseState?: string;
  npi?: string;
  moderationStatus: ModerationStatus;
}

export interface ClientDetail extends UserManagementUser {
  intakeStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  lastAppointment?: string;
  providerId?: string;
}
