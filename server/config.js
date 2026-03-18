module.exports = {
  TOTAL_TABLES: 8,

  SLOT_DURATION_MINUTES: 90, // how long each reservation holds a table

  // Each day uses a "windows" array to support split opening hours (e.g. lunch break).
  // Set a day to null to mark it as closed.
  OPENING_HOURS: {
    0: { windows: [{ open: '10:00', close: '13:00' }, { open: '15:00', close: '19:00' }] }, // Sunday
    1: { windows: [{ open: '15:00', close: '18:00' }] },                                     // Monday
    2: null,                                                                                   // Tuesday — closed
    3: { windows: [{ open: '09:00', close: '13:00' }, { open: '15:00', close: '19:00' }] }, // Wednesday
    4: { windows: [{ open: '09:00', close: '13:00' }, { open: '15:00', close: '19:00' }] }, // Thursday
    5: { windows: [{ open: '09:00', close: '13:00' }, { open: '15:00', close: '19:00' }] }, // Friday
    6: { windows: [{ open: '09:00', close: '13:00' }, { open: '15:00', close: '20:00' }] }, // Saturday
  },

  SLOT_INTERVAL_MINUTES: 30, // offer a slot every 30 minutes
};
