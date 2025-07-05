# Discord Bot Structure

This Discord bot has been restructured into a clean, modular architecture for better maintainability and scalability.

## Directory Structure

```
discord-bot-v2/
├── index.js                 # Main entry point
├── src/
│   ├── config/
│   │   └── permissions.js   # Bot intents and permissions
│   ├── commands/
│   │   ├── index.js         # Command registry
│   │   ├── hi.js           # Hi command
│   │   ├── ping.js         # Ping command
│   │   └── userinfo.js     # User info command
│   ├── handlers/
│   │   └── commandHandler.js # Command interaction handler
│   └── utils/
│       └── commandRegister.js # Command registration utility
├── package.json
└── README.md
```

## File Descriptions

### Core Files
- **`index.js`**: Main entry point that initializes the bot and sets up event listeners
- **`src/config/permissions.js`**: Contains all Discord intents and permissions configuration
- **`src/utils/commandRegister.js`**: Handles registration of slash commands with Discord API
- **`src/handlers/commandHandler.js`**: Manages command interactions and error handling

### Commands
Each command is a separate file in `src/commands/` with the following structure:
- **`data`**: SlashCommandBuilder instance defining the command
- **`execute`**: Function that handles the command execution

### Adding New Commands

1. Create a new file in `src/commands/` (e.g., `mycommand.js`)
2. Export `data` (SlashCommandBuilder) and `execute` function
3. Import and add to `src/commands/index.js`

Example:
```javascript
// src/commands/mycommand.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My awesome command');

export async function execute(interaction) {
    await interaction.reply('Command executed!');
}
```

Then add to `src/commands/index.js`:
```javascript
import * as mycommand from './mycommand.js';
export const commands = [hi, ping, userinfo, mycommand];
```

## Benefits of This Structure

1. **Modularity**: Each command is isolated and can be developed independently
2. **Scalability**: Easy to add new commands without modifying existing code
3. **Maintainability**: Clear separation of concerns
4. **Reusability**: Utilities and handlers can be reused across commands
5. **Clean Logging**: Only essential logs (login and command registration)

## Available Commands

- `/hi` - Simple greeting command
- `/ping` - Check bot latency
- `/userinfo [user]` - Get information about a user or yourself 