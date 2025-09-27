# Setshaba Connect - Backend API Context

## Overview
The Setshaba Connect Backend is a comprehensive Node.js/Express.js API server that powers the municipal issue reporting system. It provides authentication, report management, analytics, and administrative features for both citizens and municipal officials.

## Folder Structure

```
setshaba-connect-backend-main/
├── .env.test                      # Test environment variables
├── README.md                      # Comprehensive API documentation
├── config/                        # Configuration files
│   ├── database.js               # Supabase client configuration
│   └── swagger.js                # API documentation setup
├── jest.config.js                # Jest testing configuration
├── middleware/                   # Express middleware
│   ├── auth.js                   # Authentication and authorization
│   └── validation.js             # Request validation schemas
├── migrations/                   # Database migrations (Supabase)
│   └── 20250925153551_humble_spring.sql  # Ward optimization migration
├── package.json                  # Dependencies and scripts
├── routes/                       # API route handlers
│   ├── analytics.js              # Analytics and reporting endpoints
│   ├── auth.js                   # Authentication endpoints
│   ├── municipalities.js         # Municipality management
│   ├── reports.js                # Report CRUD operations
│   ├── status-updates.js         # Report status management
│   ├── users.js                  # User profile management
│   └── wards.js                  # Ward and GeoJSON management
├── server.js                     # Main server entry point
├── supabase/migrations/          # Supabase database migrations
│   ├── 20250924091116_dusty_wave.sql      # Municipalities table
│   ├── 20250924091124_wild_flower.sql     # Users table and enums
│   ├── 20250924091144_late_spring.sql     # Reports table and enums
│   ├── 20250924091211_old_brook.sql       # Report upvotes table
│   ├── 20250924134303_curly_harbor.sql    # Status updates enhancements
│   └── 20250926124204_crimson_flower.sql  # Accountability features
├── tests/                        # Test suites
│   ├── auth.test.js              # Authentication endpoint tests
│   ├── municipalities.test.js    # Municipality endpoint tests
│   ├── reports.test.js           # Report endpoint tests
│   ├── setup.js                  # Test configuration
│   └── users.test.js             # User endpoint tests
└── utils/                        # Utility functions
    └── helpers.js                # Common helper functions
```

## File Contents Summaries

### Core Server Files

**server.js**
- Main Express.js application entry point
- Configures middleware (CORS, Helmet, rate limiting)
- Sets up API routes and error handling
- Includes Swagger documentation endpoint
- Health check endpoint for monitoring

**package.json**
- Project dependencies and metadata
- Scripts for development, testing, and production
- Key dependencies: Express, Supabase, JWT, Joi validation

### Configuration

**config/database.js**
- Supabase client initialization with service role key
- Separate client for user operations with RLS
- Environment variable validation

**config/swagger.js**
- OpenAPI 3.0 specification setup
- API documentation configuration
- Schema definitions for all data models
- Security scheme definitions

**jest.config.js**
- Jest testing framework configuration
- ES modules support
- Coverage reporting setup
- Test file patterns and setup

### Middleware

**middleware/auth.js**
- JWT token authentication middleware
- Role-based authorization (citizen/official)
- User session validation with Supabase
- Token refresh handling

**middleware/validation.js**
- Joi schema validation middleware
- Request body validation schemas
- Common validation patterns for all endpoints

### Database Migrations

**Supabase Migrations:**
1. **dusty_wave.sql**: Creates municipalities table with GeoJSON boundaries
2. **wild_flower.sql**: Creates users table with role-based access
3. **late_spring.sql**: Creates reports table with categories and status
4. **old_brook.sql**: Creates upvotes system with triggers
5. **curly_harbor.sql**: Enhances status updates with official tracking
6. **crimson_flower.sql**: Adds accountability and analytics features

### API Routes

**routes/auth.js**
- User registration and login endpoints
- Password reset functionality
- Supabase Auth integration
- JWT token management

**routes/users.js**
- User profile management
- Profile updates and retrieval
- Role-based access control

**routes/reports.js**
- Complete CRUD operations for reports
- Filtering, searching, and pagination
- Upvoting system
- Municipality-based access control

**routes/municipalities.js**
- Municipality data management
- GeoJSON boundary serving
- Report aggregation by municipality

**routes/wards.js**
- Ward boundary management
- GeoJSON import from GitHub
- Simplified boundaries for map rendering
- Ward-based analytics

**routes/status-updates.js**
- Report status update management
- Official accountability tracking
- Status change history

**routes/analytics.js**
- Comprehensive analytics dashboard
- Time-series data for charts
- AI-ready data exports
- Municipality-specific insights

