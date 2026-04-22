import { google } from 'googleapis';

// Definimos el alcance (scope): Queremos poder leer y escribir eventos
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Inicializamos la autenticación de nuestro "Empleado Virtual" (Bot)
/* const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CALENDAR_CREDENTIALS as string),
    scopes: SCOPES,
}); */

/* const calendar = google.calendar({ version: 'v3', auth }); */

// 👇 AQUÍ PON EL CORREO DEL CALENDARIO AL QUE EL BOT LE DIÓ PERMISOS
const CALENDAR_ID = 'spec.meet@gmail.com'; 

export const createReservationEvent = async (reserva: {
    summary: string;
    description: string;
    startTime: Date;
    endTime: Date;
}) => {
    try {
        const event = {
            summary: reserva.summary,
            description: reserva.description,
            start: {
                dateTime: reserva.startTime.toISOString(),
                timeZone: 'America/Mexico_City', // Zona horaria local
            },
            end: {
                dateTime: reserva.endTime.toISOString(),
                timeZone: 'America/Mexico_City',
            }
            // ❌ Quitamos el bloque de 'attendees'
        };

        const response = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: event,
            // ❌ Quitamos el 'sendUpdates'
        });

        console.log(`✅ Evento creado en Google Calendar: ${response.data.htmlLink}`);
        return response.data.id; 
        
    } catch (error) {
        console.error('❌ Error creando el evento en Calendar:', error);
        return null;
    }
};

export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
    try {
        await calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: eventId,
        });
        console.log(`🗑️ Evento ${eventId} eliminado del calendario`);
    } catch (error) {
        console.error('❌ Error eliminando evento del calendario:', error);
    }
};