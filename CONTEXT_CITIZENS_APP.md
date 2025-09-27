# Setshaba Connect - Citizens App Context

## Overview
The Citizens App is a React Native mobile application built with Expo that enables citizens to report municipal issues and track their resolution status. It serves as the primary interface for community members to engage with local government services.

## Folder Structure

```
citizens-app/
├── App.js                          # Main app entry point with AuthProvider
├── ErrorBoundary.js               # Error handling component
├── README.md                      # Comprehensive documentation
├── app.json                       # Expo configuration
├── babel.config.js                # Babel configuration with dotenv plugin
├── index.js                       # App registration with Expo
├── package.json                   # Dependencies and scripts
└── src/
    ├── components/                # Reusable UI components
    │   ├── common/               # Generic components
    │   │   ├── Button.js         # Custom button with variants
    │   │   ├── ErrorMessage.js   # Error display component
    │   │   ├── Input.js          # Form input with validation
    │   │   └── LoadingSpinner.js # Loading indicator
    │   └── reports/              # Report-specific components
    │       ├── CategoryPicker.js # Category selection component
    │       ├── ReportCard.js     # Report display card
    │       └── StatusUpdates.js  # Status timeline component
    ├── config/                   # Configuration files
    │   ├── api.js               # API endpoints and constants
    │   └── supabase.js          # Supabase client configuration
    ├── hooks/                   # Custom React hooks
    │   ├── useAuth.js           # Authentication hook with context
    │   ├── useLocation.js       # Location services hook
    │   └── useReports.js        # Report management hooks
    ├── navigation/              # Navigation configuration
    │   ├── AppNavigator.js      # Main app navigator
    │   ├── AuthNavigator.js     # Authentication screens
    │   └── MainNavigator.js     # Main app screens with tabs
    ├── screens/                 # Screen components
    │   ├── auth/               # Authentication screens
    │   │   ├── LoginScreen.js   # User login interface
    │   │   └── SignupScreen.js  # User registration interface
    │   └── main/               # Main application screens
    │       ├── CreateReportScreen.js  # Report creation form
    │       ├── MapScreen.js           # Interactive map view
    │       ├── MyReportsScreen.js     # User's reports list
    │       ├── ProfileScreen.js       # User profile management
    │       ├── ReportDetailScreen.js  # Individual report details
    │       └── ReportsScreen.js       # Community reports list
    └── services/               # API service layer
        ├── authService.js      # Authentication API calls
        ├── locationService.js  # Location services
        ├── municipalityService.js # Municipality data API
        ├── reportService.js    # Report management API
        └── userService.js      # User profile API
```

## File Contents Summaries

### Core Application Files

**App.js**
- Main application entry point
- Wraps the entire app with AuthProvider for global authentication state
- Renders AppNavigator as the root component

**ErrorBoundary.js**
- React error boundary component for graceful error handling
- Catches JavaScript errors anywhere in the component tree
- Displays fallback UI with error information

**index.js**
- Expo app registration point
- Imports and registers the main App component

### Configuration Files

**app.json**
- Expo configuration file defining app metadata
- Configures app name, version, icons, splash screen
- Sets platform-specific settings (iOS bundle ID, Android package)
- Defines required permissions (location, camera, storage)
- Configures Expo plugins for location, image picker, notifications

**babel.config.js**
- Babel configuration for React Native
- Includes react-native-dotenv plugin for environment variables
- Enables ES6+ features and JSX transformation

**package.json**
- Project dependencies and metadata
- Scripts for development, building, and running the app
- Key dependencies: React Native, Expo, Supabase, React Navigation

### Source Code Structure

#### Components

**Common Components:**
- `Button.js`: Customizable button with multiple variants (primary, secondary, outline), sizes, and loading states
- `ErrorMessage.js`: Standardized error display with retry functionality
- `Input.js`: Form input component with validation, password visibility toggle, and error states
- `LoadingSpinner.js`: Reusable loading indicator with customizable message

**Report Components:**
- `CategoryPicker.js`: Horizontal scrollable category selector with icons
- `ReportCard.js`: Card component displaying report summary with upvote functionality
- `StatusUpdates.js`: Timeline component showing report status progression

#### Configuration

**api.js**
- Defines API base URL and all endpoint constants
- Contains report categories and status definitions
- Provides centralized API configuration

**supabase.js**
- Supabase client initialization with environment variables
- Configures authentication settings and storage
- Sets up URL polyfill for React Native compatibility

#### Custom Hooks

**useAuth.js**
- Authentication context provider and hook
- Manages user session state and authentication methods
- Provides signUp, signIn, signOut functions
- Handles automatic session restoration

**useLocation.js**
- Location services hook with permission handling
- Provides getCurrentLocation and reverseGeocode functions
- Manages location permission requests

**useReports.js**
- Multiple hooks for report management:
  - `useReports`: Fetches all reports with filtering
  - `useMyReports`: Fetches user's own reports
  - `useReport`: Manages single report with upvote functionality

#### Navigation

**AppNavigator.js**
- Root navigator that switches between auth and main flows
- Handles loading states and authentication checks

**AuthNavigator.js**
- Stack navigator for authentication screens
- Manages login and signup flow

**MainNavigator.js**
- Bottom tab navigator with three main sections:
  - Reports: Community reports and creation
  - Map: Interactive map view
  - Profile: User profile and personal reports

#### Screens

