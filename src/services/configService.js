import * as db from './databaseService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ConfigService');

/**
 * Load complete scoring configuration for an event
 * Includes points system config and course data
 *
 * @param {Object} event - Event object with points_system_id
 * @param {string} courseName - Course name from scorecard
 * @returns {Promise<Object>} Complete configuration object
 */
export async function loadConfiguration(event, courseName) {
  logger.info('Loading configuration', {
    eventId: event.id,
    eventName: event.name,
    courseName
  });

  // Load points system configuration
  const pointsSystem = await db.getPointsSystem(event.points_system_id);

  // Load all courses
  const courses = await db.getCourses();

  // Find matching course (case-insensitive, partial match)
  const course = findCourse(courses, courseName);

  const configuration = {
    event: {
      id: event.id,
      name: event.name,
      type: event.type,
      year: event.year
    },
    pointsSystem: {
      id: pointsSystem.id,
      name: pointsSystem.name,
      config: pointsSystem.config
    },
    course: course || {
      course_name: courseName,
      tier: 2, // Default tier
      multiplier: 1.0, // Default multiplier
      active: false,
      isDefault: true
    },
    courses: courses // All courses for reference
  };

  logger.info('Configuration loaded', {
    pointsSystemName: pointsSystem.name,
    courseName: course ? course.course_name : `${courseName} (default)`,
    courseMultiplier: configuration.course.multiplier
  });

  return configuration;
}

/**
 * Find course by name with fuzzy matching
 *
 * @param {Array<Object>} courses - List of course objects
 * @param {string} courseName - Course name to find
 * @returns {Object|null} Matched course or null
 */
function findCourse(courses, courseName) {
  if (!courseName) {
    return null;
  }

  const normalizedInput = courseName.toLowerCase().trim();

  // Try exact match first
  for (const course of courses) {
    if (course.course_name.toLowerCase() === normalizedInput) {
      logger.info('Exact course match found', { course: course.course_name });
      return course;
    }
  }

  // Try partial match (input contains course name or vice versa)
  for (const course of courses) {
    const normalizedCourse = course.course_name.toLowerCase();

    if (
      normalizedInput.includes(normalizedCourse) ||
      normalizedCourse.includes(normalizedInput)
    ) {
      logger.info('Partial course match found', {
        input: courseName,
        matched: course.course_name
      });
      return course;
    }
  }

  logger.warn('No course match found', { input: courseName });
  return null;
}

export default {
  loadConfiguration
};
