# Heaters Control App

A React-based heater control application for Tiko smart heating system, optimized for iOS 12.5.7 Safari and fullscreen display.

## Features

- **Responsive Layout**: Adapts to vertical and horizontal orientations
- **Dark Mode**: Full dark theme optimized for OLED displays
- **Room Control**: Individual temperature and mode control for each room
- **Global Settings**: Main temperature and mode controls
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

**Features in development mode:**
- 🔥 Hot module replacement (changes update automatically)
- 🔌 Automatic proxy to Tiko API (no CORS issues)
- 📦 Webpack dev middleware integrated with Express

## Production

### Build and Run

Build and start the production server:
```bash
npm run start:build
```

Or separately:
```bash
npm run build
npm start
```

The app will be available at `http://localhost:3000` (or your configured PORT)

**Note:** Both development and production use the same Express server (`server.js`), which handles:
- Serving the React app
- Proxying `/api/*` requests to Tiko API
- No need for separate webpack-dev-server!

### Deployment

To deploy to a production environment:
1. Set environment variable: `NODE_ENV=production`
2. Run: `npm run start:build`
3. Or deploy to any Node.js hosting platform (Heroku, Railway, Render, etc.)

The server will automatically serve static files in production mode.

## Project Structure

```
src/
├── components/
│   ├── RoomTile.tsx           # Individual room control tile
│   ├── MainTemperature.tsx    # Global temperature control
│   └── ModeSelector.tsx       # Global mode selector
├── config/
│   ├── auth.config.ts         # Your credentials (gitignored)
│   └── auth.config.example.ts # Template
├── services/
│   └── tiko.service.ts        # Tiko API service
├── App.tsx                    # Main application component
├── index.tsx                  # Entry point
├── index.html                 # HTML template
└── styles.css                 # Global styles
```

## Layout Modes

### Vertical (Portrait)
- Room tiles: 2 columns, 70% height
- Main temperature: 15% height
- Mode buttons: 15% height, single row

### Horizontal (Landscape)
- Room tiles: 2 rows, 70% width
- Controls column: 30% width with temperature on top, modes on bottom

## Temperature Range

Both room and global temperatures can be adjusted between -19°C and +19°C.

## Available Modes

- **Comfort** ☀️: Maximum comfort temperature
- **Eco** 🌱: Energy-saving mode
- **Sleep** 🌙: Night mode with reduced temperature
- **Frost** ❄️: Minimal heating to prevent freezing
- **Off** ⭕: Heating disabled

## Browser Compatibility

- iOS Safari 12.5.7+
- Modern browsers (Chrome, Firefox, Edge)
- Transpiled to ES5 for maximum compatibility

## Fullscreen Mode

For iOS Safari:
1. Add to Home Screen
2. Open from Home Screen for fullscreen experience
