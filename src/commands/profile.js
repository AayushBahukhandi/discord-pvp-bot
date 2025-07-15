import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { UserService } from '../services/userService.js';

export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your PvP profile and stats')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('View another user\'s profile')
            .setRequired(false));

export async function execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    
    try {
        await interaction.deferReply();
        
        const result = await UserService.getUserProfile(target.id);
        
        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Profile Not Found')
                .setDescription(`${target.username} is not registered in the PvP system yet.\nUse \`/userinfo\` to register!`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }));
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const user = result.data;
        const stats = user.user_stats[0] || {};
        
        const winRate = stats.battles_won + stats.battles_lost > 0 
            ? ((stats.battles_won / (stats.battles_won + stats.battles_lost)) * 100).toFixed(1)
            : '0.0';
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`${user.display_name}'s PvP Profile`)
            .setThumbnail(user.avatar_url || target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🏆 Level', value: `${stats.level || 1}`, inline: true },
                { name: '⭐ Experience', value: `${stats.experience_points || 0} XP`, inline: true },
                { name: '🪙 Coins', value: `${stats.coins || 0}`, inline: true },
                { name: '✅ Battles Won', value: `${stats.battles_won || 0}`, inline: true },
                { name: '❌ Battles Lost', value: `${stats.battles_lost || 0}`, inline: true },
                { name: '📊 Win Rate', value: `${winRate}%`, inline: true },
                { name: '🃏 Cards Collected', value: `${stats.cards_collected || 0}`, inline: true },
                { name: '📅 Joined', value: `<t:${Math.floor(new Date(user.created_at).getTime() / 1000)}:R>`, inline: true },
                { name: '👀 Last Seen', value: `<t:${Math.floor(new Date(user.last_seen).getTime() / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `Discord ID: ${user.discord_id}` })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in profile command:', error);
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error')
            .setDescription('Failed to fetch profile data. Please try again later.');
        
        await interaction.editReply({ embeds: [embed] });
    }
}
