import admin from '../config/firebase.js';

export const sendNotification = async (tokens, notification) => {
  try {
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

    // ✅ data values must be strings
    const dataPayload = {};
    if (notification.data) {
      for (const key in notification.data) {
        dataPayload[key] = String(notification.data[key]);
      }
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: dataPayload,
      webpush: {
        fcmOptions: {
          link: process.env.FRONTEND_URL || 'http://localhost:5173'
        },
        notification: {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/default-icon.png',
          badge: '/badge.png'
        }
      }
    };

    // 🔹 MULTIPLE TOKENS
    if (tokenArray.length > 1) {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokenArray,
        ...message
      });

      console.log('✅ Sent:', response.successCount);
      console.log('❌ Failed:', response.failureCount);

      return {
        success: response.successCount,
        failed: response.failureCount,
        responses: response.responses
      };
    }

    // 🔹 SINGLE TOKEN
    const response = await admin.messaging().send({
      token: tokenArray[0],
      ...message
    });

    console.log('✅ Notification sent:', response);

    return {
      success: 1,
      failed: 0,
      messageId: response
    };

  } catch (error) {
    console.error('❌ FCM Error:', error);
    throw new Error('Failed to send notification: ' + error.message);
  }
};
