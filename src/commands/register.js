import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { UserService } from '../services/userService.js';
import { CardService } from '../services/cardService.js';

export const data = new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register for the PvP system and receive 5 free starter cards!');

export async function execute(interaction) {
    try {
        await interaction.deferReply();
        
        const user = interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        
        // Check if user is already registered
        const existingUser = await UserService.getUserProfile(user.id);
        if (existingUser.success && existingUser.data) {
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('Already Registered! 🎯')
                .setDescription(`Welcome back, ${user.username}! You're already part of the PvP system.`)
                .addFields(
                    { name: '🏆 Level', value: `${existingUser.data.user_stats[0]?.level || 1}`, inline: true },
                    { name: '🪙 Coins', value: `${existingUser.data.user_stats[0]?.coins || 100}`, inline: true },
                    { name: '🃏 Cards', value: `${existingUser.data.user_stats[0]?.cards_collected || 0}`, inline: true }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Use /profile to see your full stats!' });
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        // Register new user
        const registrationResult = await UserService.registerUser({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            displayAvatarURL: () => user.displayAvatarURL({ dynamic: true }),
            joinedAt: member?.joinedAt,
            createdTimestamp: user.createdTimestamp
        });
        
        if (!registrationResult.success) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Registration Failed ❌')
                .setDescription('There was an error registering you for the PvP system. Please try again later.')
                .addFields(
                    { name: 'Error', value: registrationResult.error || 'Unknown error', inline: false }
                );
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        // Give user 5 starter cards
        const starterCardsResult = await UserService.giveStarterCards(user.id);
        
        let starterCardsMessage = '';
        let starterCardsFields = [];
        
        if (starterCardsResult.success && starterCardsResult.cards) {
            starterCardsMessage = '🎁 **Starter Cards Received:**';
            starterCardsFields = starterCardsResult.cards.map((card, index) => ({
                name: `${index + 1}. ${card.card_name}`,
                value: `📺 ${card.anime_name}\n⚔️ ATK: ${card.attack} | 🛡️ DEF: ${card.defense} | ⚡ SPD: ${card.speed}`,
                inline: true
            }));
        } else {
            starterCardsMessage = '⚠️ Registration successful, but starter cards could not be assigned. Contact an admin.';
        }
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🎉 Welcome to the PvP Arena!')
            .setDescription(`Congratulations ${user.username}! You've successfully registered for the PvP system.`)
            .addFields(
                { name: '🏆 Starting Level', value: '1', inline: true },
                { name: '🪙 Starting Coins', value: '100', inline: true },
                { name: '⭐ Experience', value: '0 XP', inline: true },
                { name: '\u200B', value: starterCardsMessage, inline: false },
                ...starterCardsFields
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Use /profile to view your stats and /cards to see your collection!' })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
    } catch (error) {
        console.error('Error in register command:', error);
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Registration Error ❌')
            .setDescription('An unexpected error occurred during registration. Please try again later.');
        
        if (interaction.deferred) {
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
