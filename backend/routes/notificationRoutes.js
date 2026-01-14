import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendNotification } from '../services/notificationService.js';
import User from '../models/User.js';

const router = express.Router();

// Save FCM token
router.post('/save-token', protect, async (req, res) => {
  try {
    const { token, deviceInfo } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findById(req.user._id);

    // Check if token already exists
    const tokenExists = user.fcmTokens.find(t => t.token === token);

    if (!tokenExists) {
      user.fcmTokens.push({
        token,
        deviceInfo: deviceInfo || {},
        createdAt: new Date()
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Token saved successfully',
      deviceInfo: deviceInfo || {}
    });
  } catch (error) {
    console.error('Save token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send notification to current user
router.post('/send', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({ message: 'No FCM tokens found for this user' });
    }

    // Get all tokens for this user
    const tokens = user.fcmTokens.map(t => t.token);

    // Send notification
    const notification = {
      title: 'Welcome to Softzen.in',
      body: 'Your notification system is working perfectly! 🎉',
      icon: '/logo.png',
      badge: '/badge.png'
    };

    const result = await sendNotification(tokens, notification);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      result
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
});

// Get user's device info
router.get('/devices', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('fcmTokens');

    res.json({
      success: true,
      devices: user.fcmTokens.map(t => ({
        deviceInfo: t.deviceInfo,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test endpoint - Send notification to specific user (for testing without auth)
router.post('/send-to/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.fcmTokens || user.fcmTokens.length === 0) {
      return res.status(400).json({ message: 'No FCM tokens found for this user' });
    }

    const tokens = user.fcmTokens.map(t => t.token);

    const notification = {
      title: 'Test Notification 🔔',
      body: 'Ye notification backend se bheja gaya hai!',
      icon: '/logo.png',
      badge: '/badge.png',
      data: {
        timestamp: new Date().toISOString()
      }
    };

    const result = await sendNotification(tokens, notification);

    res.json({
      success: true,
      message: 'Notification sent successfully',
      result
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Failed to send notification', error: error.message });
  }
});

export default router;