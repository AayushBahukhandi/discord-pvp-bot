import { REST, Routes } from 'discord.js';

export async function registerCommands(commands) {
    try {
        // Check if required environment variables are set
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN environment variable is not set');
        }
        if (!process.env.CLIENT_ID) {
            throw new Error('CLIENT_ID environment variable is not set');
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(command => command.data.toJSON()) },
        );
        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error.message);
        console.log('\nPlease make sure you have:');
        console.log('1. Created a .env file in the root directory');
        console.log('2. Added DISCORD_TOKEN=your_bot_token_here');
        console.log('3. Added CLIENT_ID=your_client_id_here');
        console.log('\nSee README.md for detailed setup instructions.');
    }
} 