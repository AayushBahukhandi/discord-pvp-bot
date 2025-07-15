import { supabase } from '../config/supabase.js';

export class UserService {
    
    // Register or update user from Discord
    static async registerUser(discordUserData) {
        try {
            const userData = {
                discord_id: discordUserData.id,
                username: discordUserData.username,
                display_name: discordUserData.displayName || discordUserData.username,
                avatar_url: discordUserData.displayAvatarURL ? discordUserData.displayAvatarURL() : null,
                joined_at: discordUserData.joinedAt ? new Date(discordUserData.joinedAt).toISOString() : null,
                account_created: new Date(discordUserData.createdTimestamp).toISOString(),
                last_seen: new Date().toISOString()
            };
            
            // Use upsert to handle both new users and existing users
            const { data, error } = await supabase
                .from('users')
                .upsert([userData], { 
                    onConflict: 'discord_id',
                    ignoreDuplicates: false 
                })
                .select()
                .single();
            
            if (error) {
                throw error;
            }
            
            // Initialize user stats if new user
            await this.initializeUserStats(data.id);
            
            return { success: true, data };
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Initialize user stats
    static async initializeUserStats(userId) {
        try {
            const { data: existingStats } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (!existingStats) {
                const { error } = await supabase
                    .from('user_stats')
                    .insert([{
                        user_id: userId,
                        battles_won: 0,
                        battles_lost: 0,
                        cards_collected: 0,
                        experience_points: 0,
                        level: 1,
                        coins: 100, // Starting coins
                        created_at: new Date().toISOString()
                    }]);
                
                if (error) {
                    throw error;
                }
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error initializing user stats:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Give starter cards to new user
    static async giveStarterCards(discordId) {
        try {
            // Get user ID from discord ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('discord_id', discordId)
                .single();
            
            if (userError) {
                throw userError;
            }
            
            // Check if user already has cards
            const { data: existingCards } = await supabase
                .from('user_cards')
                .select('*')
                .eq('user_id', user.id);
            
            if (existingCards && existingCards.length > 0) {
                return { success: false, error: 'User already has cards' };
            }
            
            // Get starter cards (5 random cards or predefined starter set)
            const { data: availableCards, error: cardsError } = await supabase
                .from('anime_cards')
                .select('*')
                .limit(100); // Get more cards to choose from
            
            if (cardsError || !availableCards || availableCards.length === 0) {
                // If no cards in database, create default starter cards
                return await this.createDefaultStarterCards(user.id);
            }
            
            // Select 5 random cards from available cards
            const shuffled = availableCards.sort(() => 0.5 - Math.random());
            const starterCards = shuffled.slice(0, 5);
            
            // Add cards to user's collection
            const userCardsData = starterCards.map(card => ({
                user_id: user.id,
                card_id: card.id,
                quantity: 1,
                acquired_at: new Date().toISOString()
            }));
            
            const { data: insertedCards, error: insertError } = await supabase
                .from('user_cards')
                .insert(userCardsData)
                .select();
            
            if (insertError) {
                throw insertError;
            }
            
            // Update user stats - cards collected
            await supabase
                .from('user_stats')
                .update({ 
                    cards_collected: 5,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);
            
            return { 
                success: true, 
                cards: starterCards, // Return the original cards since join might not work
                message: 'Starter cards assigned successfully!'
            };
            
        } catch (error) {
            console.error('Error giving starter cards:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Create default starter cards if none exist in database
    static async createDefaultStarterCards(userId) {
        try {
            const defaultCards = [
                { card_name: 'Naruto Uzumaki', anime_name: 'Naruto', attack: 800, defense: 650, speed: 900, rarity: 'epic' },
                { card_name: 'Monkey D. Luffy', anime_name: 'One Piece', attack: 850, defense: 700, speed: 750, rarity: 'epic' },
                { card_name: 'Saitama', anime_name: 'One Punch Man', attack: 1000, defense: 500, speed: 600, rarity: 'legendary' },
                { card_name: 'Izuku Midoriya', anime_name: 'My Hero Academia', attack: 750, defense: 800, speed: 800, rarity: 'rare' },
                { card_name: 'Yuji Itadori', anime_name: 'Jujutsu Kaisen', attack: 700, defense: 750, speed: 850, rarity: 'rare' }
            ];
            
            // Create cards in database
            const { data: createdCards, error: createError } = await supabase
                .from('anime_cards')
                .upsert(defaultCards, { 
                    onConflict: 'card_name,anime_name',
                    ignoreDuplicates: false 
                })
                .select();
            
            if (createError) {
                throw createError;
            }
            
            // Add cards to user's collection
            const userCardsData = createdCards.map(card => ({
                user_id: userId,
                card_id: card.id,
                quantity: 1,
                acquired_at: new Date().toISOString()
            }));
            
            const { error: insertError } = await supabase
                .from('user_cards')
                .insert(userCardsData);
            
            if (insertError) {
                throw insertError;
            }
            
            // Update user stats
            await supabase
                .from('user_stats')
                .update({ 
                    cards_collected: 5,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
            
            return { 
                success: true, 
                cards: createdCards,
                message: 'Default starter cards created and assigned!'
            };
            
        } catch (error) {
            console.error('Error creating default starter cards:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get user's card collection with pagination
    static async getUserCards(discordId, page = 1, limit = 5) {
        try {
            const offset = (page - 1) * limit;
            
            // Get user ID
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('discord_id', discordId)
                .single();
            
            if (userError) {
                throw userError;
            }
            
            // Get total count
            const { count, error: countError } = await supabase
                .from('user_cards')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            
            if (countError) {
                throw countError;
            }
            
            // Try to get paginated cards with join first
            let userCards;
            const { data: joinedCards, error: joinError } = await supabase
                .from('user_cards')
                .select(`
                    *,
                    anime_cards (*)
                `)
                .eq('user_id', user.id)
                .order('acquired_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (joinError) {
                // If join fails, get cards separately
                const { data: userCardsOnly, error: cardsError } = await supabase
                    .from('user_cards')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('acquired_at', { ascending: false })
                    .range(offset, offset + limit - 1);
                
                if (cardsError) {
                    throw cardsError;
                }
                
                // Get card details separately
                userCards = [];
                for (const userCard of userCardsOnly) {
                    const { data: cardData, error: cardError } = await supabase
                        .from('anime_cards')
                        .select('*')
                        .eq('id', userCard.card_id)
                        .single();
                    
                    if (!cardError && cardData) {
                        userCards.push({
                            ...userCard,
                            anime_cards: cardData
                        });
                    }
                }
            } else {
                userCards = joinedCards;
            }
            
            const totalPages = Math.ceil(count / limit);
            
            return {
                success: true,
                data: {
                    cards: userCards || [],
                    totalCards: count || 0,
                    currentPage: page,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
            
        } catch (error) {
            console.error('Error getting user cards:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get user profile with stats
    static async getUserProfile(discordId) {
        try {
            // First, try the join query
            const { data: user, error: userError } = await supabase
                .from('users')
                .select(`
                    *,
                    user_stats (*)
                `)
                .eq('discord_id', discordId)
                .single();
            
            if (userError) {
                // If join fails, try separate queries
                const { data: userData, error: userOnlyError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('discord_id', discordId)
                    .single();
                
                if (userOnlyError) {
                    throw userOnlyError;
                }
                
                // Get stats separately
                const { data: statsData, error: statsError } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', userData.id)
                    .single();
                
                // Combine data manually
                return { 
                    success: true, 
                    data: {
                        ...userData,
                        user_stats: statsData ? [statsData] : []
                    }
                };
            }
            
            return { success: true, data: user };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update user stats after battle
    static async updateUserStats(discordId, battleResult) {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('id')
                .eq('discord_id', discordId)
                .single();
            
            if (!user) {
                throw new Error('User not found');
            }
            
            const { data: currentStats } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            const updates = {
                battles_won: currentStats.battles_won + (battleResult.won ? 1 : 0),
                battles_lost: currentStats.battles_lost + (battleResult.won ? 0 : 1),
                experience_points: currentStats.experience_points + battleResult.expGained,
                coins: currentStats.coins + battleResult.coinsGained,
                updated_at: new Date().toISOString()
            };
            
            // Calculate level based on experience
            updates.level = Math.floor(updates.experience_points / 100) + 1;
            
            const { data, error } = await supabase
                .from('user_stats')
                .update(updates)
                .eq('user_id', user.id)
                .select()
                .single();
            
            if (error) {
                throw error;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Error updating user stats:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get leaderboard
    static async getLeaderboard(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select(`
                    username,
                    display_name,
                    avatar_url,
                    user_stats (
                        battles_won,
                        battles_lost,
                        experience_points,
                        level,
                        coins
                    )
                `)
                .order('user_stats.experience_points', { ascending: false })
                .limit(limit);
            
            if (error) {
                throw error;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return { success: false, error: error.message };
        }
    }
}
