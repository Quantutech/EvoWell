/**
 * EvoWell Design System Configuration
 * Single source of truth for all design tokens.
 */

// ============================================
// SPACING SCALE (8px base)
// ============================================
export const spacing = {
  section: {
    sm: 'py-12 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-20 md:py-32',
  },
  hero: {
    top: 'pt-20 md:pt-24 lg:pt-28',
    bottom: 'pb-20 md:pb-32',
  },
  container: {
    padding: 'px-6 lg:px-8',
  }
} as const;

// ============================================
// CONTAINER WIDTHS
// ============================================
export const containers = {
  full: 'max-w-[1440px]',    // Hero sections, full-bleed
  content: 'max-w-[1440px]', // Adjusted to match Navbar width
  narrow: 'max-w-4xl',        // Legal, blog post (896px)
  tight: 'max-w-2xl',         // Forms, modals (672px)
} as const;

// ============================================
// TYPOGRAPHY CLASSES
// ============================================
export const typography = {
  // Display & Headlines
  display: 'text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]',
  h1: 'text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight',
  h2: 'text-2xl md:text-3xl lg:text-4xl font-black tracking-tight',
  h3: 'text-xl md:text-2xl font-black tracking-tight',
  h4: 'text-lg md:text-xl font-bold',
  
  // Body Text
  lead: 'text-lg md:text-xl font-medium leading-relaxed',
  body: 'text-base font-medium leading-relaxed',
  small: 'text-sm font-medium',
  
  // Labels & UI Text
  label: 'text-xs font-bold uppercase tracking-widest',
  overline: 'text-xs font-black uppercase tracking-widest',
  badge: 'text-[11px] font-bold uppercase tracking-wider',
  caption: 'text-sm font-medium',
} as const;

// ============================================
// COLOR SEMANTIC TOKENS
// ============================================
export const colors = {
  // Backgrounds
  bgPage: 'bg-slate-50',
  bgCard: 'bg-white',
  bgMuted: 'bg-slate-100',
  bgElevated: 'bg-white',
  
  // Text
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-600',
  textMuted: 'text-slate-500',
  textDisabled: 'text-slate-400',
  
  // Brand
  brandPrimary: 'text-brand-500',
  brandLight: 'text-brand-400',
  brandDark: 'text-brand-600',
  
  // Borders
  borderLight: 'border-slate-100',
  borderDefault: 'border-slate-200',
  borderStrong: 'border-slate-300',
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
  sm: 'rounded-lg',       // 8px - badges, small elements
  md: 'rounded-xl',       // 12px - buttons, inputs
  lg: 'rounded-2xl',      // 16px - small cards
  xl: 'rounded-3xl',      // 24px - large cards
  full: 'rounded-full',   // pills, avatars
} as const;

// ============================================
// SHADOWS
// ============================================
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  card: 'shadow-xl shadow-slate-200/50',
  button: 'shadow-lg shadow-slate-900/10',
  brandButton: 'shadow-lg shadow-brand-500/20',
} as const;

// ============================================
// COMPONENT PRESETS
// ============================================
export const components = {
  // Buttons
  buttonPrimary: 'bg-slate-900 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
  buttonSecondary: 'bg-white text-slate-700 px-6 py-4 md:px-8 md:py-4 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
  buttonBrand: 'bg-brand-500 text-white px-6 py-4 md:px-8 md:py-4 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
  buttonGhost: 'text-slate-600 px-5 py-4 md:px-6 md:py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400',
  
  // Cards
  card: 'bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50',
  cardHover: 'bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300',
  
  // Inputs
  input: 'w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all',
  
  // Badges
  badge: 'inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider',
  badgeBrand: 'bg-brand-50 text-brand-600 border border-brand-100',
  badgeNeutral: 'bg-slate-100 text-slate-600',
  
  // Section wrapper
  section: 'py-24',
  sectionAlt: 'py-24 bg-white border-y border-slate-100',
} as const;

export const designSystem = {
  spacing,
  containers,
  typography,
  colors,
  radius,
  shadows,
  components
};