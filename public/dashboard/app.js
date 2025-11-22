/**
 * Main Application - Orchestrates the dashboard
 */

import { initSupabase, getEvents, getEventsByType, getLeaderboard, getActiveEvent, processScorecard, getRoundProgression } from '/dashboard/data.js';
import { createEventSelector, createPodium, createPlayerList, createLoadingState, createEmptyState } from '/dashboard/components.js';

// Supabase configuration
const SUPABASE_URL = 'https://bcovevbtcdsgzbrieiin.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjb3ZldmJ0Y2RzZ3picmllaWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA3OTEsImV4cCI6MjA3NjIwNjc5MX0.etzrLL8yw4n_NUdYnr_bdcrKphW67dYln8CjR54NSLA';

// App state
const state = {
    currentPage: 'home',
    eventType: 'season',
    selectedEventId: null,
    allEvents: [],
    currentEvents: [],
    leaderboard: [],
    expandedPlayers: new Set(),
    roundProgression: null,
    selectedChartPlayers: new Set()
};

// Disc golf jokes/puns
const discGolfJokes = [
    "I'm having a disc-traction free day! 🥏",
    "Keep calm and throw on! 🎯",
    "Life is full of obstacles... just like my putting line 🥏",
    "Every throw is a chance to be pargeous! ⛓️",
    "Disc golf: where the chains call your name 🔗",
    "I came, I threw, I chained! ⛓️",
    "My favorite exercise? Running for my disc 🏃‍♂️",
    "Throwing plastic at trees since... well, today! 🌲",
    "Par for the course? More like par-ty time! 🎉",
    "Keep your friends close and your discs closer 🥏",
    "When life gives you trees, ace through them! 🌲",
    "Disc golf: cheaper than therapy, just as frustrating 😅",
    "I've got 99 problems and they're all in the rough 🌿",
    "Stay calm and crush chains ⛓️",
    "Warning: May spontaneously throw discs 🥏"
];

// Initialize app
async function init() {
    console.log('Initializing ParSaveables Dashboard...');

    // Show random joke
    showRandomJoke();

    // Initialize Supabase
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    initSupabase(supabaseClient);

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    await loadInitialData();

    // Render home page
    renderCurrentPage();
}

/**
 * Show random disc golf joke in banner
 */
function showRandomJoke() {
    const jokeElement = document.getElementById('discGolfJoke');
    const randomJoke = discGolfJokes[Math.floor(Math.random() * discGolfJokes.length)];
    jokeElement.textContent = randomJoke;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Bottom navigation tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const page = tab.dataset.page;
            switchPage(page);
        });
    });

    // Process scorecard button
    const processFab = document.getElementById('processFab');
    processFab.addEventListener('click', handleProcessScorecard);

    // Admin button
    const adminBtn = document.getElementById('adminBtn');
    adminBtn.addEventListener('click', () => {
        window.location.href = '/admin.html';
    });
}

/**
 * Load initial data
 */
async function loadInitialData() {
    try {
        // Get all events
        state.allEvents = await getEvents();

        // Try to get active event, otherwise use most recent season
        let activeEvent = await getActiveEvent();

        if (!activeEvent) {
            const seasons = state.allEvents.filter(e => e.type === 'season');
            activeEvent = seasons[0]; // Most recent season
        }

        if (activeEvent) {
            state.eventType = activeEvent.type;
            state.selectedEventId = activeEvent.id;
        }

        // Filter events by type
        state.currentEvents = state.allEvents.filter(e => e.type === state.eventType);

        // Load leaderboard for selected event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
        }

        console.log('Initial data loaded:', {
            totalEvents: state.allEvents.length,
            currentEventType: state.eventType,
            selectedEvent: state.selectedEventId,
            playersCount: state.leaderboard.length
        });
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showError('Failed to load data. Please refresh the page.');
    }
}

/**
 * Switch page
 */
function switchPage(page) {
    state.currentPage = page;

    // Update active tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.dataset.page === page) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    renderCurrentPage();
}

/**
 * Render current page
 */
function renderCurrentPage() {
    const content = document.getElementById('content');

    switch (state.currentPage) {
        case 'home':
            renderHomePage(content);
            break;
        case 'stats':
            renderStatsPage(content);
            break;
        case 'podcast':
            renderPodcastPage(content);
            break;
        case 'about':
            renderAboutPage(content);
            break;
    }
}

/**
 * Render home page (leaderboard)
 */
