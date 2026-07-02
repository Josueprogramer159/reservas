import pool from '../db/database.js';
import webpush from 'web-push';

// Configurar VAPID keys (generadas para demo)
const VAPID_PUBLIC_KEY = 'BCqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQqHqQ=';
const VAPID_PRIVATE_KEY = 'your-private-key-here';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_PRIVATE_KEY !== 'your-private-key-here') {
  webpush.setVapidDetails(
    'mailto:contacto@ejemplo.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * Suscribir un usuario a notificaciones push
 */
export const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const usuarioId = req.session.userId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const endpoint = subscription.endpoint;
    const keys = subscription.keys || {};
    const p256dh = keys.p256dh;
    const auth = keys.auth;

    // Verificar si ya existe la suscripción
    const existing = await pool.query(
      'SELECT id FROM user_push_subscriptions WHERE usuario_id = $1 AND endpoint = $2',
      [usuarioId, endpoint]
    );

    if (existing.rows.length > 0) {
      // Actualizar suscripción existente
      await pool.query(
        `UPDATE user_push_subscriptions 
         SET p256dh = $1, auth = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [p256dh, auth, existing.rows[0].id]
      );
    } else {
      // Insertar nueva suscripción
      await pool.query(
        `INSERT INTO user_push_subscriptions 
         (usuario_id, endpoint, p256dh, auth, user_agent) 
         VALUES ($1, $2, $3, $4, $5)`,
        [usuarioId, endpoint, p256dh, auth, req.headers['user-agent']]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al suscribir:', error);
    res.status(500).json({ success: false, message: 'Error al suscribir a notificaciones' });
  }
};

/**
 * Desuscribir un usuario de notificaciones push
 */
export const unsubscribe = async (req, res) => {
  try {
    const usuarioId = req.session.userId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    await pool.query('DELETE FROM user_push_subscriptions WHERE usuario_id = $1', [usuarioId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al desuscribir:', error);
    res.status(500).json({ success: false, message: 'Error al desuscribir' });
  }
};

/**
 * Obtener preferencias de notificaciones
 */
export const getPreferences = async (req, res) => {
  try {
    const usuarioId = req.session.userId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const user = await pool.query('SELECT notificaciones_activas FROM usuarios WHERE id = $1', [usuarioId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, notificaciones_activas: user.rows[0].notificaciones_activas });
  } catch (error) {
    console.error('Error al obtener preferencias:', error);
    res.status(500).json({ success: false, message: 'Error al obtener preferencias' });
  }
};

/**
 * Actualizar preferencias de notificaciones
 */
export const updatePreferences = async (req, res) => {
  try {
    const { notificaciones_activas } = req.body;
    const usuarioId = req.session.userId;

    if (!usuarioId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    await pool.query(
      'UPDATE usuarios SET notificaciones_activas = $1 WHERE id = $2',
      [notificaciones_activas, usuarioId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar preferencias' });
  }
};

/**
 * Enviar notificación push a un usuario
 */
export const sendNotificationToUser = async (usuarioId, notificationData) => {
  try {
    // Verificar si el usuario tiene notificaciones activas
    const user = await pool.query('SELECT notificaciones_activas FROM usuarios WHERE id = $1', [usuarioId]);
    if (user.rows.length === 0 || !user.rows[0].notificaciones_activas) {
      console.log('📢 Notificaciones desactivadas para el usuario:', usuarioId);
      return;
    }

    // Obtener suscripciones del usuario
    const subscriptions = await pool.query(
      'SELECT * FROM user_push_subscriptions WHERE usuario_id = $1',
      [usuarioId]
    );

    if (subscriptions.rows.length === 0) {
      console.log('📢 No hay suscripciones para el usuario:', usuarioId);
      return;
    }

    // Enviar a todas las suscripciones
    for (const sub of subscriptions.rows) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationData)
        );
        console.log('✅ Notificación enviada a:', sub.endpoint);
      } catch (sendErr) {
        console.error('❌ Error al enviar notificación:', sendErr);
        // Si el error es 410 (Gone), eliminar la suscripción
        if (sendErr.statusCode === 410) {
          await pool.query('DELETE FROM user_push_subscriptions WHERE id = $1', [sub.id]);
        }
      }
    }
  } catch (error) {
    console.error('Error general al enviar notificación:', error);
  }
};

export default {
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences,
  sendNotificationToUser
};
