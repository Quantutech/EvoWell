import React, { useState } from 'react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';
import { authService } from '../services/auth';
import { UserRole } from '../types';
import Logo from '../components/brand/Logo';
import { useNavigation } from '../App';
import { checkPasswordStrength } from '../utils/validation';
import { sanitizeHTML } from '../utils/content-sanitizer';
import { logger } from '../utils/logger';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card } from '../components/ui';

// --- Social Login Button ---
const SocialButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
  >
    {icon}
    <span>{label}</span>
  </button>
);

// --- MFA Verification Modal ---
const MfaModal: React.FC<{ 
  email: string; 
  onVerify: (code: string) => void; 
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}> = ({ email, onVerify, onCancel, loading, error }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`mfa-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`mfa-${index - 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onVerify(fullCode);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6 mx-auto">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <Heading level={3} className="text-center mb-2">Security Verification</Heading>
          <Text className="text-center mb-8">
            Enter the 6-digit code from your authenticator app for <strong>{email}</strong>
          </Text>
          
          <div className="flex justify-center gap-2 mb-6">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`mfa-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
              <Text variant="small" color="error" className="text-center">{error}</Text>
            </div>
          )}

          <Button fullWidth onClick={handleVerify} loading={loading} disabled={code.join('').length !== 6}>
            Verify Identity
          </Button>
          <button onClick={onCancel} className="w-full mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">
            Cancel Login
          </button>
       </div>
    </div>
  );
};

// --- Main Login View ---
const LoginView: React.FC<{ login: (e: string, p?: string) => Promise<void>; initialParams?: URLSearchParams }> = ({ login, initialParams }) => {
  const { navigate } = useNavigation();
  
  // Determine initial state from URL params
  const isJoinFlow = initialParams?.get('join') === 'true';
  const initialRole = initialParams?.get('role') === 'provider' ? UserRole.PROVIDER : UserRole.CLIENT;
  
  // Form State
  const [isReg, setIsReg] = useState(isJoinFlow);
  const [role, setRole] = useState<UserRole>(isJoinFlow ? initialRole : UserRole.CLIENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [pendingRedirect, setPendingRedirect] = useState('/portal');
  
  // Security
  const passwordStrength = checkPasswordStrength(password);

  // ============================================================
  // CRITICAL FIX: Smart redirect based on role and onboarding
  // ============================================================
  const getRedirectPath = (userRole: UserRole, isNewRegistration: boolean): string => {
    if (userRole === UserRole.PROVIDER) {
      // New provider registrations always go to onboarding
      if (isNewRegistration) {
        return '/onboarding';
      }
      // Existing providers go to console
      return '/console';
    }
    if (userRole === UserRole.ADMIN) return '/admin';
    // Clients go to portal
    return '/portal';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password strength for registration
    if (isReg && passwordStrength.score < 3) {
      setError('Password is too weak. Please include numbers, symbols, and mixed case.');
      setLoading(false);
      return;
    }
    
    try {
      if (isReg) {
        // ============================================================
        // REGISTRATION FLOW
        // ============================================================
        logger.info('Starting registration', { email, role });
        
        // Register the user (this now creates provider profile if role is PROVIDER)
        await api.register({ 
          email: sanitizeHTML(email), 
          firstName: sanitizeHTML(firstName), 
          lastName: sanitizeHTML(lastName), 
          role,
          password
        });
        logger.info('Registration successful, logging in...');
        
        // Log them in
        await login(email, password);
        
        // Redirect based on role
        const redirectPath = getRedirectPath(role, true);
        logger.info('Redirecting after registration', { role, redirectPath });
        navigate(redirectPath);
        
      } else {
        // ============================================================
        // LOGIN FLOW
        // ============================================================
        await performLoginFlow();
      }
    } catch (err: any) { 
      logger.error('Auth error', err);
      setError(err.message || 'Authentication failed. Please try again.'); 
      setLoading(false);
    } 
  };

  const performLoginFlow = async () => {
    try {
      const result = await api.login(email, password);
      
      if (!result || !result.user) {
        throw new Error('Login failed - no user data returned');
      }
      
      // Determine redirect path based on role and onboarding status
      let redirectPath = '/portal';
      
      if (result.user.role === UserRole.ADMIN) {
        redirectPath = '/admin';
      } else if (result.user.role === UserRole.PROVIDER) {
        redirectPath = '/console';
        // Check if provider profile exists and onboarding is complete
        if (!result.provider || !result.provider.onboardingComplete) {
          redirectPath = '/onboarding';
          logger.info('Provider needs onboarding', { 
            hasProvider: !!result.provider, 
            onboardingComplete: result.provider?.onboardingComplete 
          });
        }
      }

      // Check if MFA is required
      const level = await authService.getAssuranceLevel();
      if (level && level.nextLevel === 'aal2' && level.currentLevel !== 'aal2') {
        // User has MFA enrolled but hasn't verified this session
        setPendingRedirect(redirectPath);
        setShowMfa(true);
        setLoading(false);
        return;
      }
      
      // Trigger the App's login to update context
      await login(email, password);
      
      logger.info('Login successful, redirecting', { role: result.user.role, redirectPath });
      navigate(redirectPath);
      
    } catch (err: any) { 
      throw err; 
    }
  };

  const handleMfaVerify = async (code: string) => {
    setLoading(true);
    setMfaError('');
    try {
      const factors = await authService.listMFAFactors();
      const verifiedFactor = factors.find(f => f.status === 'verified');
      
      if (verifiedFactor) {
        const challengeId = await authService.challengeMFA(verifiedFactor.id);
        await authService.verifyMFA(verifiedFactor.id, challengeId, code);
        
        // Final state cleanup before navigation
        const target = pendingRedirect;
        setPendingRedirect('/dashboard');
        setShowMfa(false);
        
        navigate(target);
      } else {
        setMfaError('No verified MFA factor found.');
        setLoading(false);
      }
    } catch (err: any) {
      logger.error('MFA verification failed', err);
      setMfaError('Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { 
          redirectTo: `${window.location.origin}${window.location.pathname}#/auth/callback`, 
          queryParams: { access_type: 'offline', prompt: 'consent' } 
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate social login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* MFA Modal */}
      {showMfa && (
        <MfaModal 
          email={email} 
          onVerify={handleMfaVerify} 
          onCancel={() => { 
            setShowMfa(false); 
            setLoading(false); 
            setMfaError('');
            setPendingRedirect('/dashboard');
          }}
          loading={loading}
          error={mfaError}
        />
      )}

      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 py-12 relative z-10">
        <div className="mb-12">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest mb-8 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Site
          </button>
          
          <div className="inline-block mb-8">
             <Logo className="h-8" />
          </div>
          
          <Heading level={1} className="mb-3">
            {isReg ? 'Create secure account' : 'Welcome back'}
          </Heading>
          <Text color="muted">
            {isReg ? 'Join the network redefining clinical wellness.' : 'Enter your credentials to access the secure portal.'}
          </Text>
        </div>

        {/* Social Auth */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <SocialButton 
            onClick={() => handleSocialLogin('google')}
            label="Google"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            } 
          />
          <SocialButton 
            onClick={() => handleSocialLogin('apple')}
            label="Apple"
            icon={
              <svg className="w-5 h-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-.99 4.31-.74c.58.03 2.2.21 3.24 1.73-2.73 1.63-2.27 4.86.37 5.99-.2.61-.31 1.09-.55 1.65-.56 1.4-1.32 2.62-2.45 3.6zM13.03 5.37c.75-1.02.95-2.31.52-3.37 1.2.14 2.45.81 3.03 1.93.59 1.17.44 2.55-.49 3.52-.96 1.07-2.38.76-3.06-.08z"/>
              </svg>
            } 
          />
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-white px-4 text-slate-400 font-bold">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
          {isReg && (
            <>
              {/* Role Selection */}
              <div className="mb-6">
                <Label className="mb-3">I want to join as a</Label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setRole(UserRole.CLIENT)} 
                    className={`py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      role === UserRole.CLIENT 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-100' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    🧑‍💼 Patient / Client
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole(UserRole.PROVIDER)} 
                    className={`py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      role === UserRole.PROVIDER 
                        ? 'bg-white text-brand-600 shadow-sm border border-brand-100' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    🩺 Healthcare Provider
                  </button>
                </div>
                {role === UserRole.PROVIDER && (
                  <Text variant="caption" color="muted" className="mt-2 ml-1">
                    Providers will complete additional verification after signup.
                  </Text>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <input 
                    required 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-brand-500/20 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" 
                    placeholder="Jane" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <input 
                    required 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-brand-500/20 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" 
                    placeholder="Doe" 
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label>Email Address</Label>
            <input 
              required 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-brand-500/20 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" 
              placeholder="name@example.com" 
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Password</Label>
              {!isReg && (
                <button type="button" className="text-[10px] font-bold text-brand-500 uppercase tracking-widest hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-5 py-4 bg-slate-50 border border-transparent focus:border-brand-500/20 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" 
              placeholder="••••••••" 
            />
            
            {/* Password Strength Meter */}
            {isReg && password.length > 0 && (
              <div className="flex items-center gap-3 mt-2 px-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      passwordStrength.score >= 5 ? 'bg-green-500 w-full' : 
                      passwordStrength.score >= 3 ? 'bg-yellow-400 w-2/3' : 
                      passwordStrength.score >= 1 ? 'bg-red-400 w-1/3' : 'w-0'
                    }`}
                  />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                  passwordStrength.score >= 5 ? 'text-green-500' : 
                  passwordStrength.score >= 3 ? 'text-yellow-500' : 'text-red-400'
                }`}>
                  {passwordStrength.feedback}
                </span>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <Text variant="small" color="error">{error}</Text>
            </div>
          )}
          
          {/* Submit Button */}
          <Button 
            fullWidth 
            loading={loading} 
            type="submit"
            className="mt-6"
          >
            {isReg ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-8 text-center">
          <Text variant="small" color="muted">
            {isReg ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button 
              onClick={() => { setIsReg(!isReg); setError(''); setPassword(''); }} 
              className="text-brand-500 font-bold hover:underline transition-all"
            >
              {isReg ? 'Sign In' : 'Join Now'}
            </button>
          </Text>
        </div>

        {/* Provider CTA */}
        {!isReg && (
          <div className="mt-6 p-4 bg-brand-50 border border-brand-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-lg">🩺</div>
              <div className="flex-1">
                <Text variant="small" weight="bold" color="primary">Are you a healthcare provider?</Text>
                <Text variant="caption" color="muted">Join our network and grow your practice.</Text>
              </div>
              <button 
                onClick={() => { setIsReg(true); setRole(UserRole.PROVIDER); setError(''); }}
                className="text-brand-600 font-bold text-xs uppercase tracking-widest hover:underline whitespace-nowrap"
              >
                Join →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-20">
         {/* Background Elements */}
         <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
         </div>
         
         <div className="relative z-10 max-w-lg text-center">
            <Card variant="elevated" className="bg-white/10 backdrop-blur-xl border border-white/10 p-12 shadow-2xl">
               <Heading level={2} color="white" className="mb-6">
                 "The most comprehensive tool for modern wellness providers."
               </Heading>
               <Text color="white" className="opacity-80 mb-8">
                 Join 10,000+ clinicians managing their practice with sovereignty and ease.
               </Text>
               
               {/* Trust Indicators */}
               <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/10">
                  <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-600"></div>
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-500"></div>
                     <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-400"></div>
                  </div>
                  <Text variant="small" color="white" className="opacity-60">
                    Trusted by leading practitioners
                  </Text>
               </div>
            </Card>
            
            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-white/40">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               <span className="text-[10px] font-bold uppercase tracking-widest">HIPAA Compliant • SOC 2 Certified</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LoginView;