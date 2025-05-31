# NaturalTaskFlow

A modern task management application that allows users to create and manage tasks using natural language processing. The application provides an intuitive interface for task management with features like priority setting, due dates, and assignee management.

## Features

- 🤖 Natural Language Task Creation
- 📅 Task Management with Due Dates
- 👥 Assignee Management
- 🎯 Priority Levels (P1-P4)
- 🎨 Modern and Responsive UI
- 📱 Cross-platform Support
- 🔄 Real-time Updates
- 📝 Task Description Support

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- React Hook Form

### Backend
- Node.js
- Express.js
- TypeScript
- Google Gemini AI API (for natural language processing)
- WebSocket (for real-time updates)

### Development Tools
- ESBuild
- Drizzle ORM
- Cross-env (for cross-platform environment variables)
- Various Radix UI primitives for component building

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NaturalTaskFlow.git
   cd NaturalTaskFlow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start both the frontend and backend servers. The application will be available at:
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

## Building for Production

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Project Structure

```
NaturalTaskFlow/
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and utilities
├── components.json   # UI component configurations
├── drizzle.config.ts # Database configuration
├── tailwind.config.ts# Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
└── vite.config.ts   # Vite configuration
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks/parse` - Parse natural language task input
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task