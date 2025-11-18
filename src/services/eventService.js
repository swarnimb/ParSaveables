import * as db from './databaseService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('EventService');

/**
 * Assign event (season or tournament) to a scorecard based on date
 *
 * Prioritizes tournaments over seasons when both match the date
 *
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Event object with {id, name, type, points_system_id, ...}
 * @throws {Error} If no active event found for date
 */
export async function assignEvent(dateString) {
  logger.info('Assigning event for date', { date: dateString });

  // Validate date format
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    logger.error('Invalid date format', { date: dateString });
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }

  // Find matching event from database
  const event = await db.findEventByDate(dateString);

  if (!event) {
    logger.error('No active event found for date', { date: dateString });
    throw new Error(
      `No active season or tournament found for date ${dateString}. ` +
      'Please create an event in the admin panel that covers this date range.'
    );
  }

  // Validate event has points system linked
  if (!event.points_system_id) {
    logger.error('Event missing points system', {
      eventId: event.id,
      eventName: event.name
    });
    throw new Error(
      `Event "${event.name}" does not have a points system configured. ` +
      'Please link a points system in the admin panel.'
    );
  }

  logger.info('Event assigned', {
    eventId: event.id,
    eventName: event.name,
    eventType: event.type,
    pointsSystemId: event.points_system_id
  });

  return event;
}

export default {
  assignEvent
};
