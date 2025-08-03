# AURAA - Personal AI Stylist Landing Page

## Overview

This project is a React-based landing page for AURAA, a personal AI stylist application. It aims to provide users with an AI-powered platform for fashion and styling, featuring a modern, responsive design with smooth animations and interactive components. The business vision is to offer personalized styling advice, wardrobe management, and outfit recommendations, leveraging AI to enhance the user's fashion experience.

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
- **AI Integration**: Features include AI analysis for body shape and color, wardrobe gap analysis, declutter recommendations, and weather-based outfit suggestions with confidence scoring.

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