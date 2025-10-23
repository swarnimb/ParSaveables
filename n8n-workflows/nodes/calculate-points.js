/**
 * ENTERPRISE-GRADE POINTS CALCULATION ENGINE
 *
 * PURPOSE: Universal points calculator driven by database configuration
 * INPUTS: Round data, event configuration, course configuration
 * OUTPUTS: Players with calculated points breakdown
 *
 * DESIGN PRINCIPLES:
 * - Configuration-driven (no hardcoded business rules)
 * - Single source of truth (database)
 * - Testable (pure functions)
 * - Extensible (new rules = config changes, not code changes)
 *
 * @version 2.0.0
 * @date 2025-10-23
 */

// ============================================================================
// STEP 1: LOAD CONFIGURATION FROM PREVIOUS NODES
// ============================================================================

/**
 * Get event configuration from "Determine Event" node
 * This includes the points_system config from database
 */
const event = $('Determine Event').item.json;
const pointsSystemConfig = event.points_config || throwError('No points system configured for this event');

/**
 * Get course configuration from "Load Configuration" node
 * This includes course tier mappings and multipliers
 */
const coursesConfig = $('Load Configuration').item.json.courses;

/**
 * Get round data from previous node (Format Event Data)
 */
const roundData = $input.all()[0].json;

// ============================================================================
// STEP 2: EXTRACT CONFIGURATION VALUES
// ============================================================================

/**
 * Points awarded by rank (placement points)
 * Example: { "1": 15, "2": 12, "3": 9, "default": 0 }
 */
const rankPointsMap = pointsSystemConfig.rank_points;
const defaultRankPoints = rankPointsMap.default || 0;

/**
 * Points awarded for performance bonuses
 * Example: { "birdie": 1, "eagle": 5, "ace": 10 }
 */
const performancePointsMap = pointsSystemConfig.performance_points;

/**
 * Tie-breaking configuration
 * Determines if tied players share averaged points
 */
const tieBreakingConfig = pointsSystemConfig.tie_breaking || {
  enabled: true,
  method: 'average'
};

/**
 * Course multiplier configuration
 * Determines if and how course difficulty affects points
 */
const courseMultiplierConfig = pointsSystemConfig.course_multiplier || {
  enabled: true,
  source: 'course_tier'
};

// ============================================================================
// STEP 3: UTILITY FUNCTIONS (PURE, TESTABLE, REUSABLE)
// ============================================================================

/**
 * Get course multiplier for this round
 * @param {string} courseName - Name of the course
 * @param {object} config - Course multiplier configuration
 * @param {array} coursesData - Course data from database
 * @returns {number} - Multiplier value (e.g., 1.0, 1.5, 2.0, 2.5)
 */
function getCourseMultiplier(courseName, config, coursesData) {
  // If course multiplier is disabled, return override value or 1.0
  if (!config.enabled) {
    return config.override || 1.0;
  }

  // Find course in database by name (case-insensitive partial match)
  const courseMatch = coursesData.find(course =>
    courseName.toLowerCase().includes(course.course_name.toLowerCase()) ||
    course.course_name.toLowerCase().includes(courseName.toLowerCase())
  );

  if (courseMatch) {
    return courseMatch.multiplier;
  }

  // Course not found - log warning and default to 1.0
  console.warn(`Course "${courseName}" not found in database. Using 1.0x multiplier.`);
  return 1.0;
}

/**
 * Calculate rank points with tie-breaking logic
 * @param {array} players - Array of player objects with rank property
 * @param {object} rankPoints - Rank points map from config
 * @param {number} defaultPoints - Default points for unspecified ranks
 * @param {object} tieConfig - Tie-breaking configuration
 * @returns {object} - Map of player index to rank points
 */
