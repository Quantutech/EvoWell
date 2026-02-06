import React, { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { User, ProviderProfile, AuthContextType, UserRole, Specialty } from './types';
import { api } from './services/api';
import { authService } from './services/auth';
import { supabase, isConfigured } from './services/supabase'; 
import { persistence } from './services/persistence';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { QueryProvider } from './providers/QueryProvider'; 
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useIdleTimer } from './hooks/useIdleTimer';
import { logger } from './utils/logger';

import Footer from './components/Footer';
import IdleWarningModal from './components/IdleWarningModal';
import PublicLayout from './layouts/PublicLayout';

// Lazy Load Views
const HomeView = lazy(() => import('./views/HomeView'));
const SearchView = lazy(() => import('./views/SearchView'));
const DirectoryView = lazy(() => import('./views/DirectoryView'));
const ProviderProfileEditView = lazy(() => import('./views/ProviderProfileEditView'));
const ProviderOnboardingView = lazy(() => import('./views/ProviderOnboardingView'));
const AdminDashboard = lazy(() => import('./views/AdminDashboard'));
import ClientLayout from './layouts/ClientLayout';
import ProviderLayout from './layouts/ProviderLayout';
import ClientHome from './views/client/ClientHome';
import ClientSessions from './views/client/ClientSessions';
import ClientSettings from './views/client/ClientSettings';
import DocumentCenter from './views/client/DocumentCenter';
import ClientSupportTab from './components/dashboard/tabs/client/ClientSupportTab';
import RoleGuard from './components/RoleGuard';
const LoginView = lazy(() => import('./views/LoginView'));
const AuthCallbackView = lazy(() => import('./views/AuthCallbackView'));
const ProviderProfileView = lazy(() => import('./views/ProviderProfileView'));
const DocumentationView = lazy(() => import('./views/DocumentationView'));
const AboutView = lazy(() => import('./views/AboutView'));
const PartnersHubView = lazy(() => import('./views/PartnersHubView'));
const BenefitsView = lazy(() => import('./views/BenefitsView'));
const BlogListView = lazy(() => import('./views/BlogListView'));
const BlogDetailsView = lazy(() => import('./views/BlogDetailsView'));
const PodcastsView = lazy(() => import('./views/PodcastsView'));
const SupportView = lazy(() => import('./views/SupportView'));
const LegalView = lazy(() => import('./views/LegalView'));
const CareersView = lazy(() => import('./views/CareersView'));
const JobDetailView = lazy(() => import('./views/JobDetailView'));
const PricingCalculatorView = lazy(() => import('./views/PricingCalculatorView'));
const InvestorsView = lazy(() => import('./views/InvestorsView'));
const NotificationsView = lazy(() => import('./views/NotificationsView'));
const SecuritySettingsView = lazy(() => import('./views/SecuritySettingsView'));

// Navigation Context for controlled routing
interface NavigationContextType {
  currentPath: string;
  navigate: (path: string) => void;
}
const NavigationContext = createContext<NavigationContextType | null>(null);
export const useNavigation = () => useContext(NavigationContext)!;

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

// --- Helper Components for Routing ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const SearchViewWrapper: React.FC<{ specialties: Specialty[] }> = ({ specialties }) => {
  const [searchParams] = useSearchParams();
  return <SearchView specialties={specialties} initialParams={searchParams} />;
};

const LoginViewWrapper: React.FC<{ login: (email: string, password?: string) => Promise<void> }> = ({ login }) => {
  const [searchParams] = useSearchParams();
  return <LoginView login={login} initialParams={searchParams} />;
};

// DashboardGuard removed in favor of RoleGuard and Layouts

// ============================================================
// CHANGE 2: Updated OnboardingGuard component
// ============================================================

