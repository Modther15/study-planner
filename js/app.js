/**
 * Main Application - Coordinates all modules and manages UI
 * Uses event delegation for all handlers and central refresh for state sync
 */

const App = (function () {
  // Module-level state (single source of truth, always re-read from localStorage on init)
  let state = {};
  let settings = {};
  let streak = {};
  let schedule = null;
  let summaries = [];
  let currentSection = "dashboard";
  let activeScheduleFilter = "all";
  let expandedCourseIds = new Set();
  const ACHIEVEMENTS_KEY = "study_planner_achievements";

  function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Initialize the application
   */
  function init() {
    loadFromStorage();

    // Apply theme
    applyTheme(settings.darkMode);

    // Default start date to today if not set
    if (!state.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      state.startDate = `${toLocalDateString(today)}T00:00:00`;
      StorageManager.saveState(state);
    }

    // Render all sections once
    render();

    // Generate initial schedule
    generateSchedule();

    // Check for streak update
    checkStreakUpdate();

    // Setup all event listeners (event delegation)
    setupEventListeners();

    // Synchronize progress if the same planner is open in another tab/window.
    window.addEventListener("storage", (e) => {
      if (
        [
          "study_planner_state",
          "study_planner_schedule",
          "study_planner_settings",
          "study_planner_streak",
        ].includes(e.key)
      ) {
        refreshAll();
      }
    });

    // Check achievements
    checkAchievements();
  }

  /**
   * Reload all state from localStorage (call after any external change)
   */
  function loadFromStorage() {
    state = StorageManager.loadState();
    settings = StorageManager.loadSettings();
    streak = StorageManager.loadStreak();
    schedule = StorageManager.loadSchedule();
    summaries = StorageManager.loadSummaries();
  }

  /**
   * Central refresh - re-render all visible sections
   * Call this after ANY state change to ensure all sections stay in sync
   */
  function refreshAll() {
    // Always reload fresh state from localStorage so dashboard shows live values
    loadFromStorage();

    renderDashboard();
    renderCourses();
    renderSchedule();
    renderProgress();

    if (currentSection === "resources") renderResources();
    if (currentSection === "summaries") renderSummaries();
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  function renderDashboard() {
    const container = document.getElementById("dashboard-content");
    if (!container) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toLocalDateString(today);
    const startDateVal = state.startDate
      ? state.startDate.split("T")[0]
      : todayStr;

    container.innerHTML = `
            <div class="settings-bar">
                <div class="setting-group">
                    <span class="setting-label">Start Date:</span>
                    <input type="date" id="startDateInput"
                           value="${startDateVal}"
                           min="2026-01-01" max="2026-06-15">
                </div>
                <div class="setting-group">
                    <span class="setting-label">Daily Goal (hrs):</span>
                    <input type="number" id="dailyGoalInput"
                           value="${settings.dailyGoalHours || 4}"
                           min="1" max="12">
                </div>
                <button class="btn btn-primary" id="generateBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    Generate / Update Schedule
                </button>
                <button class="btn btn-danger" id="resetBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Reset All
                </button>
                <button class="theme-toggle" id="themeBtn" title="Toggle theme">
                    ${settings.darkMode ? "☀️" : "🌙"}
                </button>
            </div>

            <div class="stats-grid" id="dashboardStats">
                ${renderDashboardStats()}
            </div>
        `;

    // Bind settings inputs
    const startInput = document.getElementById("startDateInput");
    if (startInput) {
      startInput.addEventListener("change", (e) =>
        updateStartDate(e.target.value),
      );
    }

    const goalInput = document.getElementById("dailyGoalInput");
    if (goalInput) {
      goalInput.addEventListener("change", (e) =>
        updateDailyGoal(e.target.value),
      );
    }
  }

  function renderDashboardStats() {
    if (!schedule) {
      return `
                <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📚</div>
                    <h3 style="margin-bottom: 8px;">No schedule generated</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Select your start date above and click "Generate / Update Schedule" to create your study plan.</p>
                </div>
            `;
    }

    // Always recalculate from the freshest data
    const stats = Scheduler.recalculateStats(schedule);

    // Reload streak directly so it's always current when dashboard renders
    const currentStreak = StorageManager.loadStreak();

    return `
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-value" style="color: var(--accent-blue);">${stats.daysRemaining}</div>
                <div class="stat-label">Days Remaining</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value" style="color: var(--accent-purple);">${stats.remainingHours}h</div>
                <div class="stat-label">Hours Left</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-value" style="color: var(--accent-teal);">${stats.remainingLectures}</div>
                <div class="stat-label">Tasks Left</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-value" style="color: var(--accent-green);">${stats.completionPercentage}%</div>
                <div class="stat-label">Overall Progress</div>
            </div>
            ${
              stats.examDaysCount > 0
                ? `
                <div class="stat-card">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value" style="color: var(--accent-red);">${stats.examDaysCount}</div>
                    <div class="stat-label">Exams Scheduled</div>
                </div>
            `
                : ""
            }
            ${
              stats.nextExam
                ? `
                <div class="stat-card">
                    <div class="stat-icon">${stats.nextExam.icon || "📋"}</div>
                    <div class="stat-value" style="color: ${stats.nextExam.color || 'var(--accent-red)'}; font-size: 1.1rem;">
                        ${Scheduler.formatDate(stats.nextExam.examDate)}
                    </div>
                    <div class="stat-label">Next Exam: ${stats.nextExam.shortName || stats.nextExam.name || ''}</div>
                </div>
            `
                : ""
            }
            ${
              currentStreak.current > 0
                ? `
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value" style="color: var(--accent-amber);">${currentStreak.current}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
            `
                : ""
            }
        `;
  }

  // ==========================================
  // COURSES
  // ==========================================
  function renderCourses() {
    const container = document.getElementById("courses-list");
    if (!container) return;

    if (expandedCourseIds.size === 0 && COURSES[0]) {
      expandedCourseIds.add(COURSES[0].id);
    }

    state = StorageManager.loadState();
    const completedIds = getAllCompletedIds();

    container.innerHTML = COURSES.map((course) => {
      const courseCompletedCount = course.lectures.filter((lecture) =>
        completedIds.includes(lecture.id),
      ).length;
      const isFullyPreCompleted =
        course.lectures.length > 0 &&
        courseCompletedCount >= course.lectures.length;
      return renderCourseCardHTML(course, completedIds, isFullyPreCompleted);
    }).join("");

    expandedCourseIds.forEach((courseId) => {
      const card = container.querySelector(`.course-card[data-course-id="${courseId}"]`);
      if (card) card.classList.add("expanded");
    });
  }

  function renderCourseCardHTML(course, completedIds, isFullyPreCompleted) {
    const lecturesHtml = course.lectures
      .map((lec) => {
        const isChecked = completedIds.includes(lec.id);
        return `
                <label class="lecture-check">
                    <input type="checkbox"
                           data-lecture-id="${lec.id}"
                           data-course-id="${course.id}"
                           class="lecture-checkbox"
                           ${isChecked ? "checked" : ""}>
                    <span class="lecture-title">${lec.title}</span>
                    <span class="lecture-sub">${lec.subtitle}</span>
                </label>
            `;
      })
      .join("");

    const topicsHtml = course.topics
      .map((t) => `<span class="topic-tag">${t}</span>`)
      .join("");
    const resourcesHtml = `
            <a href="${course.driveMain}" target="_blank" class="resource-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Drive Folder
            </a>
            ${
              course.videoRef
                ? `
                <a href="${course.videoRef}" target="_blank" class="resource-btn resource-btn-secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Videos
                </a>
            `
                : ""
            }
        `;

    return `
            <div class="course-card ${isFullyPreCompleted ? "course-completed" : ""}" data-course-id="${course.id}" style="--course-color: ${course.color}; --course-color-rgb: ${course.colorRgb};">
                <div class="course-card-header" data-toggle="course">
                    <div class="course-icon" style="background: rgba(${course.colorRgb}, 0.15);">${course.icon}</div>
                    <div class="course-info">
                        <h3 class="course-name">${course.name}</h3>
                        <div class="course-meta">
                            <span class="difficulty-badge diff-${course.difficulty}">${course.difficulty}</span>
                            <span class="exam-date-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                ${new Date(course.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ${course.examDuration}
                            </span>
                        </div>
                    </div>
                    <div class="course-toggle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="course-details" id="course-details-${course.id}">
                    ${
                      course.lectures.length > 0
                        ? `
                        <div class="lectures-section">
                            <div class="lectures-header">
                                <span class="lectures-label">Select lectures you've already completed:</span>
                                <button class="select-all-btn" data-select-all="${course.id}">Toggle All</button>
                            </div>
                            <div class="lectures-list">
                                ${lecturesHtml}
                            </div>
                        </div>
                    `
                        : `
                        <p class="no-lectures-msg">No specific lectures listed. Mark as completed to optimize your schedule.</p>
                    `
                    }
                    <div class="course-topics">
                        <span class="topics-label">Key Topics:</span>
                        ${topicsHtml}
                    </div>
                    <div class="course-actions">
                        ${resourcesHtml}
                    </div>
                </div>
            </div>
        `;
  }

  function toggleCourseDetails(courseId) {
    const card = document.querySelector(
      `.course-card[data-course-id="${courseId}"]`,
    );
    if (card) {
      const shouldExpand = !card.classList.contains("expanded");
      card.classList.toggle("expanded", shouldExpand);
      if (shouldExpand) {
        expandedCourseIds.add(courseId);
      } else {
        expandedCourseIds.delete(courseId);
      }
    }
  }

  function onLectureToggle(courseId, lectureId, checked) {
    setTopicCompletion(lectureId, checked, courseId);
    if (checked) {
      StorageManager.updateStreak();
      streak = StorageManager.loadStreak();
    }
    refreshAll();
    checkAchievements();
  }

  /**
   * Toggle all lectures for a course at once, then refresh once.
   * Called from the "Toggle All" button.
   */
  function toggleAllLectures(courseId, checked) {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return;

    const lectureIds = course.lectures.map((l) => l.id);
    setTopicCompletions(lectureIds, checked);
    if (checked) {
      StorageManager.updateStreak();
      streak = StorageManager.loadStreak();
    }
    refreshAll();
    checkAchievements();
  }

  // ==========================================
  // SCHEDULE
  // ==========================================
  function renderSchedule() {
    const container = document.getElementById("schedule-content");
    if (!container) return;

    if (!schedule) {
      container.innerHTML = `
                <div class="schedule-empty">
                    <div class="schedule-empty-icon">📅</div>
                    <h3>No schedule yet</h3>
                    <p>Go to Dashboard, set your start date and generate a schedule.</p>
                </div>
            `;
      return;
    }

    // Re-read state for accurate checked states
    const allCompletedIds = getAllCompletedIds();
    const today = toLocalDateString(new Date());
    let filteredDays = schedule.days;

    if (activeScheduleFilter === "upcoming") {
      filteredDays = schedule.days.filter(
        (d) => d.dateStr >= today && !d.isExamDay,
      );
    } else if (activeScheduleFilter === "today") {
      filteredDays = schedule.days.filter((d) => d.dateStr === today);
    } else if (activeScheduleFilter === "completed") {
      filteredDays = schedule.days.filter((d) => d.dateStr < today);
    }

    const phasesHtml = buildPhasesHtml(filteredDays, allCompletedIds);

    container.innerHTML = `
            <div class="schedule-controls">
                <div class="schedule-filters">
                    <button class="filter-chip ${activeScheduleFilter === "all" ? "active" : ""}" data-filter="all">All Days</button>
                    <button class="filter-chip ${activeScheduleFilter === "upcoming" ? "active" : ""}" data-filter="upcoming">Upcoming</button>
                    <button class="filter-chip ${activeScheduleFilter === "today" ? "active" : ""}" data-filter="today">Today</button>
                    <button class="filter-chip ${activeScheduleFilter === "completed" ? "active" : ""}" data-filter="completed">Completed</button>
                </div>
            </div>
            ${phasesHtml || '<div class="schedule-empty"><p>No days match the selected filter.</p></div>'}
        `;
  }

  function buildPhasesHtml(days, completedIds) {
    if (!days || days.length === 0) return "";

    // Group days by phaseIndex
    const phaseGroups = {};
    days.forEach((day) => {
      const idx = day.phaseIndex || 0;
      if (!phaseGroups[idx]) phaseGroups[idx] = [];
      phaseGroups[idx].push(day);
    });

    const phaseLabels = {
      1: "Database + Marketing Prep",
      2: "Statistics + Crypto + Networks",
      3: "Data Structures Final",
      4: "Cryptography Final Phase",
    };
    const phaseColors = {
      1: "var(--accent-blue)",
      2: "var(--accent-purple)",
      3: "var(--accent-amber)",
      4: "var(--accent-teal)",
    };
    const todayStr = toLocalDateString(new Date());

    return Object.entries(phaseGroups)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([idx, phaseDays]) => {
        const firstDay = phaseDays[0];
        const lastDay = phaseDays[phaseDays.length - 1];

        const daysHtml = phaseDays
          .map((day) => {
            const isToday = day.dateStr === todayStr;
            return renderDayCardHTML(day, isToday, completedIds);
          })
          .join("");

        const label = phaseLabels[idx] || `Phase ${idx}`;

        return `
                    <div class="phase-block">
                        <div class="phase-header">
                            <span class="phase-badge" style="background: ${phaseColors[idx] || "var(--accent-purple)"}">${label}</span>
                            <span class="phase-title">${Scheduler.formatDate(firstDay.dateStr)} - ${Scheduler.formatDate(lastDay.dateStr)}</span>
                            <span class="phase-dates">${phaseDays.length} days</span>
                        </div>
                        <div class="schedule-grid">
                            ${daysHtml}
                        </div>
                    </div>
                `;
      })
      .join("");
  }

  function renderDayCardHTML(day, isToday, completedIds) {
    const courseMap = {};
    COURSES.forEach((c) => {
      courseMap[c.id] = c;
    });

    const studiesHtml = day.studies
      .map((st) => {
        const course = courseMap[st.courseId] || {
          colorRgb: st.courseColor || "59,130,246",
          icon: st.courseIcon || "📚",
          color: "var(--accent-blue)",
          shortName: st.courseName || "Subject",
        };
        const isDone = completedIds.includes(st.lectureId);
        const isExam = st.type === "exam";
        const isPractice = st.type === "practice" || st.phase === "practice";
        const isRecall = st.type === "recall" || st.phase === "active_recall";
        const isReview =
          st.isReview ||
          st.phase === "revision" ||
          st.phase === "spaced_review";
        const isPostExam = st.isPostExam || false;
        const tagColor = isExam
          ? "var(--accent-red)"
          : isPractice
            ? "var(--accent-green)"
            : isRecall
              ? "var(--accent-purple)"
              : isReview
                ? "var(--accent-amber)"
                : "var(--accent-blue)";

        return `
                <div class="study-item ${isDone ? "study-done" : ""} ${isPostExam ? "study-post-exam" : ""}" data-lecture-id="${st.lectureId}">
                    <label class="study-check-label">
                        <input type="checkbox" class="schedule-checkbox"
                               data-lecture-id="${st.lectureId}"
                               ${isDone ? "checked" : ""}>
                        <span class="study-info">
                            <span class="study-course-tag" style="background: rgba(${course.colorRgb}, 0.15); color: ${course.color};">
                                ${course.icon} ${st.courseName}
                            </span>
                            ${isReview ? '<span class="study-review-badge">Review</span>' : ""}
                            ${isExam ? '<span class="study-exam-badge">Exam</span>' : ""}
                            ${isPractice ? '<span class="study-practice-badge">Practice</span>' : ""}
                            ${isRecall ? '<span class="study-recall-badge">Recall</span>' : ""}
                            ${isPostExam ? '<span class="study-postexam-badge">Post-Exam</span>' : ""}
                            ${isDone ? '<span class="study-completed-badge">Completed</span>' : ""}
                            <span class="study-lecture">${st.lectureTitle}</span>
                            <span class="study-hours" style="color: ${tagColor};">${st.hours}h</span>
                        </span>
                    </label>
                </div>
            `;
      })
      .join("");

    const examsHtml = day.examsOnDay
      .map((e) => {
        const c = courseMap[e.id];
        return `
                <div class="exam-badge" style="background: rgba(${c ? c.colorRgb : "239,68,68"}, 0.15); border-left: 3px solid ${c ? c.color : "var(--accent-red)"};">
                    ${c ? c.icon : "📋"} ${e.name} - EXAM TODAY
                </div>
            `;
      })
      .join("");

    const phaseColors = {
      1: "var(--accent-blue)",
      2: "var(--accent-purple)",
      3: "var(--accent-amber)",
      4: "var(--accent-teal)",
    };
    const phaseColor = phaseColors[day.phaseIndex] || "var(--accent-blue)";

    return `
            <div class="day-card ${day.isExamDay ? "exam-day-card" : ""} ${isToday ? "today-card" : ""}" data-date="${day.dateStr}">
                <div class="day-header">
                    <div class="day-date-block">
                        <span class="day-weekday">${day.date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <span class="day-num">${day.date.getDate()}</span>
                        <span class="day-month">${day.date.toLocaleDateString("en-US", { month: "short" })}</span>
                    </div>
                    <div class="day-info">
                        ${day.totalHours > 0 ? `<span class="day-hours">${day.totalHours}h</span>` : '<span class="day-rest">Light day</span>'}
                        ${day.phaseIndex ? `<span class="day-phase" style="color: ${phaseColor}">P${day.phaseIndex}</span>` : ""}
                        ${isToday ? '<span class="today-badge">TODAY</span>' : ""}
                    </div>
                </div>
                ${day.isExamDay ? `<div class="exam-notice">${examsHtml}</div>` : ""}
                ${studiesHtml ? `<div class="study-list">${studiesHtml}</div>` : ""}
                ${!day.isExamDay && day.totalHours === 0 ? '<p class="no-studies-msg">Rest day. Keep your energy for the next exam!</p>' : ""}
            </div>
        `;
  }

  function filterSchedule(filter) {
    activeScheduleFilter = filter;
    renderSchedule();
  }

  // ==========================================
  // PROGRESS
  // ==========================================
  function renderProgress() {
    const container = document.getElementById("progress-content");
    if (!container) return;

    // Re-read state
    const allCompletedIds = getAllCompletedIds();

    // Calculate progress from the shared task universe:
    // course lectures + generated non-exam schedule tasks.
    const progressTaskIds = getProgressTaskIds();
    const completedTaskIdSet = new Set(
      allCompletedIds.filter((id) => progressTaskIds.includes(id)),
    );
    const totalTasks = progressTaskIds.length;
    const completedTasks = completedTaskIdSet.size;
    const remainingTasks = Math.max(0, totalTasks - completedTasks);
    const pct =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const motivationalMsg = Components.getMotivationalMessage(pct);

    // Course progress from COURSES data (for the courses section)
    const courseProgressHtml = COURSES.map((course) => {
      const completedCount = allCompletedIds.filter((id) =>
        course.lectures.some((l) => l.id === id),
      ).length;
      return Components.renderCourseProgressCard(
        course,
        completedCount,
        course.lectures.length,
      ).outerHTML;
    }).join("");

    // Streak
    const streakHtml =
      streak.current > 0 ? Components.renderStreakCard(streak).outerHTML : "";

    // Achievements
    const achievementsHtml = ACHIEVEMENTS.map((a) => {
      const unlocked = checkAchievementUnlocked(a.id);
      return Components.renderAchievementBadge(a, unlocked).outerHTML;
    }).join("");

    // Suggestions
    const suggestionsHtml = buildSuggestionsHtml();

    container.innerHTML = `
            <div class="progress-section">
                <div class="motivational-card">
                    <p class="motivational-msg">${motivationalMsg}</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar-track">
                            <div class="progress-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));"></div>
                        </div>
                        <span class="progress-percentage">${pct}%</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 8px;">
                        ${completedTasks} of ${totalTasks} tasks completed &bull; ${remainingTasks} remaining
                    </p>
                </div>
            </div>

            ${
              streakHtml
                ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><span>🔥</span> Study Streak</h3>
                    </div>
                    ${streakHtml}
                    <div style="margin-top: 12px;">
                        <span class="setting-label">Last 7 days:</span>
                        <div style="display: flex; gap: 4px; margin-top: 6px;">
                            ${getLast7DaysHtml()}
                        </div>
                    </div>
                </div>
            `
                : ""
            }

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><span>📊</span> Course Overview</h3>
                </div>
                <div class="course-progress-cards">
                    ${courseProgressHtml}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><span>🏆</span> Achievements</h3>
                </div>
                <div class="achievements-grid">
                    ${achievementsHtml}
                </div>
            </div>

            ${
              suggestionsHtml
                ? `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><span>💡</span> Productive Activities</h3>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">For completed courses</span>
                    </div>
                    ${suggestionsHtml}
                </div>
            `
                : ""
            }
        `;
  }

  function buildSuggestionsHtml() {
    if (!schedule) return "";

    const allCompletedIds = getAllCompletedIds();

    const completedCourses = COURSES.filter(
      (course) =>
        course.lectures.length > 0 &&
        course.lectures.every((l) => allCompletedIds.includes(l.id)),
    );

    if (completedCourses.length === 0) return "";

    return completedCourses
      .map((course) => {
        const suggestion = {
          courseId: course.id,
          courseName: course.shortName,
          courseIcon: course.icon,
          activities: [
            {
              type: "exam",
              label: `Solve ${course.shortName} Previous Exams`,
              icon: "📝",
              link:
                course.resources.find(
                  (r) =>
                    r.label.includes("Midterm") || r.label.includes("Exam"),
                )?.link || course.driveMain,
            },
            {
              type: "revision",
              label: `Review ${course.shortName} Key Concepts`,
              icon: "🔄",
              link:
                course.resources.find(
                  (r) =>
                    r.label.includes("Lectures") ||
                    r.label.includes("Problems"),
                )?.link || null,
            },
            {
              type: "practice",
              label: `${course.shortName} Practice Sheets`,
              icon: "✏️",
              link:
                course.resources.find(
                  (r) =>
                    r.label.includes("Sheet") || r.label.includes("Exercise"),
                )?.link || null,
            },
            {
              type: "video",
              label: `Supplementary Videos`,
              icon: "🎬",
              link: course.videoRef || null,
            },
          ],
        };
        return Components.renderSuggestionCard(suggestion).outerHTML;
      })
      .join("");
  }

  function getLast7DaysHtml() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toLocalDateString(d);
      const studied =
        streak.history &&
        streak.history.some((h) => h.date === dateStr && h.studied);
      const label = d
        .toLocaleDateString("en-US", { weekday: "short" })
        .charAt(0);
      days.push(`
                <div style="
                    width: 28px; height: 28px; border-radius: 6px;
                    background: ${studied ? "var(--accent-green)" : "var(--bg-tertiary)"};
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.6rem; font-weight: 700;
                    color: ${studied ? "white" : "var(--text-muted)"};
                ">${label}</div>
            `);
    }
    return days.join("");
  }

  // ==========================================
  // RESOURCES
  // ==========================================
  function renderResources() {
    const container = document.getElementById("resources-content");
    if (!container) return;

    const resourcesHtml = COURSES.map(
      (c) => Components.renderResourceCard(c).outerHTML,
    ).join("");
    container.innerHTML = `<div class="resources-grid">${resourcesHtml}</div>`;
  }

  // ==========================================
  // SUMMARIES
  // ==========================================
  function renderSummaries() {
    const container = document.getElementById("summaries-content");
    if (!container) return;

    summaries = StorageManager.loadSummaries();

    const summariesHtml =
      summaries.length > 0
        ? summaries
            .map((s, i) => Components.renderSummaryCard(s, i).outerHTML)
            .join("")
        : '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No summaries yet. Add your first one below!</p>';

    container.innerHTML = `
            <div class="add-summary-form">
                <h3>➕ Add Student Summary</h3>
                <form id="summaryForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Student Name</label>
                            <input type="text" id="summaryName" placeholder="e.g., Ahmed Hassan" required>
                        </div>
                        <div class="form-group">
                            <label>Subject</label>
                            <select id="summarySubject" required>
                                <option value="">Select subject...</option>
                                ${COURSES.map((c) => `<option value="${c.name}">${c.name}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Summary Link (Google Drive / Docs)</label>
                        <input type="url" id="summaryLink" placeholder="https://drive.google.com/..." required>
                    </div>
                    <div class="form-group">
                        <label>Short Description (optional)</label>
                        <textarea id="summaryDesc" placeholder="Brief description of the summary..."></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-success">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Summary
                        </button>
                    </div>
                </form>
            </div>
            <div class="summaries-grid">
                ${summariesHtml}
            </div>
        `;
  }

  function addSummary() {
    const name = document.getElementById("summaryName").value.trim();
    const subject = document.getElementById("summarySubject").value;
    const link = document.getElementById("summaryLink").value.trim();
    const desc = document.getElementById("summaryDesc").value.trim();

    if (!name || !subject || !link) return;

    summaries.push({ studentName: name, subject, link, description: desc });
    StorageManager.saveSummaries(summaries);

    // Clear the form
    document.getElementById("summaryName").value = "";
    document.getElementById("summarySubject").value = "";
    document.getElementById("summaryLink").value = "";
    document.getElementById("summaryDesc").value = "";

    // Re-render only the summaries grid, not the whole section
    const grid = document.querySelector("#summaries-content .summaries-grid");
    if (grid) {
      grid.innerHTML = summaries
        .map((s, i) => Components.renderSummaryCard(s, i).outerHTML)
        .join("");
    }

    // Show toast
    showToast("Summary added successfully!");
  }

  function deleteSummary(index) {
    summaries.splice(index, 1);
    StorageManager.saveSummaries(summaries);
    renderSummaries();
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  function render() {
    renderDashboard();
    renderCourses();
    renderSchedule();
    renderProgress();
    renderResources();
    renderSummaries();
  }

  // ==========================================
  // EVENT DELEGATION (single listener on document)
  // ==========================================
  function setupEventListeners() {
    document.addEventListener("click", (e) => {
      const target = e.target;

      // Navigation tabs
      if (target.closest(".nav-tab")) {
        const tab = target.closest(".nav-tab");
        const section = tab.dataset.section;
        if (section) switchSection(section);
        return;
      }

      // Generate schedule button
      if (target.closest("#generateBtn")) {
        generateSchedule();
        return;
      }

      // Reset button
      if (target.closest("#resetBtn")) {
        showResetModal();
        return;
      }

      // Theme toggle
      if (target.closest("#themeBtn")) {
        toggleTheme();
        return;
      }

      // Lecture controls should only update completion, never expand/collapse.
      if (target.closest(".lecture-check") || target.closest(".lecture-checkbox")) {
        e.stopPropagation();
        return;
      }

      // Course card toggle: only the dedicated header opens/closes details.
      const courseHeader = target.closest(".course-card-header[data-toggle='course']");
      if (courseHeader) {
        const card = courseHeader.closest(".course-card");
        if (card && card.dataset.courseId) {
          toggleCourseDetails(card.dataset.courseId);
        }
        return;
      }

      // Select all lectures in a course
      if (target.closest("[data-select-all]")) {
        const courseId = target.closest("[data-select-all]").dataset.selectAll;
        const checks = Array.from(
          document.querySelectorAll(
            `.lecture-checkbox[data-course-id="${courseId}"]`,
          ),
        );
        const allChecked = checks.every((c) => c.checked);
        // Toggle all at once — only refresh once at the end
        checks.forEach((c) => {
          c.checked = !allChecked;
        });
        toggleAllLectures(courseId, !allChecked);
        return;
      }

      // Schedule filter chips
      if (target.closest("[data-filter]")) {
        filterSchedule(target.closest("[data-filter]").dataset.filter);
        return;
      }

      // Delete summary button
      if (target.closest(".summary-delete-btn")) {
        const grid = document.querySelector(
          "#summaries-content .summaries-grid",
        );
        const card = target.closest(".summary-card");
        if (grid && card) {
          const index = Array.from(
            grid.querySelectorAll(".summary-card"),
          ).indexOf(card);
          if (index >= 0) {
            summaries.splice(index, 1);
            StorageManager.saveSummaries(summaries);
            grid.innerHTML =
              summaries.length > 0
                ? summaries
                    .map((s, i) => Components.renderSummaryCard(s, i).outerHTML)
                    .join("")
                : '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No summaries yet. Add your first one below!</p>';
            showToast("Summary deleted.");
          }
        }
        return;
      }

      // Modal cancel button
      if (target.closest("#modalCancelBtn")) {
        hideResetModal();
        return;
      }

      // Modal confirm reset button
      if (target.closest("#modalConfirmResetBtn")) {
        confirmReset();
        return;
      }
    });

    // Change events (checkboxes)
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("lecture-checkbox")) {
        e.stopPropagation();
        onLectureToggle(
          e.target.dataset.courseId,
          e.target.dataset.lectureId,
          e.target.checked,
        );
        return;
      }

      if (e.target.classList.contains("schedule-checkbox")) {
        toggleLectureCompletion(e.target.dataset.lectureId, e.target.checked);
        return;
      }
    });

    // Form submit events
    document.addEventListener("submit", (e) => {
      if (e.target.id === "summaryForm") {
        e.preventDefault();
        addSummary();
        return;
      }
    });
  }

  // ==========================================
  // NAVIGATION
  // ==========================================
  function switchSection(section) {
    const tabs = document.querySelectorAll(".nav-tab");
    const panels = document.querySelectorAll(".section-panel");

    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    const activeTab = document.querySelector(
      `.nav-tab[data-section="${section}"]`,
    );
    const activePanel = document.getElementById(`${section}-section`);

    if (activeTab) activeTab.classList.add("active");
    if (activePanel) activePanel.classList.add("active");

    currentSection = section;

    // Re-render the section to pick up latest state
    switch (section) {
      case "dashboard":
        renderDashboard();
        break;
      case "courses":
        renderCourses();
        break;
      case "schedule":
        renderSchedule();
        break;
      case "progress":
        renderProgress();
        break;
      case "resources":
        renderResources();
        break;
      case "summaries":
        renderSummaries();
        break;
    }
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  function toggleTheme() {
    settings.darkMode = !settings.darkMode;
    StorageManager.saveSettings(settings);
    applyTheme(settings.darkMode);

    const toggle = document.getElementById("themeBtn");
    if (toggle) toggle.textContent = settings.darkMode ? "☀️" : "🌙";
  }

  function applyTheme(isDark) {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }

  function updateStartDate(dateStr) {
    state.startDate = `${dateStr}T00:00:00`;
    StorageManager.saveState(state);
    generateSchedule();
  }

  function updateDailyGoal(hours) {
    settings.dailyGoalHours = parseInt(hours) || 4;
    StorageManager.saveSettings(settings);
    generateSchedule();
  }

  // ==========================================
  // SCHEDULE GENERATION
  // ==========================================
  function generateSchedule() {
    loadFromStorage();
    const startDate =
      state.startDate || `${toLocalDateString(new Date())}T00:00:00`;
    const preCompleted = state.preCompletedLectures || [];
    const dailyHours = settings.dailyGoalHours || 4;

    schedule = Scheduler.generateSchedule(startDate, preCompleted, dailyHours);
    StorageManager.saveSchedule(schedule);

    // Refresh all sections so stats reflect the new schedule
    refreshAll();
    checkAchievements();
  }

  // ==========================================
  // LECTURE COMPLETION (from schedule)
  // ==========================================
  function toggleLectureCompletion(lectureId, checked) {
    setTopicCompletion(lectureId, checked);

    if (checked) {
      StorageManager.updateStreak();
    }

    // Update streak in memory
    streak = StorageManager.loadStreak();

    refreshAll();

    // Check achievements
    checkAchievements();
  }

  // ==========================================
  // STREAK & ACHIEVEMENTS
  // ==========================================
  function checkStreakUpdate() {
    if (state.lastStudyDate) {
      const today = toLocalDateString(new Date());
      const lastDate = toLocalDateString(new Date(state.lastStudyDate));
      if (lastDate === today) {
        streak = StorageManager.updateStreak();
      }
    }
  }

  function checkAchievements() {
    const freshState = StorageManager.loadState();
    const allCompletedIds = getAllCompletedIds();
    const unlocked = loadUnlockedAchievements();
    const unlockedSet = new Set(unlocked);
    const activity = getAchievementActivity(freshState);
    let unlockedChanged = false;

    const achievements = [
      { id: "first_lecture", condition: allCompletedIds.length >= 1 },
      {
        id: "early_bird",
        condition:
          activity.earlyBirdDates.length > 0 ||
          isEarlyBirdDate(freshState.lastStudyDate),
      },
      {
        id: "halfway",
        condition:
          allCompletedIds.length >=
          Math.ceil(COURSES.reduce((s, c) => s + c.lectures.length, 0) / 2),
      },
      { id: "streak_3", condition: streak.current >= 3 },
      { id: "streak_7", condition: streak.current >= 7 },
      {
        id: "speed_demon",
        condition: Object.values(activity.completionsByDate).some(
          (ids) => new Set(ids || []).size >= 5,
        ),
      },
      {
        id: "night_owl",
        condition:
          activity.nightOwlDates.length > 0 ||
          isNightOwlDate(freshState.lastStudyDate),
      },
      {
        id: "all_exams_prepped",
        condition: COURSES.every((c) =>
          c.lectures.every((l) => allCompletedIds.includes(l.id)),
        ),
      },
    ];

    achievements.forEach(({ id, condition }) => {
      if (condition && !unlockedSet.has(id)) {
        unlockedSet.add(id);
        unlockedChanged = true;
        const achievement = ACHIEVEMENTS.find((a) => a.id === id);
        if (achievement)
          showToast(`🏆 Achievement Unlocked: ${achievement.label}`);
      }
    });

    saveUnlockedAchievements(Array.from(unlockedSet));
    if (unlockedChanged && currentSection === "progress") {
      renderProgress();
    }
  }

  function checkAchievementUnlocked(id) {
    return loadUnlockedAchievements().includes(id);
  }

  function loadUnlockedAchievements() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || "[]");
      return Array.isArray(parsed) ? Array.from(new Set(parsed)).filter(Boolean) : [];
    } catch (_) {
      return [];
    }
  }

  function saveUnlockedAchievements(ids) {
    localStorage.setItem(
      ACHIEVEMENTS_KEY,
      JSON.stringify(Array.from(new Set(ids)).filter(Boolean)),
    );
  }

  function getAchievementActivity(sourceState) {
    const activity = (sourceState && sourceState.achievementActivity) || {};
    return {
      completionsByDate: activity.completionsByDate || {},
      earlyBirdDates: Array.from(new Set(activity.earlyBirdDates || [])),
      nightOwlDates: Array.from(new Set(activity.nightOwlDates || [])),
    };
  }

  function isEarlyBirdDate(dateLike) {
    if (!dateLike) return false;
    const date = new Date(dateLike);
    return !Number.isNaN(date.getTime()) && date.getHours() < 9;
  }

  function isNightOwlDate(dateLike) {
    if (!dateLike) return false;
    const date = new Date(dateLike);
    return !Number.isNaN(date.getTime()) && date.getHours() >= 22;
  }

  // ==========================================
  // RESET
  // ==========================================
  function showResetModal() {
    const modal = document.getElementById("resetModal");
    if (modal) modal.classList.add("active");
  }

  function hideResetModal() {
    const modal = document.getElementById("resetModal");
    if (modal) modal.classList.remove("active");
  }

  function confirmReset() {
    // Only reset study state, streak, and schedule — keep summaries, settings, and achievements
    StorageManager.resetAll();
    // Clear study state fields specifically
    const defaultState = {
      startDate: `${toLocalDateString(new Date())}T00:00:00`,
      preCompletedLectures: [],
      completedLectures: [],
      completedTasks: [],
      lastStudyDate: null,
      achievementActivity: {
        completionsByDate: {},
        earlyBirdDates: [],
        nightOwlDates: [],
      },
    };
    localStorage.setItem("study_planner_state", JSON.stringify(defaultState));
    localStorage.setItem(
      "study_planner_streak",
      JSON.stringify({ current: 0, longest: 0, lastDate: null, history: [] }),
    );

    loadFromStorage();
    schedule = null;

    hideResetModal();
    render();
    showToast("Study plan reset. Your summaries are safe!");
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, duration = 3000) {
    const existing = document.querySelector(".toast-notification");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--accent-amber);
            border-radius: var(--radius-md);
            padding: 12px 20px;
            box-shadow: var(--shadow-lg);
            z-index: 2000; font-size: 0.9rem; font-weight: 600;
            animation: fadeIn 0.2s ease; max-width: 300px;
        `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================
  // HELPERS
  // ==========================================
  function getCourseIdForLectureId(lectureId) {
    const course = COURSES.find((c) =>
      (c.lectures || []).some((lecture) => lecture.id === lectureId),
    );
    return course ? course.id : null;
  }

  function setTopicCompletion(lectureId, checked, courseId = null) {
    setTopicCompletions([lectureId], checked, courseId);
  }

  function setTopicCompletions(lectureIds, checked, courseId = null) {
    const freshState = StorageManager.loadState();
    const completed = new Set(freshState.completedLectures || []);
    const newlyCompletedIds = [];

    lectureIds.forEach((lectureId) => {
      if (!lectureId) return;
      if (checked) {
        if (!completed.has(lectureId)) {
          newlyCompletedIds.push(lectureId);
        }
        completed.add(lectureId);
      } else {
        completed.delete(lectureId);
      }
    });

    freshState.completedLectures = Array.from(completed).filter(Boolean);
    freshState.completedTasks = freshState.completedLectures;
    freshState.preCompletedLectures = freshState.completedLectures.map((id) => ({
      id,
      courseId: courseId || getCourseIdForTaskId(id),
    }));
    freshState.lastStudyDate = checked ? new Date().toISOString() : freshState.lastStudyDate;
    recordAchievementActivity(freshState, newlyCompletedIds);
    StorageManager.saveState(freshState);
    state = freshState;
  }

  function recordAchievementActivity(targetState, newlyCompletedIds) {
    if (!newlyCompletedIds || newlyCompletedIds.length === 0) return;

    const now = new Date();
    const dateStr = toLocalDateString(now);
    const activity = getAchievementActivity(targetState);
    const completedToday = new Set(activity.completionsByDate[dateStr] || []);

    newlyCompletedIds.forEach((id) => completedToday.add(id));
    activity.completionsByDate[dateStr] = Array.from(completedToday);

    if (now.getHours() < 9 && !activity.earlyBirdDates.includes(dateStr)) {
      activity.earlyBirdDates.push(dateStr);
    }

    if (now.getHours() >= 22 && !activity.nightOwlDates.includes(dateStr)) {
      activity.nightOwlDates.push(dateStr);
    }

    targetState.achievementActivity = activity;
  }

  function getProgressTaskIds() {
    const ids = new Set();

    COURSES.forEach((course) => {
      (course.lectures || []).forEach((lecture) => ids.add(lecture.id));
    });

    if (schedule && Array.isArray(schedule.days)) {
      schedule.days.forEach((day) => {
        (day.studies || []).forEach((study) => {
          if (study.type !== "exam" && study.lectureId) {
            ids.add(study.lectureId);
          }
        });
      });
    }

    return Array.from(ids);
  }

  function getCourseIdForTaskId(taskId) {
    const directCourseId = getCourseIdForLectureId(taskId);
    if (directCourseId) return directCourseId;

    if (!schedule || !Array.isArray(schedule.days)) return null;
    for (const day of schedule.days) {
      const study = (day.studies || []).find((st) => st.lectureId === taskId);
      if (study) return study.courseId || null;
    }
    return null;
  }

  function getAllCompletedIds() {
    const currState = StorageManager.loadState();
    const completedLectures = currState.completedLectures || [];

    const ids = new Set();
    completedLectures.forEach((id) => ids.add(id));
    return Array.from(ids);
  }

  // Public API (used by HTML onsubmit and Components)
  return {
    init,
    generateSchedule,
    toggleCourseDetails,
    toggleLectureCompletion,
    addSummary,
    deleteSummary,
    showResetModal,
    hideResetModal,
    confirmReset,
  };
})();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => App.init());
