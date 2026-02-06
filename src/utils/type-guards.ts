import { 
  User, 
  ProviderProfile, 
  UserRole, 
  AppointmentStatus,
  AppointmentType,
  SessionFormat,
  ModerationStatus,
  SubscriptionStatus,
  SubscriptionTier
} from '@/types';

export function isProvider(user: User): boolean {
  return user.role === UserRole.PROVIDER;
}

export function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

export function isClient(user: User): boolean {
  return user.role === UserRole.CLIENT;
}

export function isValidAppointmentStatus(status: string): status is AppointmentStatus {
  return Object.values(AppointmentStatus).includes(status as AppointmentStatus);
}

export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidAppointmentType(type: string): type is AppointmentType {
  return Object.values(AppointmentType).includes(type as AppointmentType);
}

export function isValidSessionFormat(format: string): format is SessionFormat {
  return Object.values(SessionFormat).includes(format as SessionFormat);
}

export function isValidModerationStatus(status: string): status is ModerationStatus {
  return Object.values(ModerationStatus).includes(status as ModerationStatus);
}

export function isApprovedProvider(provider: ProviderProfile): boolean {
  return provider.moderationStatus === ModerationStatus.APPROVED;
}

export function isActiveSubscriber(provider: ProviderProfile): boolean {
  return provider.subscriptionStatus === SubscriptionStatus.ACTIVE;
}