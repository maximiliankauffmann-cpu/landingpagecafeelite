module.exports = {
  TOTAL_TABLES: 8,           // change to your actual number of tables
  SLOT_DURATION_MINUTES: 90, // how long each reservation holds a table

  OPENING_HOURS: {
    0: { open: '09:00', close: '15:00' }, // Sunday
    1: { open: '07:30', close: '18:00' }, // Monday
    2: { open: '07:30', close: '18:00' }, // Tuesday
    3: { open: '07:30', close: '18:00' }, // Wednesday
    4: { open: '07:30', close: '18:00' }, // Thursday
    5: { open: '07:30', close: '18:00' }, // Friday
    6: { open: '08:00', close: '17:00' }, // Saturday
  },

  SLOT_INTERVAL_MINUTES: 30, // offer a slot every 30 minutes
};
