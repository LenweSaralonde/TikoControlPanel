# Tiko Control Panel

A React-based heating control application for Tiko smart heating system, optimized for iOS 12.5.7 Safari and fullscreen display.

## Features

- **Dark Mode**: Full dark theme optimized for OLED displays
- **Room Control**: Individual temperature and mode control for each room
- **Global Settings**: Mode controls
- **Real-time Updates**: Auto-refresh every 30 seconds
- **iOS 12.5.7 Compatible**: Transpiled to ES5 for maximum compatibility

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure credentials**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Tiko credentials:
   ```
   TIKO_USERNAME=your-email@example.com
   TIKO_PASSWORD=your-password-here
   ```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Production

### Build and Run

Build and start the production server:

```bash
npm run build
npm start
```

The app will be available at `http://localhost:3000` (or your configured PORT)

### Deployment

To deploy to a production environment:

1. Set environment variable: `NODE_ENV=production`
2. Run: `npm run build`
3. Run: `npm run start`
4. Or deploy to any Node.js hosting platform (Heroku, Railway, Render, etc.)

The server will automatically serve static files in production mode.

## Browser Compatibility

- iOS Safari 12.5.7+
- Modern browsers (Chrome, Firefox, Edge)
- Transpiled to ES5 for maximum compatibility

## Fullscreen Mode

For iOS Safari:

1. Add to Home Screen
2. Open from Home Screen for fullscreen experience
