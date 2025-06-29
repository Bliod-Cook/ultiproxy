# UltiProxy WebUI

A modern React-based web interface for managing and monitoring the UltiProxy HTTP forwarding service.

## 🚀 Features

### ✅ **Fully Implemented**
- **Real-time Dashboard** with system metrics and interactive charts
- **Forwarding Rules Management** with comprehensive CRUD operations
- **Live Monitoring** with backend health status and performance metrics
- **Configuration Management** with advanced settings and feature toggles
- **Real-time Log Viewer** with streaming, filtering, and export capabilities
- **Professional Material-UI Design** with consistent dark theme
- **Responsive Design** that works on all devices
- **WebSocket Integration** for real-time updates

## 🛠️ Technology Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Material-UI v6** for component library and theming
- **TanStack Query v5** for server state management
- **Zustand** for client-side state management
- **Socket.io Client** for WebSocket real-time updates
- **Material-UI X Charts** for data visualization
- **React Router v6** for navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Open http://localhost:5173 in your browser
   - The WebUI will work with mock data for demonstration

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
web-ui/src/
├── main.tsx                 # Application entry point
├── App.tsx                  # Root component with routing
├── theme.ts                 # Material-UI theme configuration
├── components/              # Reusable components
│   ├── Layout.tsx          # Main layout with navigation
│   ├── Navigation.tsx      # Sidebar navigation
│   ├── RuleEditor.tsx      # Modal dialog for rule creation/editing
│   └── charts/             # Data visualization components
│       ├── MetricsChart.tsx # Line chart component
│       └── GaugeChart.tsx   # Gauge chart component
├── pages/                   # Main application pages
│   ├── Dashboard.tsx       # Real-time metrics and charts
│   ├── Rules.tsx           # Forwarding rules management
│   ├── Monitoring.tsx      # System monitoring and health
│   ├── Config.tsx          # System configuration
│   └── Logs.tsx            # Real-time log viewer
├── services/                # API and WebSocket services
│   ├── api.ts              # REST API client
│   ├── websocket.ts        # WebSocket service
│   └── types.ts            # TypeScript type definitions
├── hooks/                   # Custom React hooks
│   ├── useDashboardStats.ts # Dashboard data fetching
│   ├── useRules.ts         # Rules CRUD operations
│   └── useMonitoring.ts    # Monitoring data hooks
└── store/                   # State management (prepared)
```

## 🔌 API Integration

The WebUI is designed to integrate with the UltiProxy Rust backend API:

### REST API Endpoints
- `GET /api/config` - Get current configuration
- `PUT /api/config` - Update configuration
- `GET /api/rules` - List forwarding rules
- `POST /api/rules` - Create new rule
- `PUT /api/rules/:name` - Update rule
- `DELETE /api/rules/:name` - Delete rule
- `GET /api/metrics` - Get system metrics
- `GET /api/health` - Health check
- `GET /api/status` - Proxy status

### WebSocket Events
- Connect to `ws://localhost:8080/ws/events` for real-time updates
- Metrics updates (every 5 seconds)
- Configuration changes
- Rule updates
- Error events

## 🎨 UI Components

### Dashboard
- Real-time system metrics with auto-refresh
- Interactive charts showing request patterns
- System health indicators with colored status cards
- Key metrics: Total Requests, Errors, Response Time, Cache Hit Ratio

### Forwarding Rules
- Professional data table with all forwarding rules
- Comprehensive Rule Editor Dialog with form validation
- Feature indicators (Headers, Body replacements) with visual chips
- CRUD operations with real-time updates

### Monitoring
- Live metrics dashboard with key performance indicators
- Backend health status monitoring for individual servers
- Multiple chart types (Line charts, Gauge charts)
- Error rate tracking with visual indicators

### Configuration
- Comprehensive settings forms (Server, Logging, Features)
- Advanced configuration options (Rate Limiting, SSL, Caching)
- Form validation with helpful error messages
- Feature toggles for proxy capabilities

### Logs
- Real-time log streaming with professional terminal UI
- Advanced filtering (Search, Level, Source filtering)
- Colored log levels (DEBUG, INFO, WARN, ERROR)
- Export functionality (Download logs as text files)

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Environment Variables

The WebUI automatically detects the backend URL based on the environment:

- **Development**: Uses Vite proxy to forward requests to `localhost:8080`
- **Production**: Uses the same origin as the frontend by default

For custom backend URLs, create a `.env` file:

```env
# Custom backend URL (optional)
VITE_API_BASE_URL=https://your-backend-domain.com
```

See `.env.example` for more configuration options.

## 🐳 Docker Support

The WebUI includes Docker support for production deployment:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# Build React application
FROM nginx:alpine AS runtime
# Serve with optimized Nginx configuration
```

## 📊 Performance Features

- **Code Splitting** by route for optimal loading
- **React Query Caching** for API responses
- **Optimized Re-renders** with React.memo
- **Debounced Search** and filtering
- **Lazy Loading** of components
- **Bundle Optimization** with Vite

## 🔒 Security Features

- **Input Validation** and sanitization
- **XSS Protection** with proper escaping
- **Secure API Communication** structure
- **Rate Limiting** preparation for API calls
- **CORS Configuration** support

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
# Access at http://localhost:5173
```

### Production Deployment
```bash
npm run build
# Serve the dist/ directory with your web server
```

### Docker Deployment

#### Standalone Docker
```bash
# Build with default configuration
docker build -t ultiproxy-webui .

# Build with custom backend URL
docker build --build-arg VITE_API_BASE_URL=https://your-backend.com -t ultiproxy-webui .

# Run the container
docker run -p 80:80 ultiproxy-webui
```

#### Docker Compose
```bash
# Development environment
docker-compose up

# Production environment
docker-compose -f docker-compose.prod.yml up
```

The Docker Compose files automatically configure the frontend to connect to the backend service within the Docker network.

## 📈 Current Status

**Phase 3 - WebUI Development: ✅ COMPLETED**

The UltiProxy WebUI is fully implemented and functional with:
- ✅ All major features implemented and tested
- ✅ Professional Material-UI design
- ✅ Real-time data updates via WebSocket
- ✅ Mock data integration for demonstration
- ✅ Production-ready responsive design
- ✅ Complete error handling and user feedback

**Next Phase**: Integration with actual UltiProxy backend and Docker containerization.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the UltiProxy HTTP forwarding service.
