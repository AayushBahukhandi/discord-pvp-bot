import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { UserService } from '../services/userService.js';

export const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user and register them in the PvP system')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('The user to get info about')
            .setRequired(false));

export async function execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);

    try {
        // Register user in database
        const userRegistration = await UserService.registerUser({
            id: target.id,
            username: target.username,
            displayName: target.displayName,
            displayAvatarURL: () => target.displayAvatarURL({ dynamic: true }),
            joinedAt: member?.joinedAt,
            createdTimestamp: target.createdTimestamp
        });

        let registrationStatus = '';
        if (userRegistration.success) {
            registrationStatus = '✅ Registered in PvP system';
        } else {
            registrationStatus = '❌ Failed to register in PvP system';
            console.error('User registration failed:', userRegistration.error);
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('User Information')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: target.username, inline: true },
                { name: 'ID', value: target.id, inline: true },
                { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Nickname', value: member?.nickname || 'None', inline: true },
                { name: 'PvP Status', value: registrationStatus, inline: true },
                { name: 'Roles', value: member ? member.roles.cache.map(role => role.name).join(', ') : 'None', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in userinfo command:', error);
        
        // Fallback embed without registration
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('User Information')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: target.username, inline: true },
                { name: 'ID', value: target.id, inline: true },
                { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Nickname', value: member?.nickname || 'None', inline: true },
                { name: 'PvP Status', value: '❌ Registration failed', inline: true },
                { name: 'Roles', value: member ? member.roles.cache.map(role => role.name).join(', ') : 'None', inline: false }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
} 