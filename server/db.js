const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'cafe.json');

function read() {
  if (!fs.existsSync(DB_FILE)) return { reservations: [], nextId: 1 };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function write(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function insertReservation(res) {
  const db  = read();
  const id  = db.nextId++;
  const now = new Date().toISOString();
  const record = { id, ...res, status: 'confirmed', created: now };
  db.reservations.push(record);
  write(db);
  return record;
}

function getReservations(filters = {}) {
  const { reservations } = read();
  return reservations
    .filter(r => {
      if (filters.date   && r.date   !== filters.date)   return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

function getReservationById(id) {
  return read().reservations.find(r => r.id === Number(id));
}

function cancelReservation(id) {
  const db = read();
  const r  = db.reservations.find(r => r.id === Number(id));
  if (r) { r.status = 'cancelled'; write(db); }
  return r;
}

function updateCalendarEventId(id, calendarEventId) {
  const db = read();
  const r  = db.reservations.find(r => r.id === Number(id));
  if (r) { r.calendar_event_id = calendarEventId; write(db); }
}

// Return number of tables booked in slots that overlap with the given time window
function getBookedTablesCount(date, time, endTime) {
  return read().reservations
    .filter(r => r.date === date && r.status !== 'cancelled')
    .filter(r => r.time < endTime && r.end_time > time)
    .reduce((sum, r) => sum + (r.tables_needed || 0), 0);
}

function getStats() {
  const today = new Date().toISOString().split('T')[0];
  const all   = read().reservations;
  return {
    todayCount:    all.filter(r => r.date === today && r.status === 'confirmed').length,
    todayGuests:   all.filter(r => r.date === today && r.status === 'confirmed').reduce((s, r) => s + r.party, 0),
    upcomingCount: all.filter(r => r.date >= today  && r.status === 'confirmed').length,
    totalCount:    all.filter(r => r.status === 'confirmed').length,
  };
}

module.exports = {
  insertReservation,
  getReservations,
  getReservationById,
  cancelReservation,
  updateCalendarEventId,
  getBookedTablesCount,
  getStats,
};