**Authentication Screens:**
- `LoginScreen.js`: User login with email/password, form validation, error handling
- `SignupScreen.js`: User registration with profile information, address input

**Main Application Screens:**
- `CreateReportScreen.js`: Report creation form with location detection, photo upload, category selection
- `MapScreen.js`: Interactive map showing municipality boundaries and report markers
- `MyReportsScreen.js`: User's personal reports with statistics
- `ProfileScreen.js`: User profile management with edit functionality
- `ReportDetailScreen.js`: Detailed report view with status updates and upvoting
- `ReportsScreen.js`: Community reports list with filtering and search

#### Services

**authService.js**
- Authentication API integration with backend
- Handles registration, login, logout
- Manages Supabase Auth integration

**locationService.js**
- Location services using Expo Location
- Permission handling and current location detection
- Reverse geocoding for address resolution

**municipalityService.js**
- Municipality data fetching
- GeoJSON boundary data handling

**reportService.js**
- Complete report management API
- CRUD operations for reports
- Upvoting functionality
- Status updates retrieval

**userService.js**
- User profile management
- Profile updates and data retrieval

## Dependencies

### Core Dependencies
- **React Native & Expo**: Mobile app framework and development platform
- **@react-navigation**: Navigation library for screen management
- **@supabase/supabase-js**: Backend integration and authentication
- **react-native-maps**: Interactive map functionality
- **expo-location**: Location services and permissions
- **expo-image-picker**: Camera and photo library access
- **react-native-paper**: UI component library
- **@expo/vector-icons**: Icon library

### Development Dependencies
- **@babel/core**: JavaScript compiler
- **babel-preset-expo**: Expo-specific Babel preset

## Data Flows

### Authentication Flow
1. User opens app → AuthProvider checks for existing session
2. No session → AuthNavigator (Login/Signup screens)
3. Login/Signup → API call to backend → Supabase Auth
4. Success → Session stored → MainNavigator rendered

### Report Creation Flow
1. User taps "Create Report" → CreateReportScreen
2. Location detected automatically → Address resolved
3. User fills form → Photo optional → Category selection
4. Submit → API call to backend → Database storage
5. Success → Navigate back to reports list

### Report Viewing Flow
1. Reports fetched from API → Displayed in ReportsScreen
2. User taps report → ReportDetailScreen
3. Additional data loaded (upvotes, status updates)
4. User can upvote → API call → UI updated

### Map Integration Flow
1. MapScreen loads → Fetch municipalities and reports
2. Municipality boundaries rendered as polygons
3. Reports displayed as colored markers
4. User taps marker → Report details shown

## State Management

### Authentication State
- Managed by AuthContext (useAuth hook)
- Global user session and profile data
- Automatic session restoration on app launch

### Local Component State
- React useState for form inputs and UI state
- Loading states for API calls
- Error states for user feedback

### Data Fetching State
- Custom hooks (useReports, useMyReports) manage:
  - Loading states
  - Error handling
  - Data caching
  - Pagination

### Navigation State
- React Navigation handles screen stack and tab state
- Parameters passed between screens for data sharing

## Key Logic

### Location Detection
```javascript
// Automatic location detection for reports
const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) throw new Error('Location permission denied');
  
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
```

### Report Upvoting
```javascript
// Toggle upvote functionality
const handleUpvote = async () => {
  if (report.user_upvoted) {
    await removeUpvote();
  } else {
    await upvoteReport();
  }
  // Refresh report data to show updated count
};
```

### Municipality Detection
- Reports automatically assigned to municipalities based on coordinates
- Fallback to user's home municipality if location-based detection fails

## Integration Points

### Backend API Integration
- RESTful API calls to Express.js backend
- JWT token authentication for protected endpoints
- Error handling and retry logic

### Supabase Integration
- Authentication using Supabase Auth
- Real-time capabilities (ready for implementation)
- File storage for report photos

### External Services
- Expo Location for GPS and geocoding
- Device camera and photo library access
- Push notifications (configured but not implemented)

### Map Services
- React Native Maps for interactive mapping
- GeoJSON rendering for municipality boundaries
- Custom markers for report locations

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Secure storage of authentication tokens
- Input validation on all forms
- Permission-based access to device features

## Performance Optimizations

- Lazy loading of screens
- Image optimization and caching
- Efficient list rendering with FlatList
- Debounced search functionality
- Pagination for large datasets

## Development Workflow

### Environment Setup
- Environment variables for API URLs and keys
- Separate configurations for development and production
- Expo development server for hot reloading

### Testing Strategy
- Component-based architecture enables unit testing
- Integration testing for API services
- Manual testing on physical devices

### Build Process
- Expo managed workflow for easy deployment
- Over-the-air updates capability
- Platform-specific builds for iOS and Android

## Future Enhancements

### Planned Features
- Push notifications for report updates
- Offline functionality with data synchronization
- Advanced filtering and search capabilities
- Social features (comments, sharing)
- Multi-language support

### Technical Improvements
- State management with Redux Toolkit
- Comprehensive test coverage
- Performance monitoring
- Analytics integration
- Accessibility improvements

## Deployment

### Development
- Expo Go app for testing
- Development server with hot reloading
- Debug builds for testing

### Production
- App Store and Google Play deployment
- Over-the-air updates for quick fixes
- Analytics and crash reporting
- Performance monitoring

This Citizens App serves as the primary interface for community engagement in the Setshaba Connect ecosystem, providing citizens with an intuitive way to report issues and track their resolution while maintaining high standards for user experience and security.