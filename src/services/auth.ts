
import { supabase } from './supabase';

export interface MFAFactor {
  id: string;
  friendly_name?: string;
  factor_type: 'totp';
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
}

export interface MFAEnrollResponse {
  id: string;
  type: 'totp';
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

class AuthService {
  /**
   * Enroll a new TOTP factor.
   * Returns the QR code (SVG data URI) and secret for the user to scan/enter.
   */
  async enrollMFA(): Promise<MFAEnrollResponse> {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    });

    if (error) throw error;
    return data as MFAEnrollResponse;
  }

  /**
   * Challenge a factor to prepare for verification.
   * Required before verify() during login.
   */
  async challengeMFA(factorId: string): Promise<string> {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (error) throw error;
    return data.id;
  }

  /**
   * Verify a code against a factor.
   * Used for both initial enrollment verification and login verification.
   */
  async verifyMFA(factorId: string, challengeId: string, code: string): Promise<boolean> {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) throw error;
    return !!data;
  }

  /**
   * Verify enrollment (first time setup).
   * Note: Supabase uses the same verify method, but conceptually it's the "Activate" step.
   * We need to challenge first even for enrollment verification in some flows, 
   * but usually enroll returns a factor that is 'unverified'.
   */
  async verifyMFAEnrollment(factorId: string, code: string): Promise<boolean> {
    // For enrollment, we create a challenge against the new factor
    const challengeId = await this.challengeMFA(factorId);
    return this.verifyMFA(factorId, challengeId, code);
  }

  /**
   * List all enrolled factors for the current user.
   */
  async listMFAFactors(): Promise<MFAFactor[]> {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    // Filter for verified TOTP factors usually, but list all for management
    return (data.all as MFAFactor[]) || [];
  }

  /**
   * Remove a factor.
   */
  async unenrollMFA(factorId: string): Promise<boolean> {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    if (error) throw error;
    return true;
  }

  /**
   * Check if the current session meets the required assurance level.
   */
  async getAssuranceLevel() {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    return data;
  }
}

export const authService = new AuthService();
