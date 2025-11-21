/**
 * UI Components - Reusable rendering functions
 */

/**
 * Create event selector component
 */
export function createEventSelector(events, currentType, currentEventId, onEventChange) {
    const container = document.createElement('div');
    container.className = 'event-selector';

    // Type toggle (Season / Tournament)
    const typeToggle = document.createElement('div');
    typeToggle.className = 'event-type-toggle';

    const seasonBtn = document.createElement('button');
    seasonBtn.className = `toggle-btn ${currentType === 'season' ? 'active' : ''}`;
    seasonBtn.textContent = 'Season';
    seasonBtn.addEventListener('click', () => onEventChange('season', null));

    const tournamentBtn = document.createElement('button');
    tournamentBtn.className = `toggle-btn ${currentType === 'tournament' ? 'active' : ''}`;
    tournamentBtn.textContent = 'Tournament';
    tournamentBtn.addEventListener('click', () => onEventChange('tournament', null));

    typeToggle.appendChild(seasonBtn);
    typeToggle.appendChild(tournamentBtn);

    // Event dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'event-dropdown';

    const currentEvent = events.find(e => e.id === currentEventId);
    const currentBtn = document.createElement('button');
    currentBtn.className = 'event-current';
    currentBtn.innerHTML = `
        <span>${currentEvent ? currentEvent.name : 'Select Event'}</span>
        <span>▼</span>
    `;

    const eventList = document.createElement('div');
    eventList.className = 'event-list';

    events.forEach(event => {
        const item = document.createElement('button');
        item.className = `event-item ${event.id === currentEventId ? 'selected' : ''}`;
        item.textContent = event.name;
        item.addEventListener('click', () => {
            onEventChange(currentType, event.id);
            eventList.classList.remove('show');
        });
        eventList.appendChild(item);
    });

    currentBtn.addEventListener('click', () => {
        eventList.classList.toggle('show');
    });

    dropdown.appendChild(currentBtn);
    dropdown.appendChild(eventList);

    container.appendChild(typeToggle);
    container.appendChild(dropdown);

    return container;
}

/**
 * Create podium for top 3 players
 */
export function createPodium(topThree, onPlayerClick) {
    const section = document.createElement('div');
    section.className = 'podium-section';

    const podium = document.createElement('div');
    podium.className = 'podium';

    // Render in 2-1-3 order
    const orderedPlayers = [
        topThree[1], // 2nd place (left)
        topThree[0], // 1st place (center)
        topThree[2]  // 3rd place (right)
    ];

    orderedPlayers.forEach((player, index) => {
        if (!player) return;

        const actualRank = player.rank;
        const place = document.createElement('div');
        place.className = `podium-place rank-${actualRank}`;
        place.addEventListener('click', () => onPlayerClick(player));

        // Get initials from player name
        const initials = getInitials(player.name);

        place.innerHTML = `
            <div class="podium-avatar">
                ${initials}
                <div class="podium-rank">${actualRank}</div>
            </div>
            <div class="podium-name">${player.name}</div>
            <div class="podium-stats">
                <div class="podium-points">${player.totalPoints} pts</div>
                <div class="podium-rounds">${player.countedRounds} rounds</div>
            </div>
        `;

        podium.appendChild(place);
    });

    section.appendChild(podium);
    return section;
}

/**
 * Create player list (ranks 4+)
 */
export function createPlayerList(players, expandedIds, onPlayerClick) {
    const list = document.createElement('div');
    list.className = 'player-list';

    players.forEach(player => {
        const row = createPlayerRow(player, expandedIds.has(player.name), onPlayerClick);
        list.appendChild(row);
    });

    return list;
}

/**
 * Create individual player row
 */
function createPlayerRow(player, isExpanded, onPlayerClick) {
    const row = document.createElement('div');
    row.className = `player-row ${isExpanded ? 'expanded' : ''}`;
    row.addEventListener('click', () => onPlayerClick(player));

    const initials = getInitials(player.name);

    // Movement indicator (placeholder for now - will implement when we track historical ranks)
    const movement = '→'; // Can be ↑, ↓, or →

    row.innerHTML = `
        <div class="player-row-header">
            <div class="player-rank">
                <span class="rank-number">${String(player.rank).padStart(2, '0')}</span>
                <span class="rank-movement same">${movement}</span>
            </div>
            <div class="player-avatar">${initials}</div>
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-meta">${player.rounds} rounds</div>
            </div>
            <div class="player-points">${player.totalPoints}</div>
        </div>
        <div class="player-details">
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Points</span>
                    <span class="stat-value">${player.totalPoints}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Rounds</span>
                    <span class="stat-value">${player.rounds}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg Score</span>
                    <span class="stat-value">${player.avgScore}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Wins</span>
                    <span class="stat-value">${player.wins}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Birdies</span>
                    <span class="stat-value">${player.birdies}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Eagles</span>
                    <span class="stat-value">${player.eagles}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Aces</span>
                    <span class="stat-value">${player.aces}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Pars</span>
                    <span class="stat-value">${player.pars}</span>
                </div>
            </div>
        </div>
    `;

    return row;
}

/**
 * Create loading state
 */
export function createLoadingState() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
        <div>Loading...</div>
    `;
    return loading;
}

/**
 * Create empty state
 */
export function createEmptyState(message, icon = '📭') {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <div>${message}</div>
    `;
    return empty;
}

/**
 * Helper: Get initials from name
 */
function getInitials(name) {
    // Handle emoji names like "Bird 🦅"
    if (name.includes('🦅')) return '🦅';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
