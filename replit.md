# AURAA - Personal AI Stylist Landing Page

## Overview

This is a React-based landing page for AURAA, a personal AI stylist application. The project features a modern, responsive design with smooth animations, parallax effects, and interactive components showcasing the AI-powered fashion and styling platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Component Library**: Radix UI primitives with shadcn/ui component system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful API with `/api` prefix
- **Development**: Hot module replacement with Vite integration

## Key Components

### Frontend Components
- **Landing Page Sections**: Hero, Features, How It Works, Before/After, Stats, FAQ, Final CTA, Footer
- **UI Components**: Comprehensive set of accessible components from shadcn/ui
- **Custom Hooks**: Parallax effects, scroll reveal animations, counter animations, mobile detection
- **Navigation**: Smooth scrolling navigation with blur effects on scroll

### Backend Components
- **Storage Interface**: Abstracted storage layer with PostgreSQL database implementation
- **Route Registration**: Centralized route management system with full CRUD API endpoints
- **Middleware**: Request logging, JSON parsing, error handling
- **Development Tools**: Custom Vite integration for SSR-like development experience
- **Database Connection**: Neon serverless PostgreSQL with Drizzle ORM

### Database Schema
- **Users Table**: Enhanced user structure with email, name fields, and timestamps
- **User Profiles Table**: Style preferences, body measurements, budget, and lifestyle data
- **Outfits Table**: Saved outfit combinations with occasion and season metadata
- **Wardrobe Table**: Individual clothing items with categorization and purchase tracking
- **Relations**: Proper foreign key relationships between all entities
- **Validation**: Zod schemas for type-safe data validation and API request parsing
- **Migrations**: Drizzle-kit for database schema management

## Data Flow

1. **Client Requests**: Frontend makes API calls to `/api` endpoints
2. **Route Handling**: Express routes process requests with Zod validation
3. **Database Operations**: Drizzle ORM queries PostgreSQL via storage interface
4. **Response**: Type-safe JSON responses sent back to client
5. **State Management**: React Query manages server state, caching, and synchronization

## API Endpoints