function calculateRankPointsWithTies(players, rankPoints, defaultPoints, tieConfig) {
  const rankPointsMap = {};

  if (!tieConfig.enabled || tieConfig.method !== 'average') {
    // Simple mode: no tie averaging, just assign points directly
    players.forEach((player, index) => {
      rankPointsMap[index] = rankPoints[player.rank] || defaultPoints;
    });
    return rankPointsMap;
  }

  // Advanced mode: average points for tied players
  let i = 0;
  while (i < players.length) {
    const currentRank = players[i].rank;

    // Find all players with this rank (tied players)
    let tiedPlayers = 1;
    let j = i + 1;
    while (j < players.length && players[j].rank === currentRank) {
      tiedPlayers++;
      j++;
    }

    // Calculate average points for tied players
    // Example: Two players tied for 2nd place
    //   - Normal: 2nd gets 12 points, 3rd gets 9 points
    //   - Tied: Both get (12 + 9) / 2 = 10.5 points
    let totalPoints = 0;
    for (let k = 0; k < tiedPlayers; k++) {
      const rank = currentRank + k;
      totalPoints += rankPoints[rank] || defaultPoints;
    }
    const avgPoints = totalPoints / tiedPlayers;

    // Assign average points to all tied players
    for (let k = i; k < j; k++) {
      rankPointsMap[k] = avgPoints;
    }

    i = j;
  }

  return rankPointsMap;
}

/**
 * Calculate performance bonus points for a player
 * @param {object} player - Player object with aces, eagles, birdies
 * @param {object} performancePoints - Performance points map from config
 * @returns {object} - Breakdown of performance points
 */
function calculatePerformancePoints(player, performancePoints) {
  return {
    birdies: (player.birdies || 0) * (performancePoints.birdie || 0),
    eagles: (player.eagles || 0) * (performancePoints.eagle || 0),
    aces: (player.aces || 0) * (performancePoints.ace || 0)
  };
}

/**
 * Calculate final total points for a player
 * @param {number} rankPoints - Points from placement
 * @param {object} performancePoints - Performance bonus points
 * @param {number} multiplier - Course difficulty multiplier
 * @returns {object} - Complete points breakdown
 */
function calculateFinalPoints(rankPoints, performancePoints, multiplier) {
  const rawTotal = rankPoints +
                   performancePoints.birdies +
                   performancePoints.eagles +
                   performancePoints.aces;

  const finalTotal = rawTotal * multiplier;

  return {
    rankPoints: rankPoints,
    birdiePoints: performancePoints.birdies,
    eaglePoints: performancePoints.eagles,
    acePoints: performancePoints.aces,
    rawTotal: rawTotal,
    courseMultiplier: multiplier,
    finalTotal: finalTotal
  };
}

/**
 * Error handler for missing configuration
 */
function throwError(message) {
  throw new Error(`[Calculate Points] ${message}`);
}

// ============================================================================
// STEP 4: MAIN CALCULATION LOGIC
// ============================================================================

/**
 * Get course multiplier for this round
 */
const courseMultiplier = getCourseMultiplier(
  roundData.courseName,
  courseMultiplierConfig,
  coursesConfig
);

console.log(`Event: ${event.name} (${event.type})`);
console.log(`Course: ${roundData.courseName} (${courseMultiplier}x multiplier)`);
console.log(`Points System: ${event.points_system_name || 'Custom'}`);

/**
 * Calculate rank points with tie-breaking
 */
const rankPointsAssignment = calculateRankPointsWithTies(
  roundData.players,
  rankPointsMap,
  defaultRankPoints,
  tieBreakingConfig
);

/**
 * Calculate points for each player
 */
roundData.players.forEach((player, index) => {
  // Get rank points (with tie averaging applied)
  const rankPoints = rankPointsAssignment[index];

  // Calculate performance bonuses
  const performancePoints = calculatePerformancePoints(
    player,
    performancePointsMap
  );

  // Calculate final total with multiplier
  const pointsBreakdown = calculateFinalPoints(
    rankPoints,
    performancePoints,
    courseMultiplier
  );

  // Attach points breakdown to player object
  player.points = pointsBreakdown;

  console.log(`${player.name}: Rank ${player.rank} → ${pointsBreakdown.finalTotal} pts`);
});

// ============================================================================
// STEP 5: RETURN ENRICHED DATA
// ============================================================================

/**
 * Return complete round data with calculated points
 * This output feeds into "Save Round Info" node
 */
return [{
  json: {
    event: {
      id: event.id,
      name: event.name,
      type: event.type,
      year: event.year,
      pointsSystemConfig: pointsSystemConfig
    },
    roundInfo: {
      courseName: roundData.courseName,
      layoutName: roundData.layoutName,
      date: roundData.date,
      time: roundData.time,
      location: roundData.location,
      temperature: roundData.temperature,
      wind: roundData.wind,
      courseMultiplier: Number(courseMultiplier),
      eventId: event.id,
      eventType: event.type,
      eventName: event.name
    },
    holes: roundData.holes,
    players: roundData.players
  }
}];
