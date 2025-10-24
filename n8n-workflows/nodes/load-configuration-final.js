/**
 * LOAD CONFIGURATION (FINAL VERSION)
 *
 * PURPOSE: Combine courses and points system from sequential flow
 * Handles proper data extraction from Set node
 *
 * @version 2.6.0
 * @date 2025-10-23
 */

// Get event data from Pass Event Data node (via $input from Fetch Points System)
// Load Configuration receives input from Fetch Points System, but we need data from Pass Event Data
const passedData = $('Pass Event Data').first().json;
const eventData = passedData.eventData;

// Get courses data - need to extract properly
let courses = [];

// The courses field from Set node might be stored differently
if (Array.isArray(passedData.courses)) {
  // If it's already an array, check if items have .json property
  courses = passedData.courses.map(item => {
    if (item.json) {
      return item.json;
    }
    return item;
  });
} else if (passedData.courses && typeof passedData.courses === 'object') {
  // If it's an object, try to extract the array
  courses = Object.values(passedData.courses).map(item => {
    if (item.json) {
      return item.json;
    }
    return item;
  });
}

console.log(`✓ Loaded ${courses.length} courses from Pass Event Data`);
console.log(`Sample course structure:`, JSON.stringify(courses[0], null, 2));

if (courses.length === 0) {
  throw new Error('[Load Configuration] No courses found in Pass Event Data. Check Set node configuration.');
}

// Validate course structure
if (!courses[0].course_name) {
  console.error('Course structure is wrong. First course:', JSON.stringify(courses[0], null, 2));
  throw new Error('[Load Configuration] Courses missing "course_name" field. Check data structure.');
}

// Get points system from current input (Fetch Points System node)
const pointsSystemItems = $input.all();

if (!pointsSystemItems || pointsSystemItems.length === 0) {
  throw new Error(`[Load Configuration] Points system with ID ${eventData.points_system_id} not found`);
}

const pointsSystem = pointsSystemItems[0].json;

if (!pointsSystem.config) {
  throw new Error('[Load Configuration] Points system has no config field');
}

console.log(`✓ Loaded points system: ${pointsSystem.name}`);

// Get round data from Format Date for Query node
// This has courseName, players, holes, etc.
const roundData = $('Format Date for Query').first().json;

console.log(`✓ Loaded round data: ${roundData.courseName}, ${roundData.players.length} players`);

// Return combined configuration with round data
return [{
  json: {
    event: {
      id: eventData.id,
      name: eventData.name,
      type: eventData.type,
      year: eventData.year,
      points_system_id: eventData.points_system_id,
      points_system_name: pointsSystem.name,
      points_config: pointsSystem.config
    },
    courses: courses,
    pointsSystem: pointsSystem,
    roundData: roundData,  // ADD ROUND DATA HERE
    configLoadedAt: new Date().toISOString()
  }
}];
