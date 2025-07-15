import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { UserService } from '../services/userService.js';

export const data = new SlashCommandBuilder()
    .setName('cards')
    .setDescription('View your anime card collection')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('View another user\'s card collection')
            .setRequired(false))
    .addIntegerOption(option =>
        option.setName('page')
            .setDescription('Page number (each page shows 5 cards)')
            .setMinValue(1)
            .setRequired(false));

export async function execute(interaction) {
    try {
        await interaction.deferReply();
        
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page') || 1;
        const cardsPerPage = 5;
        
        // Get user's card collection
        const cardsResult = await UserService.getUserCards(targetUser.id, page, cardsPerPage);
        
        if (!cardsResult.success) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Error ❌')
                .setDescription(`Could not fetch card collection for ${targetUser.username}.`)
                .addFields(
                    { name: 'Reason', value: cardsResult.error || 'User might not be registered', inline: false }
                );
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const { cards, totalCards, totalPages } = cardsResult.data;
        
        if (totalCards === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle(`${targetUser.username}'s Card Collection 🃏`)
                .setDescription('No cards found. Use `/register` to get started with 5 free cards!')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));
            
            return await interaction.editReply({ embeds: [embed] });
        }
        
        const cardFields = cards.map((userCard, index) => {
            const card = userCard.anime_cards;
            const cardNumber = (page - 1) * cardsPerPage + index + 1;
            const rarity = card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : 'Common';
            const rarityEmoji = {
                'Common': '⚪',
                'Uncommon': '🟢', 
                'Rare': '🔵',
                'Epic': '🟣',
                'Legendary': '🟡'
            }[rarity] || '⚪';
            
            return {
                name: `${cardNumber}. ${card.card_name} ${rarityEmoji}`,
                value: `📺 **${card.anime_name}**\n⚔️ ATK: ${card.attack} | 🛡️ DEF: ${card.defense} | ⚡ SPD: ${card.speed}\n🔢 Quantity: ${userCard.quantity}`,
                inline: true
            };
        });
        
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${targetUser.username}'s Card Collection 🃏`)
            .setDescription(`Showing page ${page} of ${totalPages} (${totalCards} total cards)`)
            .addFields(cardFields)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ 
                text: totalPages > 1 ? `Use /cards page:${page + 1} for next page` : 'End of collection'
            })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
    } catch (error) {
        console.error('Error in cards command:', error);
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('Error ❌')
            .setDescription('Failed to fetch card collection. Please try again later.');
        
        if (interaction.deferred) {
            await interaction.editReply({ embeds: [embed] });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
