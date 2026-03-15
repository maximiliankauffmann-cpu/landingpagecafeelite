module.exports = {
  // Define each table with a unique id and how many seats it has.
  // Example: 5 tables of 8 seats + 3 tables of 2 seats
  TOTAL_TABLES: 8,

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
