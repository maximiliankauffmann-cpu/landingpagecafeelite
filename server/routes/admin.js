const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { getReservations, getReservationById, cancelReservation, getStats } = require('../db');
const { cancelReservationEvent } = require('../calendar');

function requireAuth(req, res, next) {
  const provided = req.headers['x-admin-password'] || '';
  const expected = process.env.ADMIN_PASSWORD     || '';

  // Constant-time comparison prevents timing attacks
  const match = provided.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

  if (!match) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.get('/reservations', requireAuth, (req, res) => {
  const { date, status } = req.query;
  res.json(getReservations({ date, status }));
});

router.get('/reservations/today', requireAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json(getReservations({ date: today, status: 'confirmed' }));
});

router.get('/stats', requireAuth, (req, res) => {
  res.json(getStats());
});

router.delete('/reservations/:id', requireAuth, async (req, res) => {
  const reservation = getReservationById(req.params.id);
  if (!reservation)                      return res.status(404).json({ error: 'Reservation not found.' });
  if (reservation.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled.' });

  if (reservation.calendar_event_id) {
    try { await cancelReservationEvent(reservation.calendar_event_id); }
    catch (err) { console.error('Calendar cancel error:', err.message); }
  }

  cancelReservation(req.params.id);
  res.json({ success: true });
});

module.exports = router;
