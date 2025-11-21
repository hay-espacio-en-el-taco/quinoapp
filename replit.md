# NutriPlan - Nutritional Scheduling Application

## Overview

NutriPlan is a comprehensive nutritional scheduling and meal planning application designed to help users manage their daily nutrition through personalized meal plans, AI-powered recipe generation from grocery images, and specialist tracking capabilities. The application serves two primary user roles: regular users who manage their own nutrition plans, and specialists (dietitians/nutritionists) who monitor and guide multiple clients.

The system combines modern web technologies with AI capabilities to provide intelligent meal recommendations, grocery-to-recipe conversion, and compliance tracking for maintaining healthy eating habits.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter is used for client-side routing, providing a lightweight alternative to React Router. The application uses hash-based routing for simplicity in deployment.

**State Management**: TanStack Query (React Query) manages server state, data fetching, caching, and synchronization. No global state management library is used - component-level state with React hooks handles local UI state.

**UI Component System**: Shadcn/ui component library built on Radix UI primitives provides accessible, customizable components. The design follows Material Design 3 principles with a "new-york" style variant configured in components.json.

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables for theming. The application supports light and dark modes through a theme provider context. Custom utility classes (hover-elevate, active-elevate-2) provide consistent interaction feedback.

**Form Handling**: React Hook Form with Zod schema validation through @hookform/resolvers ensures type-safe form validation across the application.

### Backend Architecture

**Runtime**: Node.js with Express.js framework handling HTTP requests and serving the API.

**TypeScript**: Full TypeScript support across the entire stack with path aliases (@/, @shared/, @assets/) configured for clean imports.

**Development vs Production**: Separate entry points (index-dev.ts, index-prod.ts) handle different environments. Development mode integrates Vite middleware for hot module replacement. Production mode serves pre-built static assets.

**API Design**: RESTful API endpoints organized in server/routes.ts. The application uses a functional approach rather than class-based controllers. Key endpoints include:
- `/api/schedule/*` - Meal schedule management
- `/api/meals/*` - Meal database operations
- `/api/grocery/analyze` - AI-powered grocery image analysis
- `/api/recipes` - Recipe library access
- `/api/specialist/*` - Specialist dashboard and client management
- `/api/compliance/*` - Meal adherence tracking

**File Upload**: Multer middleware with memory storage handles grocery image uploads for AI analysis.

**Session Management**: Uses session-based authentication with express-session and connect-pg-simple for PostgreSQL-backed session storage.

### Database Architecture

**ORM**: Drizzle ORM provides type-safe database access with a schema-first approach. The schema is defined in shared/schema.ts and shared between client and server.

**Schema Design**:
- **users**: Stores user accounts with role-based access (user/specialist). Includes self-referential relationship for specialist-client associations.
- **meals**: Pre-defined meal database with nutritional information (calories, protein, carbs, fats) categorized by meal type (breakfast, lunch, dinner, snack).
- **recipes**: AI-generated recipes from grocery scanner with ingredients, instructions, and nutritional data.
- **schedules**: Weekly meal plans assigned to users with start/end dates.
- **scheduleEntries**: Individual meal assignments within schedules, linking specific meals to time slots.
- **complianceLogs**: Tracks user adherence to scheduled meals with completion status and timestamps.

**Relationships**: Drizzle relations define:
- Users → Schedules (one-to-many)
- Users → ComplianceLogs (one-to-many)
- Users → Users (specialist-clients, one-to-many)
- Meals → ScheduleEntries (one-to-many)
- Schedules → ScheduleEntries (one-to-many)

**Migrations**: Drizzle Kit manages schema migrations with PostgreSQL dialect. Migrations are stored in the /migrations directory.

### Data Access Layer

**Storage Interface**: server/storage.ts defines an IStorage interface abstracting database operations. This pattern allows for potential database swapping or mocking in tests.

**Key Operations**:
- User management (create, retrieve by ID/username/email)
- Meal CRUD with filtering by type and calorie range
- Schedule management with active schedule retrieval
- Compliance log tracking with date-range queries
- Recipe storage and retrieval

**Implementation**: Uses Drizzle's query builder with SQL operators (eq, and, gte, lte, desc) for type-safe querying.

### AI Integration

**Provider**: OpenAI API integration through the official SDK.

**Vision Model**: Uses GPT-4 Vision (referenced as "gpt-5" in code comments - this appears to be a placeholder for the latest model) to analyze grocery images and identify ingredients.

**Recipe Generation**: GPT-4 generates structured recipes with:
- Ingredient lists
- Cooking instructions
- Nutritional breakdowns
- Meal type suggestions

**Response Format**: Uses JSON mode for structured, parseable AI responses.

**Error Handling**: Gracefully handles missing API keys by throwing descriptive errors rather than failing silently.

### Design System

**Typography**: Inter/Roboto font families with weight-based hierarchy (600-700 for headlines, 400 for body, 500-600 for metrics).

**Spacing**: Tailwind spacing scale (3, 4, 6, 8, 12, 16) ensures consistent padding and gaps.

**Components**:
- Card-based layouts for meals, recipes, and dashboard widgets
- Modal dialogs for meal replacement flows
- Data tables for specialist client management
- Progress indicators for calorie tracking
- Badge components for status displays

**Responsive Design**: Mobile-first approach with breakpoint-aware layouts (md:, lg: prefixes). Sidebar collapses on mobile devices using the useIsMobile hook.

**Accessibility**: Radix UI primitives ensure ARIA compliance, keyboard navigation, and screen reader support.

## External Dependencies

### Database Service

**PostgreSQL**: Primary data store accessed through Neon serverless driver (@neondatabase/serverless). Connection pooling via pg.Pool manages concurrent connections efficiently.

**Environment Configuration**: Requires DATABASE_URL environment variable for connection string. The application throws descriptive errors if the database is not provisioned.

### AI Service

**OpenAI API**: Requires OPENAI_API_KEY environment variable. Powers:
- Grocery image analysis (vision capabilities)
- Recipe generation (text completion)

**Model Selection**: Configured to use the latest available model for both vision and text generation tasks.

### Third-Party UI Libraries

**Radix UI**: Unstyled, accessible component primitives (@radix-ui/react-*) provide the foundation for all interactive UI elements.

**Lucide React**: Icon library used consistently across the application for visual indicators and navigation.

**date-fns**: Date manipulation and formatting library for schedule management and compliance tracking.

**React Day Picker**: Calendar component integrated into the schedule view for date selection.

### Build Tools and Development

**Vite**: Development server and build tool with hot module replacement and optimized production builds.

**TypeScript**: Type checking without emission (noEmit: true) - Vite handles transpilation.

**ESBuild**: Bundles the server-side code for production deployment.

**PostCSS**: Processes Tailwind CSS with autoprefixer for browser compatibility.

### Development Environment

**Replit Integration**: Conditional plugins (@replit/vite-plugin-*) provide runtime error overlays, cartographer mapping, and dev banners when running in Replit environment (detected via REPL_ID).

**WebSocket Support**: ws library provides WebSocket constructor for Neon's serverless driver in Node.js environments.