### Testing

**tests/setup.js**
- Global test configuration
- Test environment setup
- Helper functions for test data creation

**Test Suites:**
- `auth.test.js`: Authentication flow testing
- `reports.test.js`: Report management testing
- `users.test.js`: User profile testing
- `municipalities.test.js`: Municipality data testing

### Utilities

**utils/helpers.js**
- Common utility functions
- Error and success response formatting
- Distance calculations
- Municipality detection from coordinates

## Dependencies

### Core Dependencies
- **express**: Web application framework
- **@supabase/supabase-js**: Database and authentication
- **jsonwebtoken**: JWT token handling
- **joi**: Request validation
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management

### Development Dependencies
- **jest**: Testing framework
- **supertest**: HTTP testing
- **nodemon**: Development server
- **swagger-jsdoc**: API documentation
- **swagger-ui-express**: Documentation UI

## Backend Architecture

### Database Schema

**Users Table**
```sql
- id (uuid, primary key, references auth.users)
- name (text)
- email (text, unique)
- role (enum: 'citizen', 'official')
- municipality_id (uuid, references municipalities)
- home_address (text)
- lat, lng (coordinates)
- profile_photo_url, job_title, department (officials)
```

**Reports Table**
```sql
- id (uuid, primary key)
- title, description (text)
- category (enum: water, electricity, roads, waste, safety, other)
- status (enum: pending, acknowledged, in_progress, resolved)
- lat, lng (coordinates)
- address (text)
- municipality_id (references municipalities)
- created_by (references users)
- assigned_official (references users)
- photo_url (text)
- upvotes (integer)
```

**Municipalities Table**
```sql
- id (uuid, primary key)
- name (text, unique)
- province (text)
- bounds (jsonb, GeoJSON boundaries)
```

**Status Updates Table**
```sql
- id (uuid, primary key)
- report_id (references reports)
- update_text (text)
- created_by (references users - officials)
- previous_status, new_status (report_status)
- internal_notes (text)
```

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset completion

#### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID (with permissions)

#### Report Management
- `POST /api/reports` - Create report (citizens only)
- `GET /api/reports` - Get all reports (with filtering)
- `GET /api/reports/mine` - Get user's reports (citizens)
- `GET /api/reports/municipality` - Get municipality reports (officials)
- `GET /api/reports/:id` - Get single report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/upvote` - Toggle upvote
- `DELETE /api/reports/:id/upvote` - Remove upvote

#### Status Updates & Accountability
- `POST /api/reports/:reportId/status` - Add status update (officials)
- `GET /api/reports/:reportId/status` - Get status updates
- `GET /api/reports/:reportId/history` - Get accountability history

#### Municipality Management
- `GET /api/municipalities` - Get all municipalities
- `GET /api/municipalities/:id` - Get single municipality
- `GET /api/municipalities/:id/reports` - Get municipality reports
- `POST /api/municipalities/import` - Bulk import (officials)

#### Ward & GeoJSON Management
- `GET /api/wards` - Get all wards
- `GET /api/wards/:wardId` - Get single ward
- `POST /api/wards/import` - Import from GeoJSON URL
- `POST /api/wards/import-live` - Import from GitHub
- `GET /api/wards/boundaries/simplified` - Simplified boundaries
- `GET /api/wards/statistics` - Ward-based analytics

#### Analytics & Intelligence
- `GET /api/analytics/dashboard` - Comprehensive dashboard (officials)
- `GET /api/analytics/timeseries` - Time-series data
- `GET /api/analytics/ai-export` - AI-ready data export

## Data Flows

### Report Creation Flow
1. Citizen submits report via mobile app
2. API validates request and user permissions
3. Municipality determined from coordinates
4. Report stored in database with pending status
5. Response sent back with report details

### Status Update Flow
1. Official adds status update via admin interface
2. API validates official has access to municipality
3. Status update stored with official attribution
4. Report status updated if changed
5. Accountability trail maintained

### Analytics Flow
1. Official requests dashboard data
2. API aggregates data from multiple tables
3. Time-series analysis performed
4. Cached results returned to reduce load
5. AI-ready exports generated on demand

### Authentication Flow
1. User submits credentials
2. Supabase Auth validates credentials
3. JWT token generated and returned
4. Subsequent requests validated via middleware
5. User profile data attached to requests

## State Management

### Database State
- PostgreSQL via Supabase with Row Level Security
- Real-time subscriptions available
- Automatic backups and scaling

### Session State
- JWT tokens for stateless authentication
- User profile cached in request context
- Role-based access control enforced

### Caching Strategy
- Ward boundaries: 1 hour cache
- Analytics data: 5-10 minute cache
- Report lists: 1 minute cache
- Municipality data: 2 hour cache

## Key Logic

### Municipality Detection
```javascript
const getMunicipalityFromCoordinates = async (lat, lng) => {
  // Spatial query to find municipality containing point
  // Fallback to default municipality if not found
  // Used for automatic report assignment
};
```

### Role-Based Authorization
```javascript
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
```

### Analytics Aggregation
```javascript
const getDashboardAnalytics = async (municipalityId, days) => {
  // Aggregate reports by category, status, ward
  // Calculate resolution times and trends
  // Generate AI insights and recommendations
};
```

### GeoJSON Processing
```javascript
const importWards = async (geojsonUrl) => {
  // Fetch GeoJSON from external source
  // Simplify geometry for performance
  // Batch insert with error handling
  // Update materialized views
};
```

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (citizen/official)
- Municipality-based data isolation
- Supabase Auth integration

### Data Protection
- Row Level Security (RLS) on all tables
- Input validation with Joi schemas
- SQL injection prevention
- XSS protection with Helmet

### Rate Limiting
- Global rate limiting (100 requests/15 minutes)
- Strict auth endpoint limiting (5 requests/15 minutes)
- IP-based tracking with proxy trust

### Audit Trail
- Complete accountability tracking
- All status updates linked to officials
- Timestamped change history
- Internal notes for official communication

## Performance Optimizations

### Database Optimizations
- Comprehensive indexing strategy
- Materialized views for complex queries
- Query pagination for large datasets
- Batch processing for imports

### Caching Strategy
- HTTP cache headers for static data
- In-memory caching for frequently accessed data
- Materialized view refresh scheduling
- CDN-ready static asset serving

### Free Tier Considerations
- Reduced batch sizes (50 records)
- Aggressive caching to reduce DB load
- Simplified geometry for ward boundaries
- Rate limiting to prevent abuse

## Integration Points

### Supabase Integration
- Database operations via Supabase client
- Authentication via Supabase Auth
- Real-time subscriptions (ready for implementation)
- File storage for report photos

### External APIs
- GitHub integration for live GeoJSON imports
- Geocoding services for address resolution
- Email services for password resets

### Frontend Integration
- RESTful API consumed by React Native app
- JWT token authentication
- Error handling and retry logic
- Real-time updates capability

## AI & Analytics Features

### Data Export Format
```javascript
{
  text_features: ['title', 'description', 'word_count'],
  categorical_features: ['category', 'status', 'ward_name'],
  numerical_features: ['latitude', 'longitude', 'upvotes'],
  temporal_features: ['hour_of_day', 'day_of_week', 'month'],
  geospatial_features: ['ward_properties']
}
```

### Analytics Capabilities
- Time-series analysis for trend identification
- Ward-based hotspot detection
- Category and status breakdowns
- Resolution time analytics
- Official activity tracking

### ML Applications
- Automatic report classification
- Priority prediction based on historical data
- Resolution time estimation
- Sentiment analysis of report text
- Hotspot prediction and prevention

## Development Workflow

### Environment Setup
- Environment variables for all configurations
- Separate test and production environments
- Docker-ready configuration

### Testing Strategy
- Unit tests for all route handlers
- Integration tests for API endpoints
- Test database with seed data
- Coverage reporting with Jest

### Deployment
- Production-ready with environment configs
- Health check endpoints for monitoring
- Error logging and alerting
- Horizontal scaling capability

## Monitoring & Observability

### Health Checks
- `/health` endpoint for service monitoring
- Database connection validation
- External service dependency checks

### Logging
- Structured logging for all operations
- Error tracking and alerting
- Performance monitoring
- Audit trail maintenance

### Metrics
- API response times
- Database query performance
- User activity analytics
- System resource utilization

## Future Enhancements

### Planned Features
- Real-time notifications via WebSockets
- Advanced analytics with machine learning
- Multi-tenant architecture for multiple cities
- Mobile app deep linking

### Technical Improvements
- GraphQL API for flexible queries
- Microservices architecture
- Event-driven architecture with queues
- Advanced caching with Redis

### Scalability
- Database sharding strategies
- Load balancing configuration
- CDN integration for static assets
- Horizontal scaling with containers

This backend API serves as the robust foundation for the Setshaba Connect ecosystem, providing secure, scalable, and feature-rich services for municipal issue reporting and management while maintaining high standards for performance, security, and accountability.