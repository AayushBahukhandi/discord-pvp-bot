# Discord PvP Bot

A Discord bot built with Discord.js that provides anime card-based PvP battles and user management for Discord servers.

## Features

- **Ping Command**: Check bot latency
- **Hi Command**: Greet users
- **User Info Command**: Display user information and register them in the PvP system
- **Profile Command**: View PvP stats and user profile
- **Leaderboard Command**: View top players in the PvP system
- **REST API**: Full API for card management and user data
- **Database Integration**: Supabase database for persistent data storage

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Discord Bot Token
- Infisical CLI (for environment variable management)
- Supabase account and project

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy your bot token (you'll need this later)
5. Enable the necessary intents for your bot

### 2. Install Dependencies

1. Install the Infisical CLI globally:
```bash
npm install -g @infisical/cli
```

2. Login to Infisical:
```bash
infisical login
```

3. Initialize Infisical in the project:
```bash
infisical init
```

4. Install project dependencies:
```bash
npm install
```

### 3. Configure Environment Variables

Set up the following environment variables in your Infisical project:

- `DISCORD_TOKEN`: Your Discord bot token
- `CLIENT_ID`: Your Discord application client ID
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `API_PORT`: Port for API server (optional, defaults to 3001)

### 4. Invite Bot to Your Server

1. Go to the "OAuth2" section in your Discord application
2. Select "bot" under scopes
3. Select the permissions your bot needs
4. Use the generated URL to invite the bot to your server

## Running the Bot

To start the bot in development mode:
```bash
npm run dev
```

This will start the bot with nodemon for automatic reloading and Infisical for environment variable management.

## Project Structure

```
discord-bot-v2/
├── index.js                 # Main bot entry point
├── src/
│   ├── commands/           # Bot commands
│   │   ├── hi.js          # Greeting command
│   │   ├── ping.js        # Latency check command
│   │   ├── userinfo.js    # User information command
│   │   └── index.js       # Command exports
│   ├── config/
│   │   └── permissions.js # Bot intents configuration
│   ├── handlers/
│   │   └── commandHandler.js # Command interaction handler
│   └── utils/
│       └── commandRegister.js # Command registration utility
├── package.json            # Project dependencies and scripts
└── README.md              # This file
```

## Available Commands

- `/ping` - Check bot latency
- `/hi` - Get a greeting from the bot
- `/register` - Register for PvP system and receive 5 free starter cards
- `/userinfo` - Display information about a user and register them in PvP system
- `/profile` - View your PvP profile and stats
- `/cards` - View your anime card collection (with pagination)
- `/leaderboard` - View the PvP leaderboard

## API Endpoints

The bot also runs an Express API server with the following endpoints:

### Cards API
- `GET /api/cards` - Fetch all cards (supports `?anime=name&limit=50` query params)
- `GET /api/cards/:id` - Get specific card by ID
- `POST /api/cards` - Create new card
- `GET /api/cards/random/:count` - Get random cards for battles

### Users API
- `POST /api/users/register` - Register user from Discord
- `GET /api/users/profile/:discordId` - Get user profile with stats
- `PUT /api/users/stats/:discordId` - Update user stats after battle
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/cards/:discordId` - Get user's card collection (with pagination)
- `POST /api/users/starter-cards/:discordId` - Give starter cards to user

### Health Check
- `GET /api/health` - API health check

## Contributing

To add new commands:
1. Create a new command file in `src/commands/`
2. Export the command object with the required properties
3. Add the command to the exports in `src/commands/index.js`

## Environment Variables

The bot uses Infisical for managing environment variables. Make sure you have the necessary environment variables set up in your Infisical project, particularly the `DISCORD_TOKEN`. 