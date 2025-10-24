/**
 * SELECT BEST EVENT NODE
 *
 * PURPOSE: Prioritize tournament over season when both match the date
 * INPUTS: All matching events from "Find Event" Supabase node
 * OUTPUT: Selected event with complete configuration
 *
 * @version 3.0.0
 * @date 2025-10-23
 */

// ============================================================================
// GET DATA FROM PREVIOUS NODE
// ============================================================================

// Get all matching events from Find Event Supabase node
const matchingEvents = $input.all().map(item => item.json);

console.log(`Found ${matchingEvents.length} matching event(s)`);

if (matchingEvents.length === 0) {
  throw new Error('[Select Best Event] No matching event found for this date. Check that events table has active season/tournament covering this date.');
}

// ============================================================================
// PRIORITY LOGIC: TOURNAMENT FIRST, THEN SEASON
// ============================================================================

// Sort: Tournament first, then by start_date descending
matchingEvents.sort((a, b) => {
  // Tournaments get priority
  if (a.type === 'tournament' && b.type !== 'tournament') return -1;
  if (a.type !== 'tournament' && b.type === 'tournament') return 1;

  // If both same type, prefer more recent start_date
  return new Date(b.start_date) - new Date(a.start_date);
});

const selectedEvent = matchingEvents[0];

console.log(`✓ Selected: ${selectedEvent.name} (${selectedEvent.type})`);

// Verify points_system_id is present
if (!selectedEvent.points_system_id) {
  console.warn(`⚠ Event "${selectedEvent.name}" has no points_system_id. Make sure events table is properly linked.`);
}

// ============================================================================
// GET ROUND DATA FROM PREVIOUS NODE
// ============================================================================

const roundData = $('Format Date for Query').item.json;

// ============================================================================
// RETURN SELECTED EVENT WITH COMPLETE DATA
// ============================================================================

return [{
  json: {
    // Event information (passed to Load Configuration and Calculate Points)
    id: selectedEvent.id,
    name: selectedEvent.name,
    type: selectedEvent.type,
    year: selectedEvent.year,
    start_date: selectedEvent.start_date,
    end_date: selectedEvent.end_date,
    points_system_id: selectedEvent.points_system_id,
    points_config: selectedEvent.points_config,

    // Round data (passed through for downstream nodes)
    courseName: roundData.courseName,
    date: roundData.date
  }
}];
