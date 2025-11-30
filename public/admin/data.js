/**
 * Data Layer - Supabase Operations
 * Handles all database CRUD operations
 */

const SUPABASE_URL = 'https://bcovevbtcdsgzbrieiin.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjb3ZldmJ0Y2RzZ3picmllaWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA3OTEsImV4cCI6MjA3NjIwNjc5MX0.etzrLL8yw4n_NUdYnr_bdcrKphW67dYln8CjR54NSLA';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================
// PLAYERS
// ===================

export async function getPlayers() {
    const { data, error } = await supabase
        .from('registered_players')
        .select('*')
        .order('player_name');

    if (error) throw error;
    return data || [];
}

export async function createPlayer(playerData) {
    const { data, error } = await supabase
        .from('registered_players')
        .insert([{
            player_name: playerData.name,
            active: playerData.active ?? true
        }])
        .select();

    if (error) throw error;
    return data[0];
}

export async function updatePlayer(id, playerData) {
    const { data, error } = await supabase
        .from('registered_players')
        .update({
            player_name: playerData.name,
            active: playerData.active
        })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
}

export async function deletePlayer(id) {
    const { error } = await supabase
        .from('registered_players')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ===================
// COURSES
// ===================

export async function getCourses() {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            *,
            aliases:course_aliases(alias)
        `)
        .order('course_name');

    if (error) throw error;
    return data || [];
}

export async function createCourse(courseData) {
    const { data, error } = await supabase
        .from('courses')
        .insert([{
            course_name: courseData.name,
            tier: courseData.tier || 2,
            multiplier: courseData.multiplier || 1.0
        }])
        .select();

    if (error) throw error;
    return data[0];
}

export async function updateCourse(id, courseData) {
    const { data, error} = await supabase
        .from('courses')
        .update({
            course_name: courseData.name,
            tier: courseData.tier,
            multiplier: courseData.multiplier
        })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
}

export async function deleteCourse(id) {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function getCourseAliases(courseId) {
    const { data, error } = await supabase
        .from('course_aliases')
        .select('*')
        .eq('course_id', courseId);

    if (error) throw error;
    return data || [];
}

export async function addCourseAlias(courseId, alias) {
    const { data, error } = await supabase
        .from('course_aliases')
        .insert([{
            course_id: courseId,
            alias: alias
        }])
        .select();

    if (error) throw error;
    return data[0];
}

export async function deleteCourseAlias(aliasId) {
    const { error } = await supabase
        .from('course_aliases')
        .delete()
        .eq('id', aliasId);

    if (error) throw error;
}

// ===================
// EVENTS
// ===================

export async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select(`
            *,
            points_system:points_systems(name, config)
        `)
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createEvent(eventData) {
    const { data, error } = await supabase
        .from('events')
        .insert([{
            name: eventData.name,
            type: eventData.type,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            points_system_id: eventData.points_system_id,
            players: eventData.players || []
        }])
        .select();

    if (error) throw error;
    return data[0];
}

export async function updateEvent(id, eventData) {
    const { data, error } = await supabase
        .from('events')
        .update({
            name: eventData.name,
            type: eventData.type,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            points_system_id: eventData.points_system_id,
            players: eventData.players
        })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
}

export async function deleteEvent(id) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ===================
// POINTS SYSTEMS
// ===================

export async function getPointsSystems() {
    const { data, error } = await supabase
        .from('points_systems')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function createPointsSystem(systemData) {
    const { data, error } = await supabase
        .from('points_systems')
        .insert([{
            name: systemData.name,
            config: systemData.config
        }])
        .select();

    if (error) throw error;
    return data[0];
}

export async function updatePointsSystem(id, systemData) {
    const { data, error } = await supabase
        .from('points_systems')
        .update({
            name: systemData.name,
            config: systemData.config
        })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data[0];
}

export async function deletePointsSystem(id) {
    const { error } = await supabase
        .from('points_systems')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ===================
// UTILITY
// ===================

export function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

export function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

export function showError(message) {
    alert(`Error: ${message}`);
}

export function showSuccess(message) {
    // Could enhance this with a toast notification system
    console.log('Success:', message);
}