### User Management
- `POST /api/users` - Create new user account
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/profile` - Get user style profile
- `POST /api/users/:id/profile` - Create user style profile
- `PATCH /api/users/:id/profile` - Update user style profile

### Outfit Management
- `GET /api/users/:id/outfits` - Get user's saved outfits
- `POST /api/users/:id/outfits` - Create new outfit
- `GET /api/outfits/:id` - Get specific outfit

### Wardrobe Management
- `GET /api/users/:id/wardrobe` - Get user's wardrobe items
- `POST /api/users/:id/wardrobe` - Add new wardrobe item
- `GET /api/wardrobe/:id` - Get specific wardrobe item

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **@tanstack/react-query**: Server state management
- **drizzle-orm & drizzle-zod**: Type-safe ORM and validation
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight router for React

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **API Server**: Express server running alongside Vite
- **Database**: Environment-based DATABASE_URL configuration
- **Hot Reload**: Full-stack hot reloading with Vite middleware

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database**: Production PostgreSQL connection via DATABASE_URL

### Environment Configuration
- **DATABASE_URL**: Required environment variable for database connection
- **NODE_ENV**: Environment detection for development/production modes
- **Build Scripts**: Separate build and start commands for deployment

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns, while maintaining a smooth development experience through integrated tooling.

## Recent Changes: Latest modifications with dates

### July 14, 2025 - Database Integration Completed
- Full PostgreSQL database integration with all CRUD operations
- Complete API endpoints for users, profiles, outfits, and wardrobe items
- Database schema synchronized and tested with real data
- All storage operations moved from in-memory to PostgreSQL
- Comprehensive testing of all endpoints (POST, GET, PATCH operations)
- Sample data successfully created and retrieved from database
- AURAA logo integration in hero section and footer
- Updated CTA buttons to "Get Stylish Now"
- Custom wardrobe and outfit images integrated into landing page sections

### July 14, 2025 - Advanced Features Implementation
- **Enhanced Wardrobe Tracking**: Added wear count, last worn date, and favorite marking
- **AI Style Recommendations**: Complete recommendation system with confidence scoring
- **User Analytics**: Style scores, favorite colors, most worn categories, usage statistics
- **Comprehensive Dashboard**: Full-featured user dashboard with tabs for all features
- **Advanced API Endpoints**: PATCH operations for updates, analytics tracking, recommendations
- **Database Schema Extensions**: Style recommendations table, user analytics table
- **Real-time Data Testing**: All features tested with actual database operations
- **Navigation Enhancement**: Added dashboard route and navigation buttons

### July 14, 2025 - User Authentication Implementation
- **Multi-Provider Authentication**: Google, Facebook, and mobile OTP login options
- **Custom Auth Modal**: Beautiful modal with social login and phone verification
- **Development Mode**: Simple demo authentication for development environment
- **Production Ready**: Full Replit Auth integration for production deployment
- **Session Management**: Secure session handling with PostgreSQL storage
- **Route Protection**: Authentication middleware protecting sensitive endpoints
- **User Flow**: Seamless login/logout flow with proper redirects
- **Responsive Design**: Mobile-friendly authentication interface

### July 14, 2025 - Personal Style Onboarding & Profile Refresh System
- **Complete Personal Style Flow**: Created comprehensive 5-step onboarding for new users
- **Multi-step Quiz System**: Detailed style questionnaire with daily activity, comfort, occasions, inspirations
- **Color Preferences Assessment**: Advanced color selection and avoidance preferences
- **Photo Upload for AI Analysis**: Face photo for color analysis, body photos for fit analysis
- **Style Goals Definition**: User goal setting for career, lifestyle, or personal style changes
- **Profile Diagnosis Dashboard**: Existing users see profile freshness analysis and completion scores
- **Refresh vs Continue Options**: Smart recommendations for when to refresh profile (90+ days old)
- **Seamless Navigation**: Personal Style route integrated into authentication flow
- **Progress Tracking**: Step-by-step progress with validation and completion requirements
- **AI Processing Simulation**: Realistic processing experience with loading states and animations

### July 14, 2025 - Landing Page Content Display Fixed
- **CSS Import Order**: Fixed Google Fonts import order to resolve CSS warnings
- **Scroll Animations**: Added proper parallax and scroll reveal effects to landing page
- **Logo Integration**: Added beautiful AURAA circular logo with clothing hanger design above hero text
- **Navigation Updates**: Fixed authentication button connections and styling
- **Component Verification**: Ensured all landing page sections load and display properly
- **Animation Consistency**: Applied smooth hover effects and gradient animations throughout

### July 14, 2025 - Wardrobe Digitization System Fully Operational
- **Complete Implementation**: Successfully deployed comprehensive wardrobe digitization system
- **Three-Tab Interface**: Upload Items, My Inventory, and AI Analysis tabs working perfectly
- **Photo Upload System**: Full file upload capability for wardrobe item photos
- **Detailed Item Cataloging**: Complete form with name, category, color, pattern, material, brand, season, notes
- **Digital Inventory Display**: Visual grid showing all wardrobe items with wear tracking and favorites
- **AI Analysis Engine**: Declutter recommendations categorizing items as Keep/Alter/Donate with explanations
- **Wardrobe Gap Analysis**: Identifies missing core items and over-represented categories
- **Database Integration**: Extended wardrobe schema with material, pattern, AI analysis fields
- **Tab Navigation Fix**: Resolved dashboard tab routing to display wardrobe section properly
- **Real-time Updates**: Live item addition with immediate inventory refresh
- **User Testing Confirmed**: System verified working as expected with actual item uploads

### July 14, 2025 - Feature Cleanup and Outfit AI Implementation
- **Removed Unwanted Features**: Successfully removed style mood boards, AR wardrobe organization, one-click outfit matching, and personalized color palette features as requested
- **Outfit Combination AI Completed**: Fully implemented weather-based outfit recommendation system
- **Event-Specific Styling**: Added support for business, casual, date, workout, formal, travel, and party occasions
- **Weather Integration**: Comprehensive weather parameter configuration (temperature, humidity, wind speed, precipitation)
- **AI Confidence Scoring**: Detailed reasoning and confidence scores for outfit suggestions
- **Interactive Interface**: Three-tab system for generating, viewing suggestions, and configuring weather
- **Accept/Reject Functionality**: Users can accept outfit suggestions and track preferences
- **Database Schema Updated**: Added weather parameters to outfit suggestions table
- **Code Cleanup**: Removed all references to deleted features from routes, storage, and schema
- **Streamlined Dashboard**: Focus on core features - wardrobe digitization and outfit combination AI