import React, { useState, useEffect } from 'react';
import { useAuth, useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { authService, MFAFactor } from '../services/auth';
import { UserRole } from '../types';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardBody } from '../components/ui';

const SecuritySettingsView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Enrollment State
  const [enrollStep, setEnrollStep] = useState<'idle' | 'qr' | 'success'>('idle');
  const [qrCode, setQrCode] = useState('');
  const [newFactorId, setNewFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    setLoading(true);
    try {
      const list = await authService.listMFAFactors();
      setFactors(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startEnrollment = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await authService.enrollMFA();
      setNewFactorId(response.id);
      setQrCode(response.totp.qr_code);
      setEnrollStep('qr');
    } catch (e: any) {
      setError(e.message || 'Failed to start enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    if (verifyCode.length !== 6) return setError('Enter a 6-digit code.');
    setLoading(true);
    try {
      await authService.verifyMFAEnrollment(newFactorId, verifyCode);
      setEnrollStep('success');
      loadFactors();
    } catch (e: any) {
      setError(e.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (factorId: string) => {
    if (!window.confirm("Are you sure you want to disable 2FA? This will reduce your account security.")) return;
    
    setLoading(true);
    try {
      await authService.unenrollMFA(factorId);
      loadFactors();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEnrollStep('idle');
    setVerifyCode('');
    setQrCode('');
    setError('');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Breadcrumb items={[{ label: 'Dashboard', href: '#/dashboard' }, { label: 'Security Settings' }]} />

      <Section spacing="sm">
        <Container size="tight">
          <Heading level={1} className="mb-2">Two-Factor Authentication</Heading>
          <Text color="muted" className="mb-12">Protect your account with an extra layer of security.</Text>

          {user?.role === UserRole.ADMIN && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-8 flex items-start gap-3">
               <div className="text-amber-500 mt-0.5">⚠️</div>
               <div>
                  <Text variant="small" weight="bold" color="warning">Administrator Requirement</Text>
                  <Text variant="caption" color="warning" className="mt-1">
                     As an administrator, you are required to have Two-Factor Authentication enabled to access the dashboard.
                  </Text>
               </div>
            </div>
          )}

          <Card variant="default" className="overflow-hidden">
             
             {/* Enabled Factors List */}
             {factors.length > 0 && enrollStep === 'idle' && (
               <CardBody className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">🛡️</div>
                     <div>
                        <Heading level={3} size="h4">2FA is Enabled</Heading>
                        <Text variant="small" color="muted">Your account is secured with TOTP.</Text>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {factors.map(factor => (
                        <div key={factor.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                           <div>
                              <Text variant="small" weight="bold">Authenticator App</Text>
                              <Text variant="caption" color="muted" className="font-mono mt-1">Added: {new Date(factor.created_at).toLocaleDateString()}</Text>
                           </div>
                           <Button variant="danger" size="sm" onClick={() => handleUnenroll(factor.id)}>Remove</Button>
                        </div>
                     ))}
                  </div>
               </CardBody>
             )}

             {/* Empty State / Start Enrollment */}
             {factors.length === 0 && enrollStep === 'idle' && (
               <CardBody className="p-10 text-center">
                  <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                     🔐
                  </div>
                  <Heading level={3} className="mb-2">Secure Your Practice</Heading>
                  <Text color="muted" className="mb-8 max-w-md mx-auto">
                     Enable 2FA to prevent unauthorized access. You'll need an authenticator app like Google Authenticator or Authy.
                  </Text>
                  <Button variant="brand" onClick={startEnrollment}>Enable 2FA</Button>
               </CardBody>
             )}

             {/* Enrollment Wizard: QR Step */}
             {enrollStep === 'qr' && (
               <CardBody className="p-10">
                  <Heading level={3} className="mb-6 text-center">Scan QR Code</Heading>
                  <div className="flex flex-col items-center">
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                     </div>
                     <Text variant="small" color="muted" className="mb-8 text-center max-w-sm">
                        Open your authenticator app and scan this code. Then enter the 6-digit code below to verify.
                     </Text>
                     
                     <input 
                        type="text" 
                        maxLength={6}
                        className="text-center text-2xl font-bold tracking-[0.5em] w-64 border-b-2 border-slate-200 focus:border-brand-500 outline-none py-2 mb-6 bg-transparent"
                        placeholder="000000"
                        value={verifyCode}
                        onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                     />

                     {error && <Text variant="small" color="error" className="mb-6">{error}</Text>}

                     <div className="flex gap-4 w-full max-w-xs">
                        <Button fullWidth variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button fullWidth variant="brand" onClick={verifyEnrollment} disabled={verifyCode.length !== 6 || loading} loading={loading}>
                           Activate
                        </Button>
                     </div>
                  </div>
               </CardBody>
             )}

             {/* Enrollment Wizard: Success */}
             {enrollStep === 'success' && (
               <CardBody className="p-10 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
                     ✓
                  </div>
                  <Heading level={3} className="mb-2">2FA Activated</Heading>
                  <Text color="muted" className="mb-8">Your account is now more secure.</Text>
                  <Button 
                    variant="primary"
                    onClick={() => {
                       setEnrollStep('idle');
                       if (user?.role === UserRole.ADMIN) navigate('/dashboard');
                    }}
                  >
                     Return to Dashboard
                  </Button>
               </CardBody>
             )}

          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default SecuritySettingsView;