import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('hi')
    .setDescription('Says hi there!');

export async function execute(interaction) {
    await interaction.reply('Hi there! 👋');
} 