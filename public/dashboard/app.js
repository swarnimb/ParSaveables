/**
 * Main Application - Orchestrates the dashboard
 */

import { initSupabase, getEvents, getEventsByType, getLeaderboard, getActiveEvent, processScorecard, getRoundProgression, getPlayerScoresByTier } from '/dashboard/data.js';
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
    selectedChartPlayers: new Set(),
    selectedPlayerForScores: null, // For average score chart
    currentCarouselIndex: 0 // Track current chart position
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

        // Load leaderboard and round progression for selected event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
            state.roundProgression = await getRoundProgression(state.selectedEventId);
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
async function renderCurrentPage() {
    const content = document.getElementById('content');

    switch (state.currentPage) {
        case 'home':
            renderHomePage(content);
            break;
        case 'stats':
            await renderStatsPage(content);
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
async function renderStatsPage(container) {
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
        { title: 'Average Score Analysis', type: 'score-bars' }
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
    for (const card of statCards) {
        const cardElement = document.createElement('div');
        cardElement.className = 'stat-card';

        const header = document.createElement('div');
        header.className = 'stat-card-header';
        header.innerHTML = `<h2 class="stat-card-title">${card.title}</h2>`;

        const content = document.createElement('div');
        content.className = 'stat-card-content';

        // Generate chart based on card type (await async charts)
        const chart = await generateChart(card.type, card.title);
        content.appendChild(chart);

        cardElement.appendChild(header);
        cardElement.appendChild(content);
        carousel.appendChild(cardElement);
    }

    container.appendChild(carousel);

    // Initialize swipe handling
    initStatsCarousel(carousel, statCards.length);
}

/**
 * Generate chart for a specific chart type
 */
async function generateChart(chartType, title) {
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
        case 'score-bars':
            return await createScoreBarsChart();
        default:
            chartContainer.innerHTML = '<div class="stat-empty">Chart not available</div>';
            return chartContainer;
    }
}

/**
 * Create horizontal stacked bar chart (reusable helper)
 */
function createStackedBarChart(config) {
    const container = document.createElement('div');
    container.className = 'chart-visual';

    // Legend
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    legend.innerHTML = config.legend.map(item =>
        `<div class="legend-item"><span class="legend-color" style="background: ${item.color}"></span>${item.label}</div>`
    ).join('');
    container.appendChild(legend);

    // Chart area
    const chartArea = document.createElement('div');
    chartArea.className = 'chart-bars';

    config.data.forEach(row => {
        const barRow = document.createElement('div');
        barRow.className = 'player-bar-row';

        const nameEl = document.createElement('div');
        nameEl.className = 'player-bar-name';
        nameEl.textContent = row.name === 'Bird' ? '🦅' : row.name;

        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        barContainer.innerHTML = row.segments.map(seg =>
            `<div class="bar-segment ${seg.class}" style="width: ${seg.width}%">${seg.value > 0 ? seg.value : ''}</div>`
        ).join('');

        barRow.appendChild(nameEl);
        barRow.appendChild(barContainer);
        chartArea.appendChild(barRow);
    });

    container.appendChild(chartArea);
    return container;
}

/**
 * Create performance breakdown chart (birdies/eagles/aces)
 */
function createPerformanceBarsChart() {
    const sortedPlayers = [...state.leaderboard]
        .map(p => ({ ...p, totalPerf: p.birdies + p.eagles + p.aces }))
        .sort((a, b) => b.totalPerf - a.totalPerf)
        .slice(0, 8);

    const maxValue = Math.max(...sortedPlayers.map(p => p.totalPerf));

    return createStackedBarChart({
        legend: [
            { color: '#4ade80', label: 'Birdies' },
            { color: '#fbbf24', label: 'Eagles' },
            { color: '#f87171', label: 'Aces' }
        ],
        data: sortedPlayers.map(p => ({
            name: p.name,
            segments: [
                { class: 'birdie-bar', width: (p.birdies / maxValue) * 100, value: p.birdies },
                { class: 'eagle-bar', width: (p.eagles / maxValue) * 100, value: p.eagles },
                { class: 'ace-bar', width: (p.aces / maxValue) * 100, value: p.aces }
            ]
        }))
    });
}

/**
 * Create rounds stacked chart (wins/podiums/other)
 */
function createRoundsStackedChart() {
    const sortedPlayers = [...state.leaderboard]
        .sort((a, b) => b.rounds - a.rounds)
        .slice(0, 8);

    const maxRounds = Math.max(...sortedPlayers.map(p => p.rounds));

    return createStackedBarChart({
        legend: [
            { color: '#fbbf24', label: 'Wins' },
            { color: '#60a5fa', label: 'Top 3' },
            { color: '#94a3b8', label: 'Other' }
        ],
        data: sortedPlayers.map(p => {
            const podiumsWithoutWins = p.topThreeFinishes - p.wins;
            const otherRounds = p.rounds - p.topThreeFinishes;
            return {
                name: p.name,
                segments: [
                    { class: 'wins-bar', width: (p.wins / maxRounds) * 100, value: p.wins },
                    { class: 'podium-bar', width: (podiumsWithoutWins / maxRounds) * 100, value: podiumsWithoutWins },
                    { class: 'other-bar', width: (otherRounds / maxRounds) * 100, value: otherRounds }
                ]
            };
        })
    });
}

/**
 * Create points progression line chart
 */
/**
 * Create average score by tier/round chart
 */
async function createScoreBarsChart() {
    const container = document.createElement('div');
    container.className = 'chart-visual';

    // Player dropdown selector
    const playerSelector = document.createElement('div');
    playerSelector.className = 'player-selector';

    const dropdown = document.createElement('select');
    dropdown.className = 'player-dropdown';

    // Initialize with first player if not set
    if (!state.selectedPlayerForScores && state.leaderboard.length > 0) {
        state.selectedPlayerForScores = state.leaderboard[0].name;
    }

    // Add all players to dropdown
    state.leaderboard.forEach(player => {
        const option = document.createElement('option');
        option.value = player.name;
        option.textContent = player.name === 'Bird' ? '🦅' : player.name;
        option.selected = player.name === state.selectedPlayerForScores;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', async (e) => {
        state.selectedPlayerForScores = e.target.value;
        await renderStatsPage(document.getElementById('content'));
    });

    playerSelector.appendChild(dropdown);
    container.appendChild(playerSelector);

    if (!state.selectedPlayerForScores) {
        container.innerHTML += '<div class="stat-empty">No player selected</div>';
        return container;
    }

    // Fetch player score data
    try {
        const scoreData = await getPlayerScoresByTier(state.selectedEventId, state.selectedPlayerForScores);

        if (!scoreData || scoreData.data.length === 0) {
            container.innerHTML += '<div class="stat-empty">No score data available</div>';
            return container;
        }

        // Chart title based on type
        const chartTitle = document.createElement('div');
        chartTitle.className = 'chart-subtitle';
        chartTitle.textContent = scoreData.type === 'tier'
            ? 'Average Score by Course Tier'
            : 'Score by Round';
        container.appendChild(chartTitle);

        // Horizontal bars
        const barsContainer = document.createElement('div');
        barsContainer.className = 'score-bars-container';

        const maxValue = Math.max(...scoreData.data.map(d => d.value));

        scoreData.data.forEach(item => {
            const barRow = document.createElement('div');
            barRow.className = 'player-bar-row';

            const label = document.createElement('div');
            label.className = 'player-bar-name';
            label.textContent = item.label;

            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';

            const bar = document.createElement('div');
            bar.className = 'bar-segment score-bar';
            bar.style.width = `${(item.value / maxValue) * 100}%`;
            bar.textContent = item.value;

            barContainer.appendChild(bar);

            barRow.appendChild(label);
            barRow.appendChild(barContainer);
            barsContainer.appendChild(barRow);
        });

        container.appendChild(barsContainer);

    } catch (error) {
        console.error('Failed to load score data:', error);
        container.innerHTML += '<div class="stat-empty">Failed to load score data</div>';
    }

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

        // Load leaderboard and round progression for new event
        if (state.selectedEventId) {
            state.leaderboard = await getLeaderboard(state.selectedEventId);
            state.roundProgression = await getRoundProgression(state.selectedEventId);
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

        await renderStatsPage(content);
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
    let currentIndex = state.currentCarouselIndex || 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let startTime = 0;

    const updateCarousel = (index, animate = true) => {
        currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        state.currentCarouselIndex = currentIndex; // Save to state
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

    // Initialize position (restore from state or start at 0)
    updateCarousel(currentIndex, false);
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
