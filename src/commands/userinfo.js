import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('The user to get info about')
            .setRequired(false));

export async function execute(interaction) {
    const target = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(target.id);

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
            { name: 'Roles', value: member ? member.roles.cache.map(role => role.name).join(', ') : 'None', inline: false }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
} 