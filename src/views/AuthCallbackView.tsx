import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';
import { Heading, Text } from '../components/typography';
import { Button, Card, CardBody } from '../components/ui';

/**
 * Handles OAuth callback after user authenticates with Google/Apple
 */
export default function AuthCallbackView() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        logger.debug('Processing OAuth callback...');
        
        // Get the session from the URL hash/query params
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error('Session error', sessionError);
          setStatus('error');
          setErrorMessage(sessionError.message);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login?error=oauth_failed');
          }, 3000);
          return;
        }
        
        if (!session) {
          logger.warn('No session found after OAuth callback');
          setStatus('error');
          setErrorMessage('Authentication failed. No session created.');
          
          setTimeout(() => {
            navigate('/login?error=no_session');
          }, 3000);
          return;
        }
        
        logger.info('OAuth successful', { userId: session.user.id });
        setStatus('success');
        
        // Give the auth state listener in App.tsx time to process
        setTimeout(() => {
          logger.debug('Redirecting to dashboard...');
          navigate('/dashboard');
        }, 1500);
        
      } catch (err) {
        logger.error('Callback handling error', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during authentication.');
        
        setTimeout(() => {
          navigate('/login?error=callback_failed');
        }, 3000);
      }
    };
    
    handleOAuthCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full shadow-xl">
        <CardBody className="p-12 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <Heading level={2} className="mb-2">Completing Authentication</Heading>
              <Text color="muted">Please wait while we log you in...</Text>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Heading level={2} className="mb-2">Authentication Successful!</Heading>
              <Text color="muted">Redirecting to your dashboard...</Text>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <Heading level={2} className="mb-2">Authentication Failed</Heading>
              <Text color="muted" className="mb-6">{errorMessage || 'Something went wrong during login.'}</Text>
              <Button onClick={() => navigate('/login')} variant="brand">Back to Login</Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}