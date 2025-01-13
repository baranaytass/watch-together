# Watch Together - Video Sync Platform

Watch Together is a platform that allows users to watch videos synchronously with their friends across different video platforms.

## Project Status

### Completed Features
- Basic backend infrastructure with Express and TypeScript
- MongoDB integration for provider management
- Redis integration for session management
- Chrome extension with provider detection
- Session creation and sharing
- Basic web interface for session viewing

### In Progress
- WebSocket integration for real-time synchronization
- Video player integration
- Chat functionality
- User authentication
- Session participant management

## Project Specifications

### Core Features

- **Multi-Platform Support**
  - Support for YouTube videos initially
  - Extensible architecture for adding other platforms (Netflix, Vimeo etc.)
  - Browser extension for video control and synchronization

- **Session Management**
  - Create watch sessions with unique sharing links
  - Join existing sessions via links
  - Real-time participant management
  - Session history tracking

- **Video Synchronization**
  - Real-time video state synchronization (play, pause, seek)
  - Automatic time synchronization between participants
  - Buffer state handling
  - Network latency compensation

- **User Experience**
  - Simple one-click sharing mechanism
  - Minimal setup required to join sessions
  - Real-time chat functionality
  - Participant presence indicators

### Technical Requirements

- **Client Side**
  - Chrome Extension
    - Video player state monitoring
    - Platform-specific video control
    - Secure communication with backend
  - Web Application
    - Session management interface
    - Real-time participant list
    - Chat functionality
    - Responsive design

- **Server Side**
  - REST API
    - Session creation and management
    - User authentication
    - Video metadata handling
  - WebSocket Server
    - Real-time state synchronization
    - Chat message handling
    - Presence management
  - Data Storage
    - User data persistence
    - Session history
    - Video metadata storage

### Security Requirements

- Secure WebSocket connections
- Protected API endpoints
- Safe session sharing mechanism
- User data protection
- Rate limiting for API calls

### Performance Requirements

- Maximum latency of 1000ms for video synchronization
- Support for up to 10 concurrent users per session
- Efficient handling of multiple active sessions
- Quick session creation and joining process

### Scalability Requirements

- Microservices architecture
- Horizontal scaling capability
- Efficient caching mechanism
- Load balancing support

## Technology Stack

- **Frontend:**
  - Chrome Extension: TypeScript
  - Web App: Next.js 13 with TypeScript
  - WebSocket Client: Socket.io-client
  - Styling: Tailwind CSS

- **Backend:**
  - API Server: Node.js/Express with TypeScript
  - WebSocket Server: Socket.io
  - Database: MongoDB
  - Cache: Redis

- **DevOps:**
  - Containerization: Docker
  - Container Orchestration: Docker Compose
  - Reverse Proxy: Nginx
  - SSL/TLS: Let's Encrypt

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Docker and Docker Compose
- Chrome browser for extension development

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/watch-together.git
cd watch-together
```

2. Start the development environment:
```bash
docker-compose up --build
```

3. Load the Chrome extension:
- Open Chrome and navigate to `chrome://extensions`
- Enable Developer mode
- Click "Load unpacked" and select the `extension/dist` directory

4. Access the web application:
- Open your browser and navigate to `http://localhost:3000`

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Web Development
```bash
cd web
npm install
npm run dev
```

### Extension Development
```bash
cd extension
npm install
npm run build
```

## Development Commands

### Initial Setup
```bash
# Start all services
docker-compose up -d

# Start only web application
docker-compose up -d web
```

### Daily Development Operations
```bash
# View web application logs
docker-compose logs -f web

# Restart web application (usually not needed for code changes)
docker-compose restart web

# When dependencies change (package.json updates)
docker-compose up -d --build web

# Clean all containers and volumes (for cache cleanup)
docker-compose down -v
```

### Performance Tips

1. **Hot Reload**: Web application runs with Next.js hot reload feature. Your code changes will be reflected automatically.

2. **Volume Usage**: 
   - `node_modules` and `.next` directories are stored in Docker volumes
   - Source code is bind mounted from host to container
   - Benefits:
     - Dependencies are not reinstalled on every build
     - Build outputs are preserved
     - Code changes are reflected instantly

3. **Build Optimization**:
   - `.dockerignore` removes unnecessary files from build context
   - Multi-stage build reduces image size
   - Separate Dockerfile configuration for development

## Project Structure

```
watch-together/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── app.ts
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── extension/
│   ├── src/
│   │   └── popup/
│   │       ├── popup.html
│   │       ├── popup.css
│   │       └── popup.ts
│   ├── manifest.json
│   └── package.json
│
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── public/
│   └── package.json
│
├── docker/
│   ├── backend.dockerfile
│   ├── web.dockerfile
│   └── mongo-init.js
│
├── docker-compose.yml
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