const OnboardingGuard: React.FC<{ user: User | null; provider: ProviderProfile | null }> = ({ user, provider }) => {
  const { navigate } = useNavigation();
  
  // Must be logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Only providers can access onboarding
  if (user.role !== UserRole.PROVIDER) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If provider has already completed onboarding, redirect to dashboard
  if (provider && provider.onboardingComplete) {
    logger.info('Provider already completed onboarding, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show onboarding view
  return <ProviderOnboardingView />;
};

const ProfileEditGuard: React.FC<{ user: User | null }> = ({ user }) => {
  if (user?.role === UserRole.PROVIDER) return <ProviderProfileEditView />;
  return <Navigate to="/" replace />;
};

const LoadingSpinner = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
  </div>
);

// --- Network Banner ---
const OfflineBanner = () => {
  const isOnline = useNetworkStatus();
  if (isOnline) return null;
  return (
    <div className="bg-amber-500 text-white text-center py-2 text-xs font-bold uppercase tracking-widest sticky top-0 z-[100]">
      You are currently offline. Changes may not save.
    </div>
  );
};

// --- Main App Inner ---

const AppInner: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  
  const { addToast } = useToast();
  const navigateRR = useNavigate();
  const location = useLocation();

  // Legacy compatibility: construct full hash path for components checking `currentPath`
  const currentPath = `#${location.pathname}${location.search}`;

  const navigate = (path: string) => {
    // Shim to handle legacy '#/path' calls
    const target = path.startsWith('#') ? path.substring(1) : path;
    navigateRR(target);
  };

  // Secure Initialization
  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    const init = async () => {
      try {
        // Robust fetch with fallbacks (handled in api.ts via isConfigured check)
        const specs = await api.getAllSpecialties();
        setSpecialties(specs);

        // 1. Check for Active Session & Configure Listener
        if (isConfigured) {
            // Initial Check
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData.session?.user) {
              setToken(sessionData.session.access_token);
              
              // Fetch User Profile using Secure ID (RLS restricted)
              const profile = await api.getUserById(sessionData.session.user.id);
              
              if (profile) {
                setUser(profile);
                
                // If Provider, fetch Provider Profile
                if (profile.role === UserRole.PROVIDER) {
                  const provProfile = await api.getProviderByUserId(profile.id);
                  setProvider(provProfile || null);
                }
              }
            }

            // Realtime Auth Listener (Critical for Session Persistence)
            const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
                logger.info('Auth Event', { event });
                
                if (session?.user) {
                    setToken(session.access_token);
                    
                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        try {
                            const profile = await api.getUserById(session.user.id);
                            if (profile) {
                                setUser(profile);
                                if (profile.role === UserRole.PROVIDER) {
                                    const prov = await api.getProviderByUserId(profile.id);
                                    setProvider(prov || null);
                                }
                            }
                        } catch (e) {
                            logger.error("Failed to refresh user profile", e);
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProvider(null);
                    setToken(null);
                }
            });
            authListener = data;
        } else {
          // --- MOCK MODE PERSISTENCE RESTORATION ---
          const { token, userId } = persistence.getSession();
          if (token && userId) {
            setToken(token);
            try {
              const profile = await api.getUserById(userId);
              if (profile) {
                setUser(profile);
                if (profile.role === UserRole.PROVIDER) {
                  const provProfile = await api.getProviderByUserId(profile.id);
                  setProvider(provProfile || null);
                }
              }
            } catch (e) {
              console.error("Failed to restore mock session", e);
              persistence.clearSession(); // Clear invalid session
            }
          }
        }
      } catch (err) {
        logger.error("Auth init failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    return () => {
        if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // Theme Management
  useEffect(() => {
    if (user) {
      let theme = 'client';
      if (user.role === UserRole.PROVIDER) theme = 'provider';
      if (user.role === UserRole.ADMIN) theme = 'admin';
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user]);

  const login = async (email: string, password?: string) => {
    try {
      const result = await api.login(email, password);
      if (result) {
        setUser(result.user);
        setProvider(result.provider || null);
        setToken(result.token);
        
        // LoginView handles MFA logic.
        addToast('success', `Welcome back, ${result.user.firstName}!`);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (e: any) {
      addToast('error', e.message || "Login failed");
      throw e;
    }
  };

  const logout = () => {
    api.logout().then(() => {
      setUser(null); 
      setProvider(null); 
      setToken(null);
      // Clear all local storage as per security requirement (except critical flags if needed)
      // Note: This clears the idle timer's cross-tab sync key too
      localStorage.clear();
      addToast('info', 'Logged out successfully');
      navigate('/');
    });
  };

  // --- HIPAA Auto-Logout Implementation ---
  const idleTimeoutMinutes = Number((import.meta as any).env.VITE_IDLE_TIMEOUT_MINUTES) || 15;
  const timeoutMs = idleTimeoutMinutes * 60 * 1000;
  const warningMs = 2 * 60 * 1000; // Warning at 2 minutes remaining

  const { isIdle, remaining, reset, pause, resume } = useIdleTimer({
    timeout: timeoutMs,
    onIdle: () => {
      // Only logout if we actually have a user to prevent loops
      if (user) {
        logger.info('User timed out due to inactivity');
        logout();
        addToast('warning', 'You have been logged out due to inactivity.');
      }
    },
    events: ['mousemove', 'keydown', 'wheel', 'touchstart', 'click', 'scroll']
  });

  // Manage Timer State based on Auth
  useEffect(() => {
    if (!user) {
      pause();
    } else {
      resume();
    }
  }, [user, pause, resume]);

  // Determine if warning modal should show
  // Show if logged in, NOT fully idle yet, but remaining time is less than warning threshold
  const showIdleWarning = user && !isIdle && remaining <= (warningMs / 1000) && remaining > 0;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-pulse text-slate-500 font-medium tracking-widest uppercase text-xs">Portal Connection Established...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryProvider>
        <NavigationContext.Provider value={{ currentPath, navigate }}>
          <AuthContext.Provider value={{ user, provider, token, login, logout, isLoading }}>
            <div className="min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white">
              <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                Skip to main content
              </a>
              
              <OfflineBanner />
              <ScrollToTop />
              
              {showIdleWarning && (
                <IdleWarningModal 
                  remaining={remaining} 
                  onStayLoggedIn={reset} 
                />
              )}
              
              <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Site Layout */}
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<HomeView specialties={specialties} />} />
                      <Route path="/search" element={<SearchViewWrapper specialties={specialties} />} />
                      <Route path="/directory" element={<DirectoryView />} />
                      
                      <Route path="/docs" element={<DocumentationView />} />
                      <Route path="/about" element={<AboutView />} />
                      <Route path="/partners" element={<PartnersHubView />} />
                      <Route path="/benefits" element={<BenefitsView />} />
                      <Route path="/calculator" element={<PricingCalculatorView />} />
                      
                      <Route path="/blog" element={<BlogListView />} />
                      <Route path="/blog/:slug" element={<WrapperBlogDetails />} />
                      
                      <Route path="/podcasts" element={<PodcastsView />} />
                      <Route path="/careers" element={<CareersView />} />
                      <Route path="/careers/:jobId" element={<WrapperJobDetails />} />
                      
                      <Route path="/contact" element={<SupportView type="contact" />} />
                      <Route path="/faq" element={<SupportView type="faq" />} />
                      <Route path="/help" element={<SupportView type="help" />} />
                      <Route path="/investors" element={<InvestorsView />} />
                      <Route path="/terms" element={<LegalView type="terms" />} />
                      <Route path="/privacy" element={<LegalView type="privacy" />} />
                      
                      <Route path="/provider/:providerId" element={<WrapperProviderProfile />} />
                    </Route>

                    {/* Auth - Standalone */}
                    <Route path="/login" element={<LoginViewWrapper login={login} />} />
                    <Route path="/auth/callback" element={<AuthCallbackView />} />

                    {/* App Routes - Protected */}
                    <Route 
                      path="/console/*" 
                      element={
                        <RoleGuard allowedRole={UserRole.PROVIDER} redirectPath="/portal">
                          <ProviderLayout />
                        </RoleGuard>
                      } 
                    />

                    <Route 
                      path="/portal" 
                      element={
                        <RoleGuard allowedRole={UserRole.CLIENT} redirectPath="/console">
                          <ClientLayout />
                        </RoleGuard>
                      }
                    >
                      <Route index element={<Navigate to="home" replace />} />
                      <Route path="home" element={<ClientHome />} />
                      <Route path="sessions" element={<ClientSessions />} />
                      <Route path="documents" element={<DocumentCenter />} />
                      <Route path="search" element={<Navigate to="/search" />} />
                      <Route path="settings" element={<ClientSettings />} />
                      <Route path="support" element={user ? <ClientSupportTab user={user} /> : <Navigate to="/login" />} />
                    </Route>

                    <Route 
                      path="/admin/*" 
                      element={
                        <RoleGuard allowedRole={UserRole.ADMIN} redirectPath="/">
                          <AdminDashboard />
                        </RoleGuard>
                      } 
                    />

                    {/* Other Protected - No Layout? Or should be in a layout? */}
                    {/* Onboarding should probably have minimal layout or public. */}
                    <Route path="/onboarding" element={<OnboardingGuard user={user} provider={provider} />} />
                    <Route path="/dashboard/profile-edit" element={<ProfileEditGuard user={user} />} />
                    <Route path="/notifications" element={<NotificationsView />} />
                    <Route path="/settings/security" element={<SecuritySettingsView />} />
                    
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </AuthContext.Provider>
        </NavigationContext.Provider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

// --- Route Parameter Wrappers ---
const WrapperBlogDetails = () => {
  const params = useLocation().pathname.split('/').pop() || '';
  return <BlogDetailsView slug={params} />;
};

const WrapperJobDetails = () => {
  const params = useLocation().pathname.split('/').pop() || '';
  return <JobDetailView jobId={params} />;
};

const WrapperProviderProfile = () => {
  const params = useLocation().pathname.split('/').pop() || '';
  return <ProviderProfileView providerId={params} />;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <AppInner />
      </HashRouter>
    </ToastProvider>
  );
};

export default App;