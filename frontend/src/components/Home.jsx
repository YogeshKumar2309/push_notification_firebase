import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission, onMessageListener } from '../services/firebase';
import { saveFCMToken, sendTestNotification, getUserDevices } from '../services/api';

const Home = () => {
  const { user, logoutUser } = useAuth();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [devices, setDevices] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeNotifications();
    loadDevices();

    // Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body
        });
        setTimeout(() => setNotification(null), 5000);
      })
      .catch((err) => console.log('Notification listener error:', err));
  }, []);

  const initializeNotifications = async () => {
    const token = await requestNotificationPermission();

    if (token) {
      const info = getDeviceInfo();
      setDeviceInfo(info);

      // Save token to backend
      try {
        await saveFCMToken(token, info);
        console.log('✅ Token saved to backend');
      } catch (error) {
        console.error('❌ Failed to save token:', error);
      }
    }
  };

  const loadDevices = async () => {
    try {
      const response = await getUserDevices();
      setDevices(response.devices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
      browser,
      os,
      device: /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop',
      userAgent: ua
    };
  };

  const handleSendNotification = async () => {
    setLoading(true);
    try {
      const response = await sendTestNotification();
      alert('✅ Notification sent! Check your device.');
      console.log('Notification response:', response);
    } catch (error) {
      alert('❌ Failed to send notification: ' + error.message);
      console.error('Notification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome to Softzen.in</h1>
        <button onClick={logoutUser} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {notification && (
        <div style={styles.notification}>
          <strong>{notification.title}</strong>
          <p>{notification.body}</p>
        </div>
      )}

      <div style={styles.card}>
        <h2>👋 Hello, {user?.name}!</h2>
        <p style={styles.email}>{user?.email}</p>

        <button 
          onClick={handleSendNotification} 
          disabled={loading}
          style={styles.notifyBtn}
        >
          {loading ? 'Sending...' : '🔔 Send Test Notification'}
        </button>
      </div>

      {deviceInfo && (
        <div style={styles.card}>
          <h3>📱 Current Device Information</h3>
          <div style={styles.deviceInfo}>
            <div style={styles.infoRow}>
              <strong>Browser:</strong> {deviceInfo.browser}
            </div>
            <div style={styles.infoRow}>
              <strong>Operating System:</strong> {deviceInfo.os}
            </div>
            <div style={styles.infoRow}>
              <strong>Device Type:</strong> {deviceInfo.device}
            </div>
            <div style={styles.infoRow}>
              <strong>User Agent:</strong>
              <p style={styles.userAgent}>{deviceInfo.userAgent}</p>
            </div>
          </div>
        </div>
      )}

      {devices.length > 0 && (
        <div style={styles.card}>
          <h3>📲 All Registered Devices ({devices.length})</h3>
          {devices.map((device, index) => (
            <div key={index} style={styles.deviceItem}>
              <div>
                <strong>{device.deviceInfo?.device || 'Unknown'}</strong> - {device.deviceInfo?.browser || 'Unknown Browser'}
              </div>
              <div style={styles.deviceDate}>
                {new Date(device.createdAt).toLocaleDateString()} at {new Date(device.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <p>Push notifications are enabled! 🎉</p>
        <p style={styles.footerText}>Close this tab and you'll still receive notifications</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  title: {
    color: '#333',
    fontSize: '28px'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  notification: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    color: '#155724',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  email: {
    color: '#666',
    marginTop: '5px'
  },
  notifyBtn: {
    marginTop: '20px',
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%'
  },
  deviceInfo: {
    marginTop: '15px'
  },
  infoRow: {
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  userAgent: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
    wordBreak: 'break-all'
  },
  deviceItem: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    marginTop: '10px'
  },
  deviceDate: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px'
  },
  footerText: {
    color: '#666',
    fontSize: '14px'
  }
};

export default Home;