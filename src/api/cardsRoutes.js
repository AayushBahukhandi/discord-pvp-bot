import express from 'express';
import { CardService } from '../services/cardService.js';

const router = express.Router();

// GET /api/cards - Fetch cards with optional filters
router.get('/', async (req, res) => {
    try {
        const { anime, limit = 50 } = req.query;
        
        const result = await CardService.getCards(anime, parseInt(limit));
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
        res.json({
            success: true,
            data: result.data,
            count: result.data.length
        });
    } catch (error) {
        console.error('Cards API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/cards/:id - Get specific card by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await CardService.getCardById(id);
        
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }
        
        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Card API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/cards - Create new card
router.post('/', async (req, res) => {
    try {
        const { cardName, animeName, attack, defense, speed, imageUrl, rarity } = req.body;
        
        if (!cardName || !animeName || attack === undefined || defense === undefined || speed === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: cardName, animeName, attack, defense, speed'
            });
        }
        
        const result = await CardService.createCard({
            cardName,
            animeName,
            attack: parseInt(attack),
            defense: parseInt(defense),
            speed: parseInt(speed),
            imageUrl,
            rarity
        });
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
        res.status(201).json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Create card API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/cards/random/:count - Get random cards for battles
router.get('/random/:count', async (req, res) => {
    try {
        const { count = 5 } = req.params;
        
        const result = await CardService.getRandomCards(parseInt(count));
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Random cards API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
