const { getBookedTablesCount } = require('./db');
const { OPENING_HOURS, TOTAL_TABLES, SLOT_DURATION_MINUTES, SLOT_INTERVAL_MINUTES } = require('./config');

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function toTimeStr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isWithinOpeningHours(date, time) {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const hours     = OPENING_HOURS[dayOfWeek];
  if (!hours) return false;

  const requested = toMinutes(time);
  return hours.windows.some(w => {
    const open     = toMinutes(w.open);
    const lastSlot = toMinutes(w.close) - SLOT_DURATION_MINUTES;
    return requested >= open && requested <= lastSlot;
  });
}

function getAvailableTables(date, time) {
  const endTime = toTimeStr(toMinutes(time) + SLOT_DURATION_MINUTES);
  return TOTAL_TABLES - getBookedTablesCount(date, time, endTime);
}

function tablesNeeded(partySize) {
  return Math.ceil(partySize / 4);
}

function getSlotsForDate(date) {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const hours     = OPENING_HOURS[dayOfWeek];
  if (!hours) return { open: false, slots: [] };

  const slots = [];
  for (const w of hours.windows) {
    const openMin     = toMinutes(w.open);
    const lastSlotMin = toMinutes(w.close) - SLOT_DURATION_MINUTES;
    for (let t = openMin; t <= lastSlotMin; t += SLOT_INTERVAL_MINUTES) {
      const time       = toTimeStr(t);
      const tablesLeft = getAvailableTables(date, time);
      slots.push({ time, available: tablesLeft > 0, tablesLeft, maxPartySize: tablesLeft * 4 });
    }
  }

  // Build a display string, e.g. "09:00 – 13:00 & 15:00 – 19:00"
  const display = hours.windows.map(w => `${w.open} – ${w.close}`).join(' & ');

  return {
    open: true,
    hours: {
      open:    hours.windows[0].open,
      close:   hours.windows[hours.windows.length - 1].close,
      display,
    },
    slots,
  };
}

module.exports = { isWithinOpeningHours, getAvailableTables, tablesNeeded, getSlotsForDate, toTimeStr };
