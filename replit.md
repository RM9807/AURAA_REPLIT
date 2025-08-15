# AURAA - Personal AI Stylist Landing Page

## Overview

This project is a React-based full-stack application for AURAA, a personal AI stylist platform. It provides users with comprehensive AI-powered fashion tools including style analysis, digital wardrobe management, and intelligent outfit generation. The platform leverages OpenAI to deliver personalized styling advice, automated outfit suggestions based on wardrobe inventory and Style DNA analysis, and culturally-aware fashion recommendations. The application features modern, responsive design with smooth animations and interactive components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables
- **Component Library**: Radix UI primitives and shadcn/ui
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state
- **Build Tool**: Vite

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API Style**: RESTful API with `/api` prefix
- **Development**: Hot module replacement with Vite integration

### Key Components
- **Frontend UI**: Comprehensive landing page sections (Hero, Features, How It Works, Before/After, Stats, FAQ, Final CTA, Footer) and accessible UI components. Custom hooks for parallax, scroll reveal, and counter animations.
- **Backend Services**: Abstracted storage layer, centralized route management with full CRUD API endpoints, middleware for logging, parsing, and error handling.
- **Database Schema**: Extensive schema designed to support user profiles, outfits, wardrobe items, photo uploads, user settings, style sessions, outfit collections, wishlists, user activities, style insights, AI recommendations, and analytics. Features include robust relations and Zod schemas for validation.
- **Data Flow**: Frontend initiates API calls, Express routes process requests with Zod validation, Drizzle ORM interacts with PostgreSQL, and type-safe JSON responses are returned. React Query manages client-side state, caching, and synchronization.

### UI/UX Decisions
The design emphasizes a modern, clean aesthetic with smooth animations and interactive elements. It integrates accessible components and ensures a responsive layout for various devices. The user onboarding flow is designed to be intuitive and guided, utilizing a multi-step quiz and clear progress indicators.

### Technical Implementations
- **Full-stack Hot Reloading**: Vite integration ensures a smooth development experience with synchronized frontend and backend changes.
- **Type Safety**: Comprehensive TypeScript usage across both frontend and backend, including Zod for API validation and Drizzle ORM for database interactions.
- **Modular Design**: Clear separation of concerns with abstracted storage layers and centralized route management.
- **Authentication**: Username/password authentication with secure bcrypt password hashing, session management, and route protection.
- **Enhanced AI Integration**: Advanced AI analysis with professional-grade prompts including:
  - **Expert Style Analysis**: 15+ years stylist expertise simulation with color science, body geometry, and fashion psychology
  - **Precision Color Analysis**: 12-season color system with undertone science and hex-code recommendations
  - **Scientific Body Analysis**: Mathematical proportional analysis with fabric and fit specifications
  - **Goal-Oriented Recommendations**: Psychology-based advice prioritizing goal achievement over preferences
  - **Strategic Wardrobe Planning**: Gap analysis, cost-per-wear optimization, and outfit multiplication strategies
  - **Professional Photo Analysis**: Advanced color analysis from facial photos with confidence scoring
  - **Intelligent Outfit Generation**: AI-powered outfit suggestions using OpenAI API, analyzing wardrobe inventory and Style DNA to create personalized outfit combinations for specific occasions, weather conditions, and user preferences

## External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL driver.
- **@tanstack/react-query**: For server state management and data fetching.
- **drizzle-orm & drizzle-zod**: For type-safe ORM and validation.
- **@radix-ui/***: For accessible UI component primitives.
- **tailwindcss**: For utility-first CSS styling.
- **wouter**: For lightweight client-side routing in React.
- **vite**: Primary build tool and development server.
- **tsx**: For TypeScript execution in Node.js.
- **esbuild**: For fast JavaScript bundling in production.