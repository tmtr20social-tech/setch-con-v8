# Setshaba Connect - System Integration Overview

## System Architecture

The Setshaba Connect system consists of two main components that work together to provide a comprehensive municipal issue reporting platform:

1. **Citizens App** (React Native/Expo) - Mobile application for citizens
2. **Backend API** (Node.js/Express) - Server-side services and data management

## High-Level Data Flow

```
[Citizens Mobile App] <---> [Backend API] <---> [Supabase Database]
                                 |
                                 v
                         [External Services]
                         - GitHub (GeoJSON)
                         - Location Services
                         - Email Services
```

## Integration Points

### 1. Authentication Flow
```
Mobile App                    Backend API                 Supabase Auth
    |                             |                           |
    |-- POST /api/auth/login ---->|                           |
    |                             |-- Validate credentials -->|
    |                             |<-- User data + JWT -------|
    |<-- JWT token + user data ---|                           |
    |                             |                           |
    |-- Subsequent API calls ---->|                           |
    |   (with JWT in header)      |-- Verify JWT token ----->|
    |                             |<-- User validation -------|
    |<-- Protected data ----------|                           |
```

### 2. Report Management Flow
```
Mobile App                    Backend API                 Database
    |                             |                           |
    |-- Create Report ----------->|                           |
    |   (with location data)      |-- Determine municipality->|
    |                             |-- Store report --------->|
    |                             |<-- Report ID -------------|
    |<-- Success response --------|                           |
    |                             |                           |
    |-- Get Reports List -------->|                           |
    |                             |-- Query with filters ---->|
    |                             |<-- Report data ------------|
    |<-- Reports array ----------|                           |
```

### 3. Real-time Updates (Future)
```
Mobile App                    Backend API                 Supabase Realtime
    |                             |                           |
    |-- Subscribe to updates ---->|                           |
    |                             |-- Setup subscription ---->|
    |                             |<-- Realtime channel ------|
    |<-- WebSocket connection ----|                           |
    |                             |                           |
    |                             |<-- Status update event ---|
    |<-- Push notification -------|                           |
```

## Data Models Integration

### User Data Synchronization
- **Mobile App**: Stores user profile in local state via useAuth hook
- **Backend**: Manages user data in PostgreSQL via Supabase
- **Sync Point**: Login/registration and profile updates

### Report Data Management
- **Mobile App**: Displays reports with local state management
- **Backend**: Handles CRUD operations with role-based access
- **Database**: PostgreSQL with Row Level Security (RLS)

### Location Data Integration
- **Mobile App**: Uses Expo Location for GPS coordinates
- **Backend**: Processes coordinates to determine municipality
- **Database**: Stores both coordinates and resolved addresses

## API Communication Patterns

### Request/Response Pattern
```javascript
// Mobile App Service Layer
const reportService = {
  async createReport(reportData) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reportData)
    });
    return response.json();
  }
};

// Backend Route Handler
router.post('/reports', authenticateToken, requireCitizen, async (req, res) => {
  const reportData = req.body;
  const userId = req.user.id;
  
  // Process and store report
  const report = await supabase.from('reports').insert({
    ...reportData,
    created_by: userId
  });
  
  res.json(formatSuccess({ report }));
});
```

### Error Handling Integration
```javascript
// Mobile App Error Handling
try {
  const report = await reportService.createReport(data);
  navigation.goBack();
} catch (error) {
  Alert.alert('Error', error.message);
}

// Backend Error Response
const formatError = (message, statusCode = 400, details = null) => {
  return {
    error: message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
};
```

## Security Integration

### Token-Based Authentication
1. **Mobile App**: Stores JWT tokens securely using AsyncStorage
2. **Backend**: Validates tokens on each protected request
3. **Supabase**: Manages user sessions and token refresh

### Role-Based Access Control
```javascript
// Mobile App - Role-based UI
{user.role === 'citizen' && (
  <Button onPress={createReport}>Create Report</Button>
)}

// Backend - Role-based endpoints
router.get('/reports/municipality', 
  authenticateToken, 
  requireOfficial, 
  getMunicipalityReports
);
```

## State Management Integration

### Mobile App State Flow
```
AuthProvider (Global)
    |
    |-- User session state
    |-- Authentication methods
    |
    v
Screen Components
    |
    |-- Local state (useState)
    |-- API calls via services
    |-- Loading/error states
    |
    v
Custom Hooks (useReports, useLocation)
    |
    |-- Data fetching logic
    |-- Caching and pagination
    |-- Error handling
```

### Backend State Management
```
Request Middleware
    |
    |-- Authentication check
    |-- User context attachment
    |
    v
Route Handlers
    |
    |-- Business logic
    |-- Database operations
    |-- Response formatting
    |
    v
Database Layer (Supabase)
    |
    |-- Row Level Security
    |-- Data persistence
    |-- Real-time capabilities
```

## Performance Integration

### Caching Strategy
- **Mobile App**: Local state caching, image caching
- **Backend**: HTTP cache headers, query result caching
- **Database**: Materialized views for complex queries

### Optimization Techniques
- **Mobile App**: Lazy loading, FlatList for large datasets
- **Backend**: Pagination, batch processing, rate limiting
- **Database**: Indexing, query optimization

## Development Integration

### Environment Configuration
```javascript
// Mobile App (.env)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
API_URL=http://localhost:3000/api

// Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Testing Integration
- **Mobile App**: Component testing, service layer testing
- **Backend**: API endpoint testing, integration testing
- **Database**: Migration testing, seed data management

## Deployment Integration

### Development Environment
1. Backend runs on localhost:3000
2. Mobile app connects to local backend
3. Shared Supabase instance for development

### Production Environment
1. Backend deployed to cloud platform (Render, Heroku, etc.)
2. Mobile app built and distributed via app stores
3. Production Supabase instance with proper security

## Monitoring Integration

### Error Tracking
- **Mobile App**: Error boundaries, crash reporting
- **Backend**: Structured logging, error alerting
- **Database**: Query performance monitoring

### Analytics Integration
- **Mobile App**: User interaction tracking
- **Backend**: API usage analytics
- **System**: Performance metrics, uptime monitoring

## Future Integration Enhancements

### Real-time Features
- WebSocket connections for live updates
- Push notifications for report status changes
- Live chat between citizens and officials

### Advanced Analytics
- Machine learning model integration
- Predictive analytics for issue resolution
- Automated report classification

### Third-party Integrations
- Payment processing for municipal services
- Social media integration for report sharing
- GIS systems for advanced mapping

### Scalability Improvements
- Microservices architecture
- Event-driven communication
- Distributed caching systems

## Integration Best Practices

### API Design
- RESTful endpoints with consistent naming
- Proper HTTP status codes
- Comprehensive error messages
- API versioning strategy

### Data Consistency
- Atomic operations for critical updates
- Proper transaction handling
- Data validation at multiple layers
- Conflict resolution strategies

### Security Measures
- Input validation and sanitization
- Rate limiting and abuse prevention
- Secure token storage and transmission
- Regular security audits

This integration overview provides a comprehensive understanding of how the Citizens App and Backend API work together to deliver the Setshaba Connect municipal reporting system, ensuring seamless communication, robust security, and optimal performance across all components.