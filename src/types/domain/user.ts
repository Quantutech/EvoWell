import { UserRole } from '../../data/types/enums';
import { z } from 'zod';
import { StaffAccessProfile } from './access';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(UserRole),
  createdAt: z.string(),
  updatedAt: z.string(),
  isDeleted: z.boolean()
});

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  staffAccess?: StaffAccessProfile;
}

export interface ClientProfile {
  id: string;
  userId: string;
  intakeStatus: 'PENDING' | 'COMPLETED';
  documents: { type: string; url: string; uploadedAt: string }[];
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  pronouns?: string;
  imageUrl?: string;
  phoneNumber?: string;
  address?: Address;
  emergencyContact?: { name: string; phone: string; relation: string };
  wellnessLog?: WellnessEntry[];
  habits?: Habit[];
  preferences?: {
    communication: 'email' | 'sms' | 'both';
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

// These are needed by ClientProfile but defined in common usually. 
// I'll move them to common.ts next.
import { Address } from './common';
import { WellnessEntry } from './wellness';
import { Habit } from './wellness';
