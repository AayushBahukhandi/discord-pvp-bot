import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { botIntents } from './src/config/permissions.js';
import { commands } from './src/commands/index.js';
import { registerCommands } from './src/utils/commandRegister.js';
import { handleCommands } from './src/handlers/commandHandler.js';

dotenv.config();

const client = new Client({
    intents: botIntents
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands(commands);
});

client.on('interactionCreate', async interaction => {
    handleCommands(interaction, commands);
});

client.login(process.env.DISCORD_TOKEN);