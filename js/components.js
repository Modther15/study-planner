/**
 * UI Components - Reusable component renderers
 */

const Components = (function () {

    /**
     * Render course card with checkbox for pre-completion
     */
    function renderCourseCard(course, isPreCompleted = false, showDetails = false) {
        const card = document.createElement('div');
        card.className = `course-card ${isPreCompleted ? 'course-completed' : ''}`;
        card.dataset.courseId = course.id;
        card.style.setProperty('--course-color', course.color);
        card.style.setProperty('--course-color-rgb', course.colorRgb);

        const lectureCheckboxes = course.lectures.map(lec => `
            <label class="lecture-check">
                <input type="checkbox"
                       data-lecture-id="${lec.id}"
                       data-course-id="${course.id}"
                       ${isPreCompleted ? 'checked' : ''}
                       onchange="App.onLectureToggle('${course.id}', '${lec.id}', this.checked)">
                <span class="lecture-title">${lec.title}</span>
                <span class="lecture-sub">${lec.subtitle}</span>
            </label>
        `).join('');

        card.innerHTML = `
            <div class="course-card-header" onclick="App.toggleCourseDetails('${course.id}')">
                <div class="course-icon" style="background: rgba(${course.colorRgb}, 0.15);">
                    ${course.icon}
                </div>
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
                            ${new Date(course.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${course.examDuration}
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
                ${course.lectures.length > 0 ? `
                    <div class="lectures-section">
                        <div class="lectures-header">
                            <span class="lectures-label">Select lectures you've already completed:</span>
                            <button class="select-all-btn" onclick="App.toggleAllLectures('${course.id}', event)">
                                Toggle All
                            </button>
                        </div>
                        <div class="lectures-list">
                            ${lectureCheckboxes}
                        </div>
                    </div>
                ` : `
                    <p class="no-lectures-msg">No specific lectures listed. Mark as completed to optimize your schedule.</p>
                `}
                <div class="course-topics">
                    <span class="topics-label">Key Topics:</span>
                    ${course.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
                </div>
                <div class="course-actions">
                    <a href="${course.driveMain}" target="_blank" class="resource-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Open Drive Folder
                    </a>
                    ${course.videoRef ? `
                        <a href="${course.videoRef}" target="_blank" class="resource-btn resource-btn-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                            Video Playlist
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Render progress bar
     */
    function renderProgressBar(percentage, color = 'var(--accent-blue)', height = '8px') {
        const bar = document.createElement('div');
        bar.className = 'progress-bar-container';
        bar.innerHTML = `
            <div class="progress-bar-track" style="height: ${height};">
                <div class="progress-bar-fill" style="width: ${Math.min(100, Math.max(0, percentage))}%; background: ${color};"></div>
            </div>
            <span class="progress-percentage">${Math.round(percentage)}%</span>
        `;
        return bar;
    }

    /**
     * Render stat card
     */
    function renderStatCard(value, label, color = 'var(--text-primary)', icon = null) {
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            ${icon ? `<div class="stat-icon">${icon}</div>` : ''}
            <div class="stat-value" style="color: ${color};">${value}</div>
            <div class="stat-label">${label}</div>
        `;
        return card;
    }

    /**
     * Render schedule day card
     */
    function renderDayCard(day, isToday = false) {
        const card = document.createElement('div');
        card.className = `day-card ${day.isExamDay ? 'exam-day-card' : ''} ${isToday ? 'today-card' : ''}`;
        card.dataset.date = day.dateStr;

        const studiesHtml = day.studies.map(st => {
            const course = COURSES.find(c => c.id === st.courseId);
            const isDone = App.isLectureCompleted(st.lectureId);
            return `
                <div class="study-item ${isDone ? 'study-done' : ''}" data-lecture-id="${st.lectureId}">
                    <label class="study-check-label">
                        <input type="checkbox"
                               ${isDone ? 'checked' : ''}
                               onchange="App.toggleLectureCompletion('${st.lectureId}', this.checked)">
                        <span class="study-info">
                            <span class="study-course-tag" style="background: rgba(${course.colorRgb}, 0.15); color: ${course.color};">
                                ${course.icon} ${st.courseName}
                            </span>
                            <span class="study-lecture">${st.lectureTitle}</span>
                            <span class="study-hours">${st.hours}h</span>
                            ${st.lectureLink ? `
                                <a href="${st.lectureLink}" target="_blank" class="study-link" onclick="event.stopPropagation()">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </a>
                            ` : ''}
                        </span>
                    </label>
                </div>
            `;
        }).join('');

        const examsHtml = day.examsOnDay.map(e => {
            const c = COURSES.find(c => c.id === e.id);
            return `
                <div class="exam-badge" style="background: rgba(${c.colorRgb}, 0.15); border-left: 3px solid ${c.color};">
                    ${c.icon} ${e.name} - EXAM TODAY
                </div>
            `;
        }).join('');

        card.innerHTML = `
            <div class="day-header">
                <div class="day-date-block">
                    <span class="day-weekday">${day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span class="day-num">${day.date.getDate()}</span>
                    <span class="day-month">${day.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div class="day-info">
                    ${day.totalHours > 0 ? `<span class="day-hours">${day.totalHours}h study</span>` : '<span class="day-rest">Rest day</span>'}
                    ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
                </div>
            </div>
            ${day.isExamDay ? `<div class="exam-notice">${examsHtml}</div>` : ''}
            ${studiesHtml ? `<div class="study-list">${studiesHtml}</div>` : ''}
            ${!day.isExamDay && day.totalHours === 0 ? '<p class="no-studies-msg">No more lectures! Consider revision or practice.</p>' : ''}
        `;

        return card;
    }

    /**
     * Render motivational message
     */
    function getMotivationalMessage(percentage) {
        const milestones = [0, 10, 25, 40, 50, 60, 75, 90, 95, 100];
        let closest = 0;
        for (const m of milestones) {
            if (m <= percentage) closest = m;
        }
        const msgs = MOTIVATIONAL_MESSAGES[closest];
        if (!msgs) return MOTIVATIONAL_MESSAGES[0][0];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    /**
     * Render streak card
     */
    function renderStreakCard(streak) {
        const card = document.createElement('div');
        card.className = 'streak-card';
        card.innerHTML = `
            <div class="streak-icon">🔥</div>
            <div class="streak-info">
                <div class="streak-count">${streak.current}</div>
                <div class="streak-label">Day Streak</div>
            </div>
            <div class="streak-best">
                <span class="best-label">Best:</span>
                <span class="best-value">${streak.longest}</span>
            </div>
        `;
        return card;
    }

    /**
     * Render achievement badge
     */
    function renderAchievementBadge(achievement, unlocked = false) {
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${unlocked ? 'unlocked' : 'locked'}`;
        badge.title = achievement.description;
        badge.innerHTML = `
            <div class="badge-icon">${unlocked ? achievement.icon : '🔒'}</div>
            <div class="badge-label">${achievement.label}</div>
        `;
        return badge;
    }

    /**
     * Render resource link card
     */
    function renderResourceCard(course) {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.style.setProperty('--course-color', course.color);
        card.style.setProperty('--course-color-rgb', course.colorRgb);

        const resourcesHtml = course.resources.map(r => `
            <a href="${r.link}" target="_blank" class="resource-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                ${r.label}
            </a>
        `).join('');

        card.innerHTML = `
            <div class="resource-card-header">
                <div class="resource-icon" style="background: rgba(${course.colorRgb}, 0.15);">
                    ${course.icon}
                </div>
                <h3>${course.name}</h3>
            </div>
            <div class="resource-links">
                ${resourcesHtml}
            </div>
        `;

        return card;
    }

    /**
     * Render student summary card
     */
    function renderSummaryCard(summary, index) {
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <div class="summary-card-header">
                <div class="summary-avatar">${summary.studentName.charAt(0).toUpperCase()}</div>
                <div class="summary-info">
                    <h4 class="summary-student">${summary.studentName}</h4>
                    <span class="summary-subject">${summary.subject}</span>
                </div>
            </div>
            ${summary.description ? `<p class="summary-description">${summary.description}</p>` : ''}
            <div class="summary-actions">
                <a href="${summary.link}" target="_blank" class="summary-link-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View Summary
                </a>
                <button class="summary-delete-btn" onclick="App.deleteSummary(${index})" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        return card;
    }

    /**
     * Render course progress card
     */
    function renderCourseProgressCard(course, completedCount, totalCount) {
        const card = document.createElement('div');
        card.className = 'course-progress-card';
        card.style.setProperty('--course-color', course.color);
        card.style.setProperty('--course-color-rgb', course.colorRgb);

        const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        card.innerHTML = `
            <div class="cp-header">
                <div class="cp-icon">${course.icon}</div>
                <div class="cp-info">
                    <h4>${course.shortName}</h4>
                    <span class="cp-count">${completedCount}/${totalCount} lectures</span>
                </div>
                <span class="cp-pct" style="color: ${course.color};">${percentage}%</span>
            </div>
            <div class="progress-bar-track" style="height: 6px; margin-top: 10px;">
                <div class="progress-bar-fill" style="width: ${percentage}%; background: ${course.color};"></div>
            </div>
            <div class="cp-exam">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${new Date(course.examDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • ${course.examDuration}
            </div>
        `;
        return card;
    }

    /**
     * Render suggestion card
     */
    function renderSuggestionCard(suggestion) {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.style.setProperty('--course-color', suggestion.courseIcon || 'var(--accent-blue)');

        const activitiesHtml = suggestion.activities.map(act => `
            <a href="${act.link || '#'}" target="_blank" class="suggestion-activity ${!act.link ? 'no-link' : ''}"
               onclick="${!act.link ? 'event.preventDefault(); alert(\"No link available for this resource.\");' : ''}">
                <span class="suggestion-icon">${act.icon}</span>
                <span class="suggestion-label">${act.label}</span>
                ${act.link ? `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="suggestion-link-icon">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                ` : ''}
            </a>
        `).join('');

        card.innerHTML = `
            <div class="suggestion-header">
                <span class="suggestion-course">${suggestion.courseIcon} ${suggestion.courseName}</span>
                <span class="suggestion-badge">All Lectures Complete</span>
            </div>
            <p class="suggestion-msg">Great job! Since you've completed all lectures, here are productive activities:</p>
            <div class="suggestion-activities">
                ${activitiesHtml}
            </div>
        `;
        return card;
    }

    return {
        renderCourseCard,
        renderProgressBar,
        renderStatCard,
        renderDayCard,
        renderStreakCard,
        renderAchievementBadge,
        renderResourceCard,
        renderSummaryCard,
        renderCourseProgressCard,
        renderSuggestionCard,
        getMotivationalMessage,
    };
})();