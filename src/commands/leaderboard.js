import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { UserService } from '../services/userService.js';

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the PvP leaderboard')
    .addIntegerOption(option =>
        option.setName('limit')
            .setDescription('Number of players to show (1-25)')
            .setMinValue(1)
            .setMaxValue(25)
            .setRequired(false));

export async function execute(interaction) {
    try {
        await interaction.deferReply();
        
        const limit = interaction.options.getInteger('limit') || 10;
        const result = await UserService.getLeaderboard(limit);
        
        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error')
                .setDescription('Failed to fetch leaderboard data.');
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const users = result.data;
        
        if (users.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('🏆 PvP Leaderboard')
                .setDescription('No players registered yet! Use `/userinfo` to get started.');
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const leaderboardText = users.map((user, index) => {
            const stats = user.user_stats[0] || {};
            const position = index + 1;
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
            const winRate = stats.battles_won + stats.battles_lost > 0 
                ? ((stats.battles_won / (stats.battles_won + stats.battles_lost)) * 100).toFixed(1)
                : '0.0';
            
            return `${medal} **${user.display_name}**\n` +
                   `Level ${stats.level || 1} • ${stats.experience_points || 0} XP\n` +
                   `${stats.battles_won || 0}W/${stats.battles_lost || 0}L (${winRate}%)\n`;
        }).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle('🏆 PvP Leaderboard')
            .setDescription(leaderboardText)
            .setFooter({ text: `Showing top ${users.length} players` })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in leaderboard command:', error);
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error')
            .setDescription('Failed to fetch leaderboard. Please try again later.');
        
        await interaction.editReply({ embeds: [embed] });
    }
}
