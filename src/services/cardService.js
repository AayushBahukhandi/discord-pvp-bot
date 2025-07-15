import { supabase } from '../config/supabase.js';

export class CardService {
    
    // Fetch all cards with optional anime name filter and limit
    static async getCards(animeName = null, limit = 50) {
        try {
            let query = supabase
                .from('anime_cards')
                .select('*');
            
            if (animeName) {
                query = query.ilike('anime_name', `%${animeName}%`);
            }
            
            query = query.limit(limit).order('created_at', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) {
                throw error;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching cards:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get specific card by ID
    static async getCardById(cardId) {
        try {
            const { data, error } = await supabase
                .from('anime_cards')
                .select('*')
                .eq('id', cardId)
                .single();
            
            if (error) {
                throw error;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching card:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Create new card
    static async createCard(cardData) {
        try {
            const { data, error } = await supabase
                .from('anime_cards')
                .insert([{
                    card_name: cardData.cardName,
                    anime_name: cardData.animeName,
                    attack: cardData.attack,
                    defense: cardData.defense,
                    speed: cardData.speed,
                    card_image_url: cardData.imageUrl,
                    rarity: cardData.rarity || 'common',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) {
                throw error;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Error creating card:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Get random cards for battles
    static async getRandomCards(count = 5) {
        try {
            // Get total count first
            const { count: totalCount } = await supabase
                .from('anime_cards')
                .select('*', { count: 'exact', head: true });
            
            if (totalCount === 0) {
                return { success: true, data: [] };
            }
            
            // Generate random offsets
            const randomOffsets = [];
            for (let i = 0; i < Math.min(count, totalCount); i++) {
                randomOffsets.push(Math.floor(Math.random() * totalCount));
            }
            
            const promises = randomOffsets.map(offset => 
                supabase
                    .from('anime_cards')
                    .select('*')
                    .range(offset, offset)
                    .single()
            );
            
            const results = await Promise.all(promises);
            const cards = results
                .filter(result => !result.error)
                .map(result => result.data);
            
            return { success: true, data: cards };
        } catch (error) {
            console.error('Error fetching random cards:', error);
            return { success: false, error: error.message };
        }
    }
}
