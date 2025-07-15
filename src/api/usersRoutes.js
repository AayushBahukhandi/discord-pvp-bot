import express from 'express';
import { UserService } from '../services/userService.js';

const router = express.Router();

// POST /api/users/register - Register user from Discord
router.post('/register', async (req, res) => {
    try {
        const { discordUserData } = req.body;
        
        if (!discordUserData || !discordUserData.id) {
            return res.status(400).json({
                success: false,
                error: 'Missing Discord user data'
            });
        }
        
        const result = await UserService.registerUser(discordUserData);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
        res.status(201).json({
            success: true,
            data: result.data,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('User registration API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/users/profile/:discordId - Get user profile with stats
router.get('/profile/:discordId', async (req, res) => {
    try {
        const { discordId } = req.params;
        
        const result = await UserService.getUserProfile(discordId);
        
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
        console.error('User profile API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// PUT /api/users/stats/:discordId - Update user stats after battle
router.put('/stats/:discordId', async (req, res) => {
    try {
        const { discordId } = req.params;
        const { battleResult } = req.body;
        
        if (!battleResult) {
            return res.status(400).json({
                success: false,
                error: 'Missing battle result data'
            });
        }
        
        const result = await UserService.updateUserStats(discordId, battleResult);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
        res.json({
            success: true,
            data: result.data,
            message: 'User stats updated successfully'
        });
    } catch (error) {
        console.error('Update user stats API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/users/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const result = await UserService.getLeaderboard(parseInt(limit));
        
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
        console.error('Leaderboard API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// GET /api/users/cards/:discordId - Get user's card collection
router.get('/cards/:discordId', async (req, res) => {
    try {
        const { discordId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const result = await UserService.getUserCards(discordId, parseInt(page), parseInt(limit));
        
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
        console.error('User cards API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// POST /api/users/starter-cards/:discordId - Give starter cards to user
router.post('/starter-cards/:discordId', async (req, res) => {
    try {
        const { discordId } = req.params;
        
        const result = await UserService.giveStarterCards(discordId);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        
        res.status(201).json({
            success: true,
            data: result.cards,
            message: result.message
        });
    } catch (error) {
        console.error('Starter cards API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;
