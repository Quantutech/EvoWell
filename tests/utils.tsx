
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { User, UserRole, ProviderProfile } from '../types';

// Mock Auth Context - we create a mock context to wrap components
// Since we don't export the Context object itself from App.tsx, we might need to mock the hook `useAuth` 
// or export the Context. For now, we'll mock the module `../App` in tests that need it.

export const createMockUser = (role: UserRole = UserRole.CLIENT): User => ({
  id: 'test-user',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDeleted: false
});

export const createMockProvider = (): ProviderProfile => ({
  id: 'prov-1',
  userId: 'test-user',
  professionalTitle: 'Dr.',
  professionalCategory: 'Therapist',
  yearsExperience: 10,
  education: 'PhD',
  educationHistory: [],
  bio: 'Bio',
  tagline: 'Tagline',
  imageUrl: 'img.jpg',
  gallery: [],
  languages: ['English'],
  appointmentTypes: [],
  durations: [],
  specialties: [],
  licenses: [],
  certificates: [],
  availability: { days: [], hours: [], schedule: [], blockedDates: [] },
  onboardingComplete: true,
  subscriptionTier: 'PROFESSIONAL' as any,
  subscriptionStatus: 'ACTIVE' as any,
  moderationStatus: 'APPROVED' as any,
  isPublished: true,
  pricing: { hourlyRate: 100, slidingScale: false },
  compliance: { termsAccepted: true, verificationAgreed: true },
  security: { question: '', answer: '' },
  metrics: { views: 0, inquiries: 0 },
  metricsHistory: [],
  audit: { createdAt: '', updatedAt: '' },
  servicePackages: [],
  digitalProducts: [],
  insuranceAccepted: [],
  paymentMethodsAccepted: [],
  mediaAppearances: []
});

export const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};
