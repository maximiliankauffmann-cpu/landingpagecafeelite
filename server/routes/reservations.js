const express = require('express');
const router  = express.Router();
const { insertReservation, updateCalendarEventId } = require('../db');
const { isWithinOpeningHours, getAvailableTables, tablesNeeded, toTimeStr } = require('../availability');
const { createReservationEvent } = require('../calendar');
const { SLOT_DURATION_MINUTES } = require('../config');

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate time format HH:MM
function isValidTime(time) {
  return /^\d{2}:\d{2}$/.test(time);
}

// Validate date format YYYY-MM-DD and not in the past
function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const today = new Date().toISOString().split('T')[0];
  return date >= today;
}

router.post('/', async (req, res) => {
  const { name, email, date, time, party, message } = req.body;

  // Presence check
  if (!name || !email || !date || !time || !party) {
    return res.status(400).json({ error: 'missing_fields', message: 'Please fill in all required fields.' });
  }

  // Type and length validation
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ error: 'invalid_name', message: 'Please enter a valid name.' });
  }
  if (!isValidEmail(email) || email.length > 200) {
    return res.status(400).json({ error: 'invalid_email', message: 'Please enter a valid email address.' });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'invalid_date', message: 'Please enter a valid date (not in the past).' });
  }
  if (!isValidTime(time)) {
    return res.status(400).json({ error: 'invalid_time', message: 'Please select a valid time.' });
  }

  const partyNum = Number(party);
  if (!Number.isInteger(partyNum) || partyNum < 1 || partyNum > 50) {
    return res.status(400).json({ error: 'invalid_party', message: 'Party size must be between 1 and 50.' });
  }
  if (message && (typeof message !== 'string' || message.length > 500)) {
    return res.status(400).json({ error: 'invalid_message', message: 'Message must be under 500 characters.' });
  }

  // Business logic checks
  if (!isWithinOpeningHours(date, time)) {
    return res.status(400).json({
      error: 'outside_hours',
      message: 'We are not open at that time. Please choose a time within our opening hours.',
    });
  }

  const needed    = tablesNeeded(partyNum);
  const available = getAvailableTables(date, time);
  if (available < needed) {
    return res.status(409).json({
      error: 'no_availability',
      message: 'Sorry, we are fully booked at that time. Please choose a different slot.',
    });
  }

  const [h, m]  = time.split(':').map(Number);
  const endTime = toTimeStr(h * 60 + m + SLOT_DURATION_MINUTES);

  const record = insertReservation({
    name:          name.trim(),
    email:         email.trim().toLowerCase(),
    date,
    time,
    end_time:      endTime,
    party:         partyNum,
    tables_needed: needed,
    message:       (message || '').trim(),
  });

  try {
    const eventId = await createReservationEvent({ name, email, date, time, party, message });
    updateCalendarEventId(record.id, eventId);
  } catch (err) {
    console.error('Google Calendar error:', err.message);
  }

  res.json({ success: true });
});

module.exports = router;
