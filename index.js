import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { botIntents } from './src/config/permissions.js';
import { commands } from './src/commands/index.js';
import { registerCommands } from './src/utils/commandRegister.js';
import { handleCommands } from './src/handlers/commandHandler.js';
import apiServer from './src/api/server.js';

dotenv.config();

const client = new Client({
    intents: botIntents
});

// Start API server
const API_PORT = process.env.API_PORT || 3001;
apiServer.listen(API_PORT, () => {
    console.log(`🚀 API Server running on port ${API_PORT}`);
    console.log(`📍 Health check: http://localhost:${API_PORT}/api/health`);
});

client.on('ready', () => {
    console.log(`🤖 Discord Bot logged in as ${client.user.tag}!`);
    registerCommands(commands);
});

client.on('interactionCreate', async interaction => {
    handleCommands(interaction, commands);
});

client.login(process.env.DISCORD_TOKEN);