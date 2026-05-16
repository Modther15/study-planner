/**
 * Storage Manager - Handles all localStorage persistence
 * Manages: start date, completed lectures, progress, settings, summaries, streak
 */

const StorageManager = (function () {
    const KEYS = {
        STATE: 'study_planner_state',
        SETTINGS: 'study_planner_settings',
        SUMMARIES: 'study_planner_summaries',
        STREAK: 'study_planner_streak',
        SCHEDULE: 'study_planner_schedule',
    };

    function toLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getDefaultState() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            startDate: `${toLocalDateString(today)}T00:00:00`,
            preCompletedLectures: [],    // lectures student already completed before generating plan
            completedLectures: [],       // lectures marked completed during study
            completedTasks: [],          // individual tasks marked done
            lastStudyDate: null,
            achievementActivity: {
                completionsByDate: {},   // date string -> unique completed task ids
                earlyBirdDates: [],      // dates where study was completed before 9 AM
                nightOwlDates: [],       // dates where study was completed after 10 PM
            },
        };
    }

    function getDefaultSettings() {
        return {
            darkMode: true,
            notifications: true,
            dailyGoalHours: 4,
        };
    }

    function getDefaultStreak() {
        return {
            current: 0,
            longest: 0,
            lastDate: null,
            history: [], // array of { date: 'YYYY-MM-DD', studied: bool }
        };
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(KEYS.STATE);
            if (!raw) return getDefaultState();
            const parsed = JSON.parse(raw);
            return normalizeState({ ...getDefaultState(), ...parsed });
        } catch {
            return getDefaultState();
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(KEYS.STATE, JSON.stringify(normalizeState(state)));
        } catch (e) {
            console.warn('Failed to save state:', e);
        }
    }

    function normalizeState(state) {
        const normalized = { ...getDefaultState(), ...(state || {}) };
        const completed = new Set(normalized.completedLectures || []);

        // Older versions stored course checkboxes separately as
        // preCompletedLectures. Keep migrating all completion-like fields into
        // the single shared completedLectures array.
        (normalized.preCompletedLectures || []).forEach(item => {
            completed.add(item && item.id ? item.id : item);
        });
        (normalized.completedTasks || []).forEach(id => completed.add(id));

        normalized.completedLectures = Array.from(completed).filter(Boolean);
        normalized.completedTasks = normalized.completedLectures;
        normalized.preCompletedLectures = normalized.completedLectures.map(id => ({
            id,
            courseId: (normalized.preCompletedLectures || []).find(item =>
                item && (item.id === id || item === id)
            )?.courseId || null,
        }));
        normalized.achievementActivity = {
            completionsByDate: {
                ...((normalized.achievementActivity || {}).completionsByDate || {}),
            },
            earlyBirdDates: Array.from(new Set(
                ((normalized.achievementActivity || {}).earlyBirdDates || []).filter(Boolean)
            )),
            nightOwlDates: Array.from(new Set(
                ((normalized.achievementActivity || {}).nightOwlDates || []).filter(Boolean)
            )),
        };

        return normalized;
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(KEYS.SETTINGS);
            if (!raw) return getDefaultSettings();
            return { ...getDefaultSettings(), ...JSON.parse(raw) };
        } catch {
            return getDefaultSettings();
        }
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    function hydrateSchedule(schedule) {
        if (!schedule || !Array.isArray(schedule.days)) return null;

        schedule.days = schedule.days.map(day => {
            const dateStr = day.dateStr || String(day.date || '').split('T')[0];
            const [year, month, date] = dateStr.split('-').map(Number);
            return {
                ...day,
                dateStr,
                date: new Date(year, month - 1, date),
                studies: day.studies || [],
                examsOnDay: day.examsOnDay || [],
            };
        });

        return schedule;
    }

    function loadSchedule() {
        try {
            const raw = localStorage.getItem(KEYS.SCHEDULE);
            if (!raw) return null;
            return hydrateSchedule(JSON.parse(raw));
        } catch {
            return null;
        }
    }

    function saveSchedule(schedule) {
        try {
            localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
        } catch (e) {
            console.warn('Failed to save schedule:', e);
        }
    }

    function loadStreak() {
        try {
            const raw = localStorage.getItem(KEYS.STREAK);
            if (!raw) return getDefaultStreak();
            return { ...getDefaultStreak(), ...JSON.parse(raw) };
        } catch {
            return getDefaultStreak();
        }
    }

    function saveStreak(streak) {
        try {
            localStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
        } catch (e) {
            console.warn('Failed to save streak:', e);
        }
    }

    function loadSummaries() {
        try {
            const raw = localStorage.getItem(KEYS.SUMMARIES);
            if (!raw || raw === '[]') {
                // Seed default summaries on first visit
                const defaultSummaries = [
                    {
                        studentName: 'Mayar',
                        subject: 'Database',
                        link: 'https://drive.google.com/file/d/1nWlFGphiWmNcVdEaZJK1d8xZBO4y0bsD/view?usp=drivesdk',
                        description: 'Database summary covering SQL, normalization, ER diagrams, and relational algebra concepts.',
                    },
                    {
                        studentName: 'Mayar',
                        subject: 'Probability & Statistics 2',
                        link: 'https://drive.google.com/file/d/1UYMq_2dyoG5leomFWhkW3Fk28nR_3GYO/view?usp=drivesdk',
                        description: 'Statistics 2 summary covering sampling distributions, hypothesis testing, and confidence intervals.',
                    },
                ];
                localStorage.setItem(KEYS.SUMMARIES, JSON.stringify(defaultSummaries));
                return defaultSummaries;
            }
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    function saveSummaries(summaries) {
        try {
            localStorage.setItem(KEYS.SUMMARIES, JSON.stringify(summaries));
        } catch (e) {
            console.warn('Failed to save summaries:', e);
        }
    }

    function resetAll() {
        localStorage.removeItem(KEYS.STATE);
        localStorage.removeItem(KEYS.STREAK);
        localStorage.removeItem(KEYS.SCHEDULE);
        // Keep summaries, settings, and achievements
    }

    function isFirstVisit() {
        return !localStorage.getItem(KEYS.STATE);
    }

    function updateStreak() {
        let streak = loadStreak();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toLocalDateString(today);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = toLocalDateString(yesterday);

        if (streak.lastDate === todayStr) return streak; // Already counted today

        if (streak.lastDate === yesterdayStr) {
            streak.current += 1;
        } else if (streak.lastDate !== todayStr) {
            streak.current = 1;
        }

        streak.lastDate = todayStr;
        streak.longest = Math.max(streak.longest, streak.current);

        const historyEntry = streak.history.find(h => h.date === todayStr);
        if (historyEntry) {
            historyEntry.studied = true;
        } else {
            streak.history.push({ date: todayStr, studied: true });
        }

        // Keep only last 90 days of history
        if (streak.history.length > 90) {
            streak.history = streak.history.slice(-90);
        }

        saveStreak(streak);
        return streak;
    }

    return {
        loadState,
        saveState,
        loadSettings,
        saveSettings,
        loadSchedule,
        saveSchedule,
        loadStreak,
        saveStreak,
        loadSummaries,
        saveSummaries,
        resetAll,
        isFirstVisit,
        updateStreak,
    };
})();
