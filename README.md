# Discord Bot v2

A Discord bot built with Discord.js that provides various utility commands for Discord servers.

## Features

- **Ping Command**: Check bot latency
- **Hi Command**: Greet users
- **User Info Command**: Display user information

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Discord Bot Token
- Infisical CLI (for environment variable management)

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
- `/userinfo` - Display information about a user

## Contributing

To add new commands:
1. Create a new command file in `src/commands/`
2. Export the command object with the required properties
3. Add the command to the exports in `src/commands/index.js`

## Environment Variables

The bot uses Infisical for managing environment variables. Make sure you have the necessary environment variables set up in your Infisical project, particularly the `DISCORD_TOKEN`. 