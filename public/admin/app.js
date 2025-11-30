/**
 * Admin Panel Main Application
 * Handles routing, authentication, and UI orchestration
 */

import * as Data from './data.js';

// Simple auth (password check)
const ADMIN_PASSWORD = 'admin';
let isAuthenticated = false;

// ===================
// INITIALIZATION
// ===================

document.addEventListener('DOMContentLoaded', init);

function init() {
    setupAuth();
    setupNavigation();
    setupModals();

    if (isAuthenticated) {
        showAdmin();
    }
}

// ===================
// AUTHENTICATION
// ===================

function setupAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('passwordInput');
    const logoutBtn = document.getElementById('logoutBtn');

    loginBtn?.addEventListener('click', handleLogin);
    passwordInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    logoutBtn?.addEventListener('click', handleLogout);
}

function handleLogin() {
    const password = document.getElementById('passwordInput').value;
    const errorEl = document.getElementById('loginError');

    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        errorEl.textContent = '';
        showAdmin();
    } else {
        errorEl.textContent = 'Incorrect password';
    }
}

function handleLogout() {
    isAuthenticated = false;
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('passwordInput').value = '';
}

function showAdmin() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadPlayers(); // Load initial data
}

// ===================
// NAVIGATION
// ===================

function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            switchSection(section);
        });
    });

    // Section-specific buttons
    document.getElementById('addPlayerBtn')?.addEventListener('click', () => showPlayerModal());
    document.getElementById('addCourseBtn')?.addEventListener('click', () => showCourseModal());
    document.getElementById('addEventBtn')?.addEventListener('click', () => showEventModal());
    document.getElementById('addPointsBtn')?.addEventListener('click', () => showPointsModal());
}

function switchSection(section) {
    // Update nav
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.section === section);
    });

    // Update content
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `${section}-section`);
    });

    // Load data for section
    switch(section) {
        case 'players':
            loadPlayers();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'events':
            loadEvents();
            break;
        case 'points':
            loadPointsSystems();
            break;
    }
}

// ===================
// MODAL MANAGEMENT
// ===================

function setupModals() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.modal-close');

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function showModal(title, content) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `<h2 class="modal-title">${title}</h2>${content}`;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function showInfoModal() {
    const content = `
        <div class="info-modal-content">
            <p style="font-size: 14px; margin-bottom: 16px; color: #ff9800;">
                ⚠️ <strong>All changes are saved directly to the production database and affect live data.</strong>
            </p>

            <h3 style="font-size: 13px; margin-bottom: 8px; color: #fff;">Key Warnings:</h3>
            <ul style="font-size: 12px; line-height: 1.6; margin-bottom: 16px; padding-left: 20px;">
                <li>No undo/audit trail - changes cannot be easily reverted</li>
                <li>Editing courses affects historical round calculations</li>
                <li>Modifying points systems retroactively changes all event scores</li>
                <li>Player edits may affect scorecard name matching</li>
                <li>Event changes impact round assignments</li>
            </ul>

            <h3 style="font-size: 13px; margin-bottom: 8px; color: #4caf50;">Recommended:</h3>
            <ul style="font-size: 12px; line-height: 1.6; padding-left: 20px; list-style: none;">
                <li>✓ Double-check all changes before saving</li>
                <li>✓ Avoid deleting active courses or players</li>
                <li>✓ Be cautious when editing points system configurations</li>
                <li>✓ Test changes in off-hours if possible</li>
            </ul>
        </div>
    `;
    showModal('Admin Panel Usage Guidelines', content);
}

// Expose to window for onclick handler
window.showInfoModal = showInfoModal;

// ===================
// PLAYERS MANAGEMENT
// ===================

async function loadPlayers() {
    try {
        Data.showLoading();
        const players = await Data.getPlayers();
        renderPlayers(players);
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

function renderPlayers(players) {
    const grid = document.getElementById('playersGrid');

    if (players.length === 0) {
        grid.innerHTML = `
            <div class="data-table-container">
                <div class="empty-state">
                    <div class="empty-state-icon">👤</div>
                    <div class="empty-state-text">No players yet. Add your first player!</div>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.map((player, index) => `
                        <tr>
                            <td class="table-number">${index + 1}</td>
                            <td class="table-name">${player.player_name}</td>
                            <td>
                                <span class="badge ${player.active ? 'badge-active' : 'badge-inactive'}">
                                    ${player.active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td class="table-actions">
                                <button class="btn-table-action" onclick="window.editPlayer(${player.id})" title="Edit">✏️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showPlayerModal(player = null) {
    const isEdit = !!player;
    const title = isEdit ? 'Edit Player' : 'Add Player';

    const content = `
        <div class="form-group">
            <label>Player Name</label>
            <input type="text" id="playerName" value="${player?.player_name || ''}" placeholder="Enter player name">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="playerActive">
                <option value="true" ${player?.active !== false ? 'selected' : ''}>Active</option>
                <option value="false" ${player?.active === false ? 'selected' : ''}>Inactive</option>
            </select>
        </div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.savePlayer(${player?.id || null})">Save</button>
        </div>
    `;

    showModal(title, content);
}

async function savePlayer(id) {
    const name = document.getElementById('playerName').value.trim();
    const active = document.getElementById('playerActive').value === 'true';

    if (!name) {
        Data.showError('Player name is required');
        return;
    }

    try {
        Data.showLoading();
        if (id) {
            await Data.updatePlayer(id, { name, active });
        } else {
            await Data.createPlayer({ name, active });
        }
        closeModal();
        await loadPlayers();
        Data.showSuccess('Player saved successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function editPlayer(id) {
    try {
        Data.showLoading();
        const players = await Data.getPlayers();
        const player = players.find(p => p.id === id);
        if (player) {
            showPlayerModal(player);
        }
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function deletePlayerConfirm(id) {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
        Data.showLoading();
        await Data.deletePlayer(id);
        await loadPlayers();
        Data.showSuccess('Player deleted successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

// ===================
// COURSES MANAGEMENT
// ===================

async function loadCourses() {
    try {
        Data.showLoading();
        const courses = await Data.getCourses();
        renderCourses(courses);
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

function renderCourses(courses) {
    const grid = document.getElementById('coursesGrid');

    if (courses.length === 0) {
        grid.innerHTML = `
            <div class="data-table-container">
                <div class="empty-state">
                    <div class="empty-state-icon">⛳</div>
                    <div class="empty-state-text">No courses yet. Add your first course!</div>
                </div>
            </div>
        `;
        return;
    }

    // Group courses by tier/multiplier
    const tiers = [
        { name: 'Elite', multiplier: 2.5, tier: 4, courses: [] },
        { name: 'Hard', multiplier: 2.0, tier: 3, courses: [] },
        { name: 'Moderate', multiplier: 1.5, tier: 2, courses: [] },
        { name: 'Easy', multiplier: 1.0, tier: 1, courses: [] }
    ];

    courses.forEach(course => {
        const tierGroup = tiers.find(t => t.tier === course.tier);
        if (tierGroup) {
            tierGroup.courses.push(course);
        }
    });

    grid.innerHTML = tiers.map(tierGroup => {
        if (tierGroup.courses.length === 0) return '';

        return `
            <div class="tier-section">
                <div class="tier-header" onclick="window.toggleTier(this)">
                    <span class="tier-title">${tierGroup.name} (${tierGroup.multiplier}x)</span>
                    <span class="tier-count">${tierGroup.courses.length} courses</span>
                    <span class="tier-toggle">▼</span>
                </div>
                <div class="tier-content">
                    <table class="data-table tier-table">
                        <tbody>
                            ${tierGroup.courses.map(course => `
                                <tr>
                                    <td class="tier-course-name">${course.course_name}</td>
                                    <td class="tier-course-actions">
                                        <button class="btn-table-action" onclick="window.editCourse(${course.id})" title="Edit">✏️</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).filter(Boolean).join('');
}

function toggleTier(header) {
    const section = header.parentElement;
    const content = section.querySelector('.tier-content');
    const toggle = section.querySelector('.tier-toggle');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggle.textContent = '▶';
    }
}

function showCourseModal(course = null) {
    const isEdit = !!course;
    const title = isEdit ? 'Edit Course' : 'Add Course';

    // Determine current difficulty based on tier/multiplier
    let currentDifficulty = '2'; // Default to Moderate
    if (course) {
        if (course.tier === 1 || course.multiplier === 1.0) currentDifficulty = '1';
        else if (course.tier === 2 || course.multiplier === 1.5) currentDifficulty = '2';
        else if (course.tier === 3 || course.multiplier === 2.0) currentDifficulty = '3';
        else if (course.tier === 4 || course.multiplier === 2.5) currentDifficulty = '4';
    }

    const content = `
        <div class="form-group">
            <label>Course Name</label>
            <input type="text" id="courseName" value="${course?.course_name || ''}" placeholder="Enter course name">
        </div>
        <div class="form-group">
            <label>Difficulty</label>
            <select id="courseDifficulty">
                <option value="1" ${currentDifficulty === '1' ? 'selected' : ''}>Easy (1x)</option>
                <option value="2" ${currentDifficulty === '2' ? 'selected' : ''}>Moderate (1.5x)</option>
                <option value="3" ${currentDifficulty === '3' ? 'selected' : ''}>Hard (2x)</option>
                <option value="4" ${currentDifficulty === '4' ? 'selected' : ''}>Elite (2.5x)</option>
            </select>
        </div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.saveCourse(${course?.id || null})">Save</button>
        </div>
    `;

    showModal(title, content);
}

async function saveCourse(id) {
    const name = document.getElementById('courseName').value.trim();
    const difficulty = parseInt(document.getElementById('courseDifficulty').value);

    // Map difficulty to tier and multiplier
    const difficultyMap = {
        1: { tier: 1, multiplier: 1.0 },   // Easy
        2: { tier: 2, multiplier: 1.5 },   // Moderate
        3: { tier: 3, multiplier: 2.0 },   // Hard
        4: { tier: 4, multiplier: 2.5 }    // Elite
    };

    const { tier, multiplier } = difficultyMap[difficulty];

    if (!name) {
        Data.showError('Course name is required');
        return;
    }

    try {
        Data.showLoading();
        if (id) {
            await Data.updateCourse(id, { name, tier, multiplier });
        } else {
            await Data.createCourse({ name, tier, multiplier });
        }
        closeModal();
        await loadCourses();
        Data.showSuccess('Course saved successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function editCourse(id) {
    try {
        Data.showLoading();
        const courses = await Data.getCourses();
        const course = courses.find(c => c.id === id);
        if (course) {
            showCourseModal(course);
        }
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function deleteCourseConfirm(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        Data.showLoading();
        await Data.deleteCourse(id);
        await loadCourses();
        Data.showSuccess('Course deleted successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

// ===================
// EVENTS MANAGEMENT
// ===================

async function loadEvents() {
    try {
        Data.showLoading();
        const events = await Data.getEvents();
        renderEvents(events);
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

function renderEvents(events) {
    const grid = document.getElementById('eventsGrid');

    if (events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏆</div>
                <div class="empty-state-text">No events yet. Add your first event!</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = events.map(event => `
        <div class="data-card">
            <div class="data-card-header">
                <div class="data-card-title">${event.name}</div>
                <div class="data-card-actions">
                    <button class="btn-icon" onclick="window.editEvent(${event.id})" title="Edit">✏️</button>
                </div>
            </div>
            <div class="data-card-field">
                <span class="field-label">Type</span>
                <span class="field-value">
                    <span class="badge badge-${event.type}">${event.type}</span>
                </span>
            </div>
            <div class="data-card-field">
                <span class="field-label">Dates</span>
                <span class="field-value">${event.start_date} to ${event.end_date}</span>
            </div>
            <div class="data-card-field">
                <span class="field-label">Players</span>
                <span class="field-value">${event.players?.length || 0} players</span>
            </div>
        </div>
    `).join('');
}

async function showEventModal(event = null) {
    try {
        const [pointsSystems, players] = await Promise.all([
            Data.getPointsSystems(),
            Data.getPlayers()
        ]);

        const isEdit = !!event;
        const title = isEdit ? 'Edit Event' : 'Add Event';
        const selectedPlayers = event?.players || [];

        const content = `
            <div class="form-group">
                <label>Event Name</label>
                <input type="text" id="eventName" value="${event?.name || ''}" placeholder="Enter event name">
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="eventType">
                    <option value="season" ${event?.type === 'season' ? 'selected' : ''}>Season</option>
                    <option value="tournament" ${event?.type === 'tournament' ? 'selected' : ''}>Tournament</option>
                </select>
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" id="eventStartDate" value="${event?.start_date || ''}">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" id="eventEndDate" value="${event?.end_date || ''}">
            </div>
            <div class="form-group">
                <label>Points System</label>
                <select id="eventPointsSystem" onchange="window.handlePointsSystemChange(this.value)">
                    <option value="">-- Select Points System --</option>
                    ${pointsSystems.map(ps => `
                        <option value="${ps.id}" ${event?.points_system_id === ps.id ? 'selected' : ''}>
                            ${ps.name}
                        </option>
                    `).join('')}
                    <option value="CREATE_NEW" style="color: var(--color-primary); font-weight: bold;">+ Create New Points System</option>
                </select>
            </div>
            <div class="form-group">
                <label>Players <span style="font-size: 11px; color: var(--color-text-secondary);">(select multiple)</span></label>
                <div id="eventPlayers" class="player-checkboxes">
                    ${players.map(player => `
                        <label class="player-checkbox-item">
                            <input
                                type="checkbox"
                                value="${player.id}"
                                ${selectedPlayers.includes(player.id) ? 'checked' : ''}
                            >
                            <span>${player.player_name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="form-actions">
                <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                <button class="btn-primary" onclick="window.saveEvent(${event?.id || null})">Save</button>
            </div>
        `;

        showModal(title, content);
    } catch (error) {
        Data.showError('Failed to load event data: ' + error.message);
    }
}

function handlePointsSystemChange(value) {
    if (value === 'CREATE_NEW') {
        closeModal();
        switchSection('points');
        showPointsModal();
    }
}

async function saveEvent(id) {
    const name = document.getElementById('eventName').value.trim();
    const type = document.getElementById('eventType').value;
    const start_date = document.getElementById('eventStartDate').value;
    const end_date = document.getElementById('eventEndDate').value;
    const points_system_id = parseInt(document.getElementById('eventPointsSystem').value);

    // Get selected players from checkboxes
    const playerCheckboxes = document.querySelectorAll('#eventPlayers input[type="checkbox"]:checked');
    const players = Array.from(playerCheckboxes).map(cb => parseInt(cb.value));

    if (!name || !start_date || !end_date || !points_system_id) {
        Data.showError('Event name, dates, and points system are required');
        return;
    }

    try {
        Data.showLoading();
        const eventData = { name, type, start_date, end_date, points_system_id, players };

        if (id) {
            await Data.updateEvent(id, eventData);
        } else {
            await Data.createEvent(eventData);
        }
        closeModal();
        await loadEvents();
        Data.showSuccess('Event saved successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function editEvent(id) {
    try {
        Data.showLoading();
        const events = await Data.getEvents();
        const event = events.find(e => e.id === id);
        if (event) {
            showEventModal(event);
        }
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function deleteEventConfirm(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        Data.showLoading();
        await Data.deleteEvent(id);
        await loadEvents();
        Data.showSuccess('Event deleted successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

// ===================
// POINTS SYSTEMS
// ===================

async function loadPointsSystems() {
    try {
        Data.showLoading();
        const systems = await Data.getPointsSystems();
        renderPointsSystems(systems);
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

function renderPointsSystems(systems) {
    const grid = document.getElementById('pointsGrid');

    if (systems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎯</div>
                <div class="empty-state-text">No points systems yet. Add your first system!</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = systems.map(system => {
        // Extract rank points from config object
        const rankPoints = system.config?.rank_points;
        let rankPointsDisplay = 'N/A';
        if (rankPoints && typeof rankPoints === 'object') {
            const points = Object.entries(rankPoints)
                .filter(([key]) => key !== 'default')
                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                .map(([_, value]) => value);
            if (points.length > 0) {
                rankPointsDisplay = points.join(', ');
            }
        }

        // Extract performance points and filter only allocated bonuses
        const perf = system.config?.performance_points || {};
        const bonuses = [];
        if (perf.ace && perf.ace > 0) bonuses.push(`Ace: ${perf.ace}`);
        if (perf.eagle && perf.eagle > 0) bonuses.push(`Eagle: ${perf.eagle}`);
        if (perf.birdie && perf.birdie > 0) bonuses.push(`Birdie: ${perf.birdie}`);
        if (perf.most_birdies && perf.most_birdies > 0) bonuses.push(`Most Birdies: ${perf.most_birdies}`);
        if (perf.fastest_birdie && perf.fastest_birdie > 0) bonuses.push(`Fastest Birdie: ${perf.fastest_birdie}`);
        const bonusesDisplay = bonuses.length > 0 ? bonuses.join(', ') : 'None';

        // Tie breaker order from config or use default
        const tieBreaking = system.config?.tie_breaking || {};
        const tieBreakerOrder = tieBreaking.order || ['birdies', 'pars', 'fastest_birdie'];

        const tieBreakerLabels = {
            'birdies': 'More birdies',
            'pars': 'More pars',
            'eagles': 'More eagles',
            'aces': 'More aces',
            'fastest_birdie': 'Fastest birdie'
        };

        const tieBreakerDisplay = tieBreakerOrder
            .map(id => tieBreakerLabels[id] || id)
            .join(' → ');

        return `
        <div class="data-card">
            <div class="data-card-header">
                <div class="data-card-title">${system.name}</div>
                <div class="data-card-actions">
                    <button class="btn-icon" onclick="window.editPointsSystem(${system.id})" title="Edit">✏️</button>
                </div>
            </div>
            <div class="data-card-field">
                <span class="field-label">Rank Points</span>
                <span class="field-value">${rankPointsDisplay}</span>
            </div>
            <div class="data-card-field">
                <span class="field-label">Bonuses</span>
                <span class="field-value">${bonusesDisplay}</span>
            </div>
            <div class="data-card-field">
                <span class="field-label">Tie Breaker</span>
                <span class="field-value" style="font-size: 12px;">${tieBreakerDisplay}</span>
            </div>
        </div>
    `}).join('');
}

function showPointsModal(system = null) {
    const isEdit = !!system;
    const title = isEdit ? 'Edit Points System' : 'Add Points System';

    // Extract config from database structure
    const perf = system?.config?.performance_points || {};
    const rankPointsObj = system?.config?.rank_points || {};
    const tieBreaking = system?.config?.tie_breaking || {};

    // Convert rank_points object to array for display
    let rankPointsArray = [10, 8, 6, 4, 2, 1]; // Default
    if (Object.keys(rankPointsObj).length > 0) {
        rankPointsArray = Object.entries(rankPointsObj)
            .filter(([key]) => key !== 'default')
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([_, value]) => value);
    }

    // Get tie breaker order or use default
    const defaultTieBreakers = [
        { id: 'birdies', label: 'More birdies' },
        { id: 'pars', label: 'More pars' },
        { id: 'eagles', label: 'More eagles' },
        { id: 'aces', label: 'More aces' },
        { id: 'fastest_birdie', label: 'Fastest birdie' }
    ];

    // If there's a saved order, use it; otherwise show all options
    let orderedTieBreakers;
    if (tieBreaking.order && tieBreaking.order.length > 0) {
        orderedTieBreakers = tieBreaking.order.map(id =>
            defaultTieBreakers.find(tb => tb.id === id) || { id, label: id }
        );
    } else {
        // Show all options in default order for new systems
        orderedTieBreakers = defaultTieBreakers;
    }

    const content = `
        <div class="form-group">
            <label>System Name</label>
            <input type="text" id="pointsName" value="${system?.name || ''}" placeholder="Enter system name">
        </div>
        <div class="form-group">
            <label>Rank Points (comma-separated)</label>
            <input type="text" id="pointsRankPoints" value="${rankPointsArray.join(', ')}" placeholder="10, 8, 6, 4, 2, 1">
        </div>
        <div class="form-group">
            <label>Ace Bonus</label>
            <input type="number" id="pointsAceBonus" value="${perf.ace || 0}" min="0">
        </div>
        <div class="form-group">
            <label>Eagle Bonus</label>
            <input type="number" id="pointsEagleBonus" value="${perf.eagle || 0}" min="0">
        </div>
        <div class="form-group">
            <label>Birdie Bonus</label>
            <input type="number" id="pointsBirdieBonus" value="${perf.birdie || 0}" min="0">
        </div>
        <div class="form-group">
            <label>Most Birdies Bonus</label>
            <input type="number" id="pointsMostBirdies" value="${perf.most_birdies || 0}" min="0">
        </div>
        <div class="form-group">
            <label>Fastest Birdie Bonus</label>
            <input type="number" id="pointsFastestBirdie" value="${perf.fastest_birdie || 0}" min="0">
        </div>
        <div class="form-group">
            <label>Tie Breaker Order <span style="font-size: 11px; color: var(--color-text-secondary);">(drag to reorder)</span></label>
            <ul id="tieBreakerList" class="tie-breaker-list">
                ${orderedTieBreakers.map((tb, index) => `
                    <li class="tie-breaker-item" draggable="true" data-id="${tb.id}">
                        <span class="tie-breaker-handle">☰</span>
                        <span class="tie-breaker-label">${tb.label}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="form-actions">
            <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
            <button class="btn-primary" onclick="window.savePointsSystem(${system?.id || null})">Save</button>
        </div>
    `;

    showModal(title, content);

    // Initialize drag and drop after modal is shown
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initTieBreakerDragDrop();
        });
    });
}

function initTieBreakerDragDrop() {
    const list = document.getElementById('tieBreakerList');
    if (!list) {
        console.error('❌ Tie breaker list not found');
        return;
    }

    let draggedElement = null;

    const items = list.querySelectorAll('.tie-breaker-item');
    console.log('🎯 Initializing drag-drop for', items.length, 'items');

    // Check if items have draggable attribute
    items.forEach((item, idx) => {
        console.log(`Item ${idx}: draggable=${item.getAttribute('draggable')}, data-id=${item.dataset.id}`);
    });

    // Add dragover to the list itself to enable drop
    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    list.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('📍 Drop event on list');
    });

    items.forEach(item => {
        // Ensure draggable is set
        item.setAttribute('draggable', 'true');

        item.addEventListener('dragstart', (e) => {
            console.log('🚀 Drag started:', item.dataset.id);
            draggedElement = item;
            item.classList.add('dragging');
            setTimeout(() => {
                item.style.opacity = '0.4';
            }, 0);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.id);
        });

        item.addEventListener('dragend', (e) => {
            console.log('🏁 Drag ended:', item.dataset.id);
            item.style.opacity = '1';
            item.classList.remove('dragging');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();

            if (draggedElement && draggedElement !== item && !item.classList.contains('dragging')) {
                const rect = item.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    list.insertBefore(draggedElement, item);
                } else {
                    list.insertBefore(draggedElement, item.nextSibling);
                }
            }
        });

        item.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (draggedElement && draggedElement !== item) {
                item.style.borderTop = '2px solid var(--color-primary)';
            }
        });

        item.addEventListener('dragleave', (e) => {
            item.style.borderTop = '';
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            item.style.borderTop = '';
            console.log('📍 Drop event on item:', item.dataset.id);
        });
    });

    console.log('✅ Drag-drop initialized successfully');
}

async function savePointsSystem(id) {
    const name = document.getElementById('pointsName').value.trim();
    const rankPointsStr = document.getElementById('pointsRankPoints').value;
    const aceBonus = parseInt(document.getElementById('pointsAceBonus').value) || 0;
    const eagleBonus = parseInt(document.getElementById('pointsEagleBonus').value) || 0;
    const birdieBonus = parseInt(document.getElementById('pointsBirdieBonus').value) || 0;
    const mostBirdies = parseInt(document.getElementById('pointsMostBirdies').value) || 0;
    const fastestBirdie = parseInt(document.getElementById('pointsFastestBirdie').value) || 0;

    if (!name) {
        Data.showError('System name is required');
        return;
    }

    // Parse rank points
    const rankPointsArray = rankPointsStr.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    const rankPoints = {};
    rankPointsArray.forEach((points, index) => {
        rankPoints[index + 1] = points;
    });
    rankPoints.default = 0;

    // Get tie breaker order from drag-drop list
    const tieBreakerItems = document.querySelectorAll('.tie-breaker-item');
    const tieBreakerOrder = Array.from(tieBreakerItems).map(item => item.dataset.id);

    // Build config object matching database structure
    const config = {
        rank_points: rankPoints,
        performance_points: {
            ace: aceBonus,
            eagle: eagleBonus,
            birdie: birdieBonus,
            most_birdies: mostBirdies,
            fastest_birdie: fastestBirdie
        },
        tie_breaking: {
            enabled: true,
            order: tieBreakerOrder
        },
        course_multiplier: {
            enabled: true
        }
    };

    try {
        Data.showLoading();
        if (id) {
            await Data.updatePointsSystem(id, { name, config });
        } else {
            await Data.createPointsSystem({ name, config });
        }
        closeModal();
        await loadPointsSystems();
        Data.showSuccess('Points system saved successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function editPointsSystem(id) {
    try {
        Data.showLoading();
        const systems = await Data.getPointsSystems();
        const system = systems.find(s => s.id === id);
        if (system) {
            showPointsModal(system);
        }
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

async function deletePointsSystemConfirm(id) {
    if (!confirm('Are you sure you want to delete this points system?')) return;

    try {
        Data.showLoading();
        await Data.deletePointsSystem(id);
        await loadPointsSystems();
        Data.showSuccess('Points system deleted successfully');
    } catch (error) {
        Data.showError(error.message);
    } finally {
        Data.hideLoading();
    }
}

// ===================
// EXPOSE FUNCTIONS TO WINDOW FOR ONCLICK HANDLERS
// ===================

window.closeModal = closeModal;
window.savePlayer = savePlayer;
window.editPlayer = editPlayer;
window.deletePlayerConfirm = deletePlayerConfirm;
window.toggleTier = toggleTier;
window.saveCourse = saveCourse;
window.editCourse = editCourse;
window.deleteCourseConfirm = deleteCourseConfirm;
window.saveEvent = saveEvent;
window.editEvent = editEvent;
window.deleteEventConfirm = deleteEventConfirm;
window.handlePointsSystemChange = handlePointsSystemChange;
window.savePointsSystem = savePointsSystem;
window.editPointsSystem = editPointsSystem;
window.deletePointsSystemConfirm = deletePointsSystemConfirm;
