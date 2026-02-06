
# EvoWell Platform

EvoWell is a professional, clinical-grade directory connecting patients with elite mental health specialists through a secure, balanced ecosystem.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build & Deploy

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

The project follows a feature-based architecture for scalability:

```
src/
├── components/      # Reusable UI components (Buttons, Inputs, etc.)
├── views/           # Page views (Home, Dashboard, Search)
├── layouts/         # Layout wrappers (MainLayout, AuthLayout)
├── services/        # API and Logic services (api.ts, db.ts)
├── types/           # TypeScript interfaces and types
├── styles/          # Global styles and theme definitions
├── utils/           # Helper functions (security, formatting)
├── config/          # App constants and configuration
└── App.tsx          # Main entry point and routing logic
```

## 🎨 Branding & Accessibility

- **Font**: Plus Jakarta Sans
- **Primary Color**: `#257a46` (Brand Green) - WCAG AA Compliant
- **Accent Color**: `#0e84ea` (Blue)

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand / React Context
- **Data Fetching**: Axios / TanStack Query
- **Validation**: Zod
- **Forms**: React Hook Form

## 📝 Code Quality

We enforce strict code quality rules:

- **ESLint**: Static code analysis
- **Prettier**: Code formatting
- **TypeScript Strict Mode**: Enabled

Run `npm run lint` to check for issues.