function renderHomePage(container) {
    container.innerHTML = '';

    // Event selector
    const eventSelector = createEventSelector(
        state.currentEvents,
        state.eventType,
        state.selectedEventId,
        handleEventChange
    );
    container.appendChild(eventSelector);

    // Show loading or empty state
    if (state.leaderboard.length === 0) {
        container.appendChild(createEmptyState('No players found for this event'));
        return;
    }

    // Podium (top 3)
    const topThree = state.leaderboard.slice(0, 3);
    if (topThree.length > 0) {
        const podium = createPodium(topThree, handlePlayerClick, state.expandedPlayers);
        container.appendChild(podium);
    }

    // Player list (rest)
    const remaining = state.leaderboard.slice(3);
    if (remaining.length > 0) {
        const playerList = createPlayerList(remaining, state.expandedPlayers, handlePlayerClick);
        container.appendChild(playerList);
    }
}

/**
 * Render stats page
 */
function renderStatsPage(container) {
    container.innerHTML = '';
    container.className = 'stats-page';

    // Event selector (reuse from home page)
    const eventSelector = createEventSelector(
        state.currentEvents,
        state.eventType,
        state.selectedEventId,
        handleStatsEventChange
    );
    container.appendChild(eventSelector);

    // Stat cards data - 3 visual charts
    const statCards = [
        { title: 'Performance Breakdown', type: 'performance-bars' },
        { title: 'Rounds Analysis', type: 'rounds-stacked' },
        { title: 'Points Progression', type: 'points-line' }
    ];

    // Add position indicators (dots) - create first
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    indicators.id = 'carouselIndicators';

    statCards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `indicator-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        indicators.appendChild(dot);
    });

    container.appendChild(indicators);

    // Create swipeable carousel
    const carousel = document.createElement('div');
    carousel.className = 'stats-carousel';
    carousel.id = 'statsCarousel';

    // Create cards with actual data
    statCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'stat-card';

        const header = document.createElement('div');
        header.className = 'stat-card-header';
        header.innerHTML = `<h2 class="stat-card-title">${card.title}</h2>`;

        const content = document.createElement('div');
        content.className = 'stat-card-content';

        // Generate chart based on card type
        const chart = generateChart(card.type, card.title);
        content.appendChild(chart);

        cardElement.appendChild(header);
        cardElement.appendChild(content);
        carousel.appendChild(cardElement);
    });

    container.appendChild(carousel);

    // Initialize swipe handling
    initStatsCarousel(carousel, statCards.length);
}

/**
 * Generate chart for a specific chart type
 */
function generateChart(chartType, title) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container-visual';

    if (state.leaderboard.length === 0) {
        chartContainer.innerHTML = '<div class="stat-empty">No data available for this event</div>';
        return chartContainer;
    }

    switch (chartType) {
        case 'performance-bars':
            return createPerformanceBarsChart();
        case 'rounds-stacked':
            return createRoundsStackedChart();
        case 'points-line':
            return createPointsLineChart();
        default:
            chartContainer.innerHTML = '<div class="stat-empty">Chart not available</div>';
            return chartContainer;
    }
}

/**
 * Create performance breakdown chart (birdies/eagles/aces)
 */
function createPerformanceBarsChart() {
    const container = document.createElement('div');
    container.className = 'chart-visual';

    // Sort by total performance (birdies + eagles + aces)
    const sortedPlayers = [...state.leaderboard]
        .map(p => ({
            ...p,
            totalPerf: p.birdies + p.eagles + p.aces
        }))
        .sort((a, b) => b.totalPerf - a.totalPerf)
        .slice(0, 8);

    const maxValue = Math.max(...sortedPlayers.map(p => p.totalPerf));

    // Legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = `
        <div class="legend-item"><span class="legend-color" style="background: #4ade80"></span>Birdies</div>
        <div class="legend-item"><span class="legend-color" style="background: #fbbf24"></span>Eagles</div>
        <div class="legend-item"><span class="legend-color" style="background: #f87171"></span>Aces</div>
    `;
    container.appendChild(legend);

    // Chart area
    const chartArea = document.createElement('div');
    chartArea.className = 'chart-bars';

    sortedPlayers.forEach(player => {
        const playerBar = document.createElement('div');
        playerBar.className = 'player-bar-row';

        const playerName = document.createElement('div');
        playerName.className = 'player-bar-name';
        playerName.textContent = player.name === 'Bird' ? '🦅' : player.name;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const birdieWidth = (player.birdies / maxValue) * 100;
        const eagleWidth = (player.eagles / maxValue) * 100;
        const aceWidth = (player.aces / maxValue) * 100;

        barContainer.innerHTML = `
            <div class="bar-segment birdie-bar" style="width: ${birdieWidth}%">${player.birdies > 0 ? player.birdies : ''}</div>
            <div class="bar-segment eagle-bar" style="width: ${eagleWidth}%">${player.eagles > 0 ? player.eagles : ''}</div>
            <div class="bar-segment ace-bar" style="width: ${aceWidth}%">${player.aces > 0 ? player.aces : ''}</div>
        `;

        playerBar.appendChild(playerName);
        playerBar.appendChild(barContainer);
        chartArea.appendChild(playerBar);
    });

    container.appendChild(chartArea);
    return container;
}

/**
 * Create rounds stacked chart (wins/podiums/other)
 */
function createRoundsStackedChart() {
    const container = document.createElement('div');
    container.className = 'chart-visual';

    // Sort by total rounds
    const sortedPlayers = [...state.leaderboard]
        .sort((a, b) => b.rounds - a.rounds)
        .slice(0, 8);

    const maxRounds = Math.max(...sortedPlayers.map(p => p.rounds));

    // Legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = `
        <div class="legend-item"><span class="legend-color" style="background: #fbbf24"></span>Wins</div>
        <div class="legend-item"><span class="legend-color" style="background: #60a5fa"></span>Top 3</div>
        <div class="legend-item"><span class="legend-color" style="background: #94a3b8"></span>Other</div>
    `;
    container.appendChild(legend);

    // Chart area
    const chartArea = document.createElement('div');
    chartArea.className = 'chart-bars';

    sortedPlayers.forEach(player => {
        const playerBar = document.createElement('div');
        playerBar.className = 'player-bar-row';

        const playerName = document.createElement('div');
        playerName.className = 'player-bar-name';
        playerName.textContent = player.name === 'Bird' ? '🦅' : player.name;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';

        const winsWidth = (player.wins / maxRounds) * 100;
        const podiumsWithoutWins = player.topThreeFinishes - player.wins;
        const podiumWidth = (podiumsWithoutWins / maxRounds) * 100;
        const otherRounds = player.rounds - player.topThreeFinishes;
        const otherWidth = (otherRounds / maxRounds) * 100;

        barContainer.innerHTML = `
            <div class="bar-segment wins-bar" style="width: ${winsWidth}%">${player.wins > 0 ? player.wins : ''}</div>
            <div class="bar-segment podium-bar" style="width: ${podiumWidth}%">${podiumsWithoutWins > 0 ? podiumsWithoutWins : ''}</div>
            <div class="bar-segment other-bar" style="width: ${otherWidth}%">${otherRounds > 0 ? otherRounds : ''}</div>
        `;

        playerBar.appendChild(playerName);
        playerBar.appendChild(barContainer);
        chartArea.appendChild(playerBar);
    });

    container.appendChild(chartArea);
    return container;
}

/**
 * Create points progression line chart
 */
function createPointsLineChart() {
    const container = document.createElement('div');
    container.className = 'chart-visual';

    if (!state.roundProgression || state.roundProgression.players.length === 0) {
        container.innerHTML = `<div class="stat-empty">No round data available</div>`;
        return container;
    }

    const { rounds, players } = state.roundProgression;

    // Initialize selected players if empty (default to top 5)
    if (state.selectedChartPlayers.size === 0) {
        players.slice(0, 5).forEach(p => state.selectedChartPlayers.add(p.playerName));
    }

    // Color palette for lines (extended for more players)
    const colorPalette = [
        '#00ff88', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa',
        '#34d399', '#38bdf8', '#fb923c', '#fb7185', '#c084fc',
        '#4ade80', '#22d3ee', '#fde047', '#f472b6', '#818cf8'
    ];

    // Player selection controls
    const controls = document.createElement('div');
    controls.className = 'player-filter-controls';

    const controlButtons = document.createElement('div');
    controlButtons.className = 'filter-control-buttons';

    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'filter-control-btn';
    selectAllBtn.textContent = 'All';
    selectAllBtn.addEventListener('click', () => {
        players.forEach(p => state.selectedChartPlayers.add(p.playerName));
        renderStatsPage(document.getElementById('content'));
    });

    const clearAllBtn = document.createElement('button');
    clearAllBtn.className = 'filter-control-btn';
    clearAllBtn.textContent = 'Clear';
    clearAllBtn.addEventListener('click', () => {
        state.selectedChartPlayers.clear();
        renderStatsPage(document.getElementById('content'));
    });

    controlButtons.appendChild(selectAllBtn);
    controlButtons.appendChild(clearAllBtn);
    controls.appendChild(controlButtons);

    // Player checkboxes
    const playerFilters = document.createElement('div');
    playerFilters.className = 'player-filter-list';

    players.forEach((player, index) => {
        const filterItem = document.createElement('label');
        filterItem.className = 'player-filter-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = state.selectedChartPlayers.has(player.playerName);
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                state.selectedChartPlayers.add(player.playerName);
            } else {
                state.selectedChartPlayers.delete(player.playerName);
            }
            renderStatsPage(document.getElementById('content'));
        });

        const colorIndicator = document.createElement('span');
        colorIndicator.className = 'filter-color-indicator';
        colorIndicator.style.background = colorPalette[index % colorPalette.length];

        const playerName = document.createElement('span');
        playerName.className = 'filter-player-name';
        playerName.textContent = player.playerName === 'Bird' ? '🦅' : player.playerName;

        filterItem.appendChild(checkbox);
        filterItem.appendChild(colorIndicator);
        filterItem.appendChild(playerName);
        playerFilters.appendChild(filterItem);
    });

    controls.appendChild(playerFilters);
    container.appendChild(controls);

    // Filter to selected players only
    const selectedPlayers = players.filter(p => state.selectedChartPlayers.has(p.playerName));

    if (selectedPlayers.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'stat-empty';
        emptyMsg.textContent = 'Select players to view their progression';
        container.appendChild(emptyMsg);
        return container;
    }

    // SVG container
    const svgContainer = document.createElement('div');
    svgContainer.className = 'line-chart-svg-container';

    const width = 320;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };

    // Calculate scales
    const maxPoints = Math.max(...selectedPlayers.flatMap(p => p.points));
    const xScale = (index) => padding.left + (index / (rounds.length - 1)) * (width - padding.left - padding.right);
    const yScale = (value) => height - padding.bottom - (value / maxPoints) * (height - padding.top - padding.bottom);

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Grid lines (horizontal)
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
        const y = padding.top + (i / gridCount) * (height - padding.top - padding.bottom);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);

        // Y-axis label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', padding.left - 8);
        label.setAttribute('y', y + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('fill', '#999');
        label.setAttribute('font-size', '10');
        label.textContent = Math.round(maxPoints * (1 - i / gridCount));
        svg.appendChild(label);
    }

    // Draw lines for each player
    topPlayers.forEach((player, playerIndex) => {
        const pathData = player.points.map((point, roundIndex) => {
            const x = xScale(roundIndex);
            const y = yScale(point);
            return roundIndex === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', colors[playerIndex]);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);

        // Add dots at data points
        player.points.forEach((point, roundIndex) => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', xScale(roundIndex));
            circle.setAttribute('cy', yScale(point));
            circle.setAttribute('r', '3');
            circle.setAttribute('fill', colors[playerIndex]);
            svg.appendChild(circle);
        });
    });

    // X-axis labels (round numbers)
    rounds.forEach((round, index) => {
        const x = xScale(index);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', height - padding.bottom + 16);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#999');
        label.setAttribute('font-size', '10');
        label.textContent = `R${index + 1}`;
        svg.appendChild(label);
    });

    svgContainer.appendChild(svg);
    container.appendChild(svgContainer);

    return container;
}

/**
 * Render podcast page
 */
function renderPodcastPage(container) {
    container.innerHTML = '';

    const section = document.createElement('div');
    section.className = 'about-section';
    section.innerHTML = `
        <div class="about-title">🎙️ Season Podcast</div>
        <div class="about-content">
            <p>Automated podcast generation coming soon!</p>
            <br>
            <p>Listen to AI-generated recaps of the season highlights, player performances, and memorable moments.</p>
        </div>
    `;
    container.appendChild(section);
}

/**
 * Render about page
 */
function renderAboutPage(container) {
    container.innerHTML = '';

    const sections = [
        {
            title: '🏆 How Scoring Works',
            content: `
                <p>Points are awarded based on placement in each round, with bonuses for exceptional performance.</p>
                <ul class="about-list">
                    <li>1st Place: Most points</li>
                    <li>Birdie Bonus: Extra points per birdie</li>
                    <li>Eagle Bonus: Extra points per eagle</li>
                    <li>Ace Bonus: Extra points for hole-in-one</li>
                </ul>
            `
        },
        {
            title: '📅 Season Info',
            content: `
                <p>Track your disc golf league performance throughout the season.</p>
                <ul class="about-list">
                    <li>Multiple events per season</li>
                    <li>Tournament competitions</li>
                    <li>Year-round leaderboards</li>
                </ul>
            `
        }
    ];

    sections.forEach(section => {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'about-section';
        sectionEl.innerHTML = `
            <div class="about-title">${section.title}</div>
            <div class="about-content">${section.content}</div>
        `;
        container.appendChild(sectionEl);
    });
}

/**
 * Handle event type/selection change
 */
async function handleEventChange(type, eventId) {
    // Show loading
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(createLoadingState());

    try {
        // Update type if changed
        if (type !== state.eventType) {
            state.eventType = type;
            state.currentEvents = await getEventsByType(type);

            // Select first event of new type
            if (state.currentEvents.length > 0) {
                state.selectedEventId = state.currentEvents[0].id;
            }
        } else if (eventId) {
            // Just update selected event
            state.selectedEventId = eventId;
        }

        // Load leaderboard for new event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
            state.expandedPlayers.clear(); // Reset expanded state
        }

        renderHomePage(content);
    } catch (error) {
        console.error('Failed to change event:', error);
        showError('Failed to load event data');
    }
}

/**
 * Handle event type/selection change for stats page
 */
async function handleStatsEventChange(type, eventId) {
    // Show loading
    const content = document.getElementById('content');
    content.innerHTML = '';
    content.appendChild(createLoadingState());

    try {
        // Update type if changed
        if (type !== state.eventType) {
            state.eventType = type;
            state.currentEvents = await getEventsByType(type);

            // Select first event of new type
            if (state.currentEvents.length > 0) {
                state.selectedEventId = state.currentEvents[0].id;
            }
        } else if (eventId) {
            // Just update selected event
            state.selectedEventId = eventId;
        }

        // Load leaderboard and progression data for new event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
            state.roundProgression = await getRoundProgression(state.selectedEventId);
        }

        renderStatsPage(content);
    } catch (error) {
        console.error('Failed to change event:', error);
        showError('Failed to load event data');
    }
}

/**
 * Handle player row click (expand/collapse)
 */
function handlePlayerClick(player) {
    if (state.expandedPlayers.has(player.name)) {
        state.expandedPlayers.delete(player.name);
    } else {
        state.expandedPlayers.add(player.name);
    }
    renderHomePage(document.getElementById('content'));
}

/**
 * Handle process scorecard button
 */
async function handleProcessScorecard() {
    const fab = document.getElementById('processFab');
    fab.disabled = true;
    fab.style.opacity = '0.5';

    try {
        const result = await processScorecard();
        alert(`Scorecard processed successfully!\n\n${result.message || 'Data updated.'}`);

        // Reload data
        await loadInitialData();
        renderCurrentPage();
    } catch (error) {
        console.error('Process scorecard failed:', error);
        alert(`Failed to process scorecard: ${error.message}`);
    } finally {
        fab.disabled = false;
        fab.style.opacity = '1';
    }
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
}

/**
 * Initialize stats carousel with swipe handling
 */
function initStatsCarousel(carousel, totalCards) {
    let currentIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;

    const updateCarousel = (index, animate = true) => {
        currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        const offset = -currentIndex * 100;

        if (animate) {
            carousel.style.transition = 'transform 0.3s ease-out';
        } else {
            carousel.style.transition = 'none';
        }

        carousel.style.transform = `translateX(${offset}%)`;

        // Update indicators
        const indicators = document.querySelectorAll('.indicator-dot');
        indicators.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    };

    const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        currentX = startX;
        isDragging = true;
        startTime = Date.now();
        carousel.style.transition = 'none';
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;

        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        const offset = -currentIndex * 100 + (diff / window.innerWidth) * 100;

        carousel.style.transform = `translateX(${offset}%)`;
    };

    const handleTouchEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentX - startX;
        const duration = Date.now() - startTime;
        const velocity = Math.abs(diff) / duration;

        // Swipe threshold: 50px or fast swipe (velocity > 0.3)
        if (Math.abs(diff) > 50 || velocity > 0.3) {
            if (diff > 0 && currentIndex > 0) {
                // Swipe right - go to previous
                updateCarousel(currentIndex - 1);
            } else if (diff < 0 && currentIndex < totalCards - 1) {
                // Swipe left - go to next
                updateCarousel(currentIndex + 1);
            } else {
                // Snap back
                updateCarousel(currentIndex);
            }
        } else {
            // Snap back to current
            updateCarousel(currentIndex);
        }
    };

    // Touch events
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Click on indicator dots
    document.querySelectorAll('.indicator-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            updateCarousel(parseInt(dot.dataset.index));
        });
    });

    // Initialize position
    updateCarousel(0, false);
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
