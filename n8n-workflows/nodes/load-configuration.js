/**
 * LOAD CONFIGURATION NODE
 *
 * PURPOSE: Fetch configuration from database for Calculate Points node
 * QUERIES:
 *   1. Courses table (all active courses with tiers/multipliers)
 *   2. Points system config from event (already includes JOIN to points_systems)
 *
 * OUTPUT: Configuration object for downstream nodes
 *
 * @version 1.0.0
 * @date 2025-10-23
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = 'https://bcovevbtcdsgzbrieiin.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjb3ZldmJ0Y2RzZ3picmllaWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA3OTEsImV4cCI6MjA3NjIwNjc5MX0.etzrLL8yw4n_NUdYnr_bdcrKphW67dYln8CjR54NSLA';

// ============================================================================
// GET EVENT FROM PREVIOUS NODE
// ============================================================================

/**
 * Get event from "Determine Event" node
 * This includes event.id and event.points_system_id
 */
const event = $('Determine Event').item.json;

if (!event || !event.id) {
  throw new Error('[Load Configuration] No event found from Determine Event node');
}

console.log(`Loading configuration for event: ${event.name} (${event.type})`);

// ============================================================================
// FETCH COURSES FROM DATABASE
// ============================================================================

/**
 * Query all active courses
 * These are used for course multiplier lookups
 */
const coursesResponse = await fetch(
  `${supabaseUrl}/rest/v1/courses?active=eq.true&select=*`,
  {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  }
);

if (!coursesResponse.ok) {
  throw new Error(`[Load Configuration] Failed to fetch courses: ${coursesResponse.statusText}`);
}

const courses = await coursesResponse.json();
console.log(`Loaded ${courses.length} active courses from database`);

// ============================================================================
// FETCH POINTS SYSTEM FROM DATABASE
// ============================================================================

/**
 * Query points system configuration
 * This is linked via event.points_system_id
 */
if (!event.points_system_id) {
  throw new Error(`[Load Configuration] Event "${event.name}" has no points_system_id configured`);
}

const pointsSystemResponse = await fetch(
  `${supabaseUrl}/rest/v1/points_systems?id=eq.${event.points_system_id}&select=*`,
  {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  }
);

if (!pointsSystemResponse.ok) {
  throw new Error(`[Load Configuration] Failed to fetch points system: ${pointsSystemResponse.statusText}`);
}

const pointsSystems = await pointsSystemResponse.json();

if (!pointsSystems || pointsSystems.length === 0) {
  throw new Error(`[Load Configuration] Points system with ID ${event.points_system_id} not found`);
}

const pointsSystem = pointsSystems[0];
console.log(`Loaded points system: ${pointsSystem.name}`);

// ============================================================================
// RETURN CONFIGURATION
// ============================================================================

/**
 * Return combined configuration for downstream nodes
 * This will be consumed by Calculate Points node
 */
return [{
  json: {
    event: {
      id: event.id,
      name: event.name,
      type: event.type,
      year: event.year,
      points_system_id: event.points_system_id,
      points_system_name: pointsSystem.name,
      points_config: pointsSystem.config
    },
    courses: courses,
    pointsSystem: pointsSystem,
    configLoadedAt: new Date().toISOString()
  }
}];
