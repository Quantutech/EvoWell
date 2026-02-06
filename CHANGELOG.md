
# Changelog

All notable changes to the EvoWell platform will be documented in this file.

## [0.1.2] - 2024-02-27

### Added
- **Provider Dashboard**: Added "Financials & Packages" tab for managing service bundles and invoices.
- **Provider Dashboard**: Added "Business & Compliance" settings section for Tax ID, NPI, and License management.
- **Components**: Added `ScheduleBuilder` integration into the dashboard for recurring availability management.
- **Data Model**: Added `ServicePackage` and `BusinessInfo` interfaces to `ProviderProfile`.
- **UI**: Added sub-navigation tabs to Dashboard sections for better information hierarchy.

### Changed
- **Provider Dashboard**: Overhauled "Command Center" with advanced KPI cards, Revenue Bar Chart, and Demographics Donut Chart.
- **Clinical Calendar**: Fixed grid layout logic and added toggle between "List View" and "Weekly Grid".
- **Database**: Updated mock seed data to include business addresses and financial history.
- **Bug Fix**: Fixed SVG path errors in `SimpleChart` component.
- **Bug Fix**: Fixed layout shift in Footer and Testimonials carousel.
- **Assets**: Replaced broken/blocked logo URLs in `PointSolutionsReplacement`.

## [0.1.0] - 2024-05-20

### Added
- **Code Quality**: Added ESLint and Prettier configuration.
- **Dependencies**: Integrated `react-router-dom`, `zustand`, `axios`, and `zod`.
- **Structure**: Added `layouts/` and `config/` directories.
- **Documentation**: Added README, CHANGELOG, and Migration Guide.

### Changed
- **Accessibility**: Updated primary brand color from `#39a562` to `#257a46` to pass WCAG AA standards (4.5:1 contrast ratio).
- **Theme**: Synced CSS variables with new accessible palette.
- **Config**: Strict TypeScript configuration enabled.

## [0.0.1] - Initial Release
- Basic directory functionality.
- Provider and Client dashboards.
- Mock database service.
