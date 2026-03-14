const { google } = require('googleapis');
const { SLOT_DURATION_MINUTES } = require('./config');

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

async function createReservationEvent({ name, email, date, time, party, message }) {
  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime   = new Date(startDateTime.getTime() + SLOT_DURATION_MINUTES * 60000);

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary:     `Reservation — ${name} (${party} guests)`,
      description: message || '',
      start: { dateTime: startDateTime.toISOString(), timeZone: 'Europe/Berlin' },
      end:   { dateTime: endDateTime.toISOString(),   timeZone: 'Europe/Berlin' },
      attendees: [{ email }],
      colorId: '2', // green
    },
  });

  return event.data.id;
}

async function cancelReservationEvent(eventId) {
  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    eventId,
  });
}

module.exports = { createReservationEvent, cancelReservationEvent };
