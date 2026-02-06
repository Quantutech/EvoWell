
import { z } from 'zod';
import { UserRole } from '../types';

export const LoginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegistrationFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  role: z.nativeEnum(UserRole),
});

export const ProviderProfileSchema = z.object({
  professionalTitle: z.string().min(2),
  bio: z.string().min(50, 'Bio should be at least 50 characters'),
  hourlyRate: z.number().min(0),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const AppointmentBookingSchema = z.object({
  providerId: z.string(),
  clientId: z.string(),
  dateTime: z.string().datetime(),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
export type RegistrationFormData = z.infer<typeof RegistrationFormSchema>;
export type AppointmentBookingData = z.infer<typeof AppointmentBookingSchema>;
