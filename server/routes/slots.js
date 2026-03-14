const express = require('express');
const router  = express.Router();
const { getSlotsForDate } = require('../availability');

// GET /api/slots?date=2024-03-16
router.get('/', (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Provide a date in YYYY-MM-DD format.' });
  }

  // Don't allow booking in the past
  const today = new Date().toISOString().split('T')[0];
  if (date < today) {
    return res.status(400).json({ error: 'Cannot book a date in the past.' });
  }

  const result = getSlotsForDate(date);
  res.json({ date, ...result });
});

module.exports = router;
