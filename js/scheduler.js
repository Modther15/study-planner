/**
 * Dynamic Study Scheduler — Exam-Deadline-Aware Version
 *
 * ============================================================================
 * CORE PRINCIPLE: EXAM DATES ARE FIXED. STUDY ITEMS ARE NEVER SCHEDULED AFTER
 * THEIR SUBJECT'S EXAM DATE.
 * ============================================================================
 *
 * Exam calendar (immutable):
 *   Database:       May 23, 2026
 *   Marketing:      May 25, 2026
 *   Statistics:     June 1, 2026
 *   Cryptography:   June 3, 2026
 *   Networks:       June 4, 2026
 *   Data Struct.:   June 7, 2026
 *   Crypto Final:   June 13, 2026
 *
 * Algorithm:
 *   1. Group study items by (subject, examDate).
 *   2. For each subject, work BACKWARD from its exam date.
 *   3. Assign study days running from the exam date back to effectiveStart
 *      (max of userStartDate and today).
 *   4. When starting late (fewer days than items): compress by putting more
 *      items per day, up to max 2 subjects per day.
 *   5. Last 3 days before any exam: ONLY that subject appears.
 *   6. When compressing, prioritize: learning items first, then revision,
 *      recall, and practice — keeping harder items near the start of the
 *      study window and lighter review items at the end.
 *   7. Phase boundaries are set by exam dates, not by the old hardcoded
 *      phaseStartDate values.
 */

const Scheduler = (function () {
  // ==========================================
  // FIXED EXAM CALENDAR — NEVER CHANGES
  // ==========================================
  const EXAM_CALENDAR = [
    {
      date: "2026-05-23",
      courseId: "database",
      courseName: "Database",
      phaseIndex: 1,
      phaseLabel: "Database + Marketing",
    },
    {
      date: "2026-05-25",
      courseId: "marketing",
      courseName: "Marketing",
      phaseIndex: 1,
      phaseLabel: "Database + Marketing",
    },
    {
      date: "2026-06-01",
      courseId: "statistics",
      courseName: "Statistics",
      phaseIndex: 2,
      phaseLabel: "Statistics + Crypto + Networks",
    },
    {
      date: "2026-06-03",
      courseId: "cryptography",
      courseName: "Crypto",
      phaseIndex: 2,
      phaseLabel: "Statistics + Crypto + Networks",
    },
    {
      date: "2026-06-04",
      courseId: "networks",
      courseName: "Networks",
      phaseIndex: 2,
      phaseLabel: "Statistics + Crypto + Networks",
    },
    {
      date: "2026-06-07",
      courseId: "datastructure",
      courseName: "Data Structures",
      phaseIndex: 3,
      phaseLabel: "Data Structures",
    },
    {
      date: "2026-06-13",
      courseId: "cryptography_final",
      courseName: "Cryptography",
      phaseIndex: 4,
      phaseLabel: "Cryptography Final",
    },
  ];

  const COURSE_PLAN_START_DATES = {
    database: "2026-05-16",
    marketing: "2026-05-16",
    statistics: "2026-05-26",
    cryptography: "2026-05-26",
    networks: "2026-05-26",
    datastructure: "2026-06-05",
    cryptography_final: "2026-06-08",
  };

  const EMERGENCY_FOCUS_DAYS = 3;

  // ==========================================
  // UTILITIES
  // ==========================================

  function parseDate(dateLike) {
    if (dateLike instanceof Date) {
      return new Date(
        dateLike.getFullYear(),
        dateLike.getMonth(),
        dateLike.getDate(),
      );
    }

    const datePart = String(dateLike).split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function daysBetween(d1, d2) {
    const a = parseDate(d1);
    a.setHours(0, 0, 0, 0);
    const b = parseDate(d2);
    b.setHours(0, 0, 0, 0);
    return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
  }

  function addDays(date, n) {
    const d = parseDate(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function dateToStr(d) {
    const date = parseDate(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateStr) {
    return parseDate(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function dateEquals(a, b) {
    return dateToStr(a) === dateToStr(b);
  }

  function getCourseColor(courseId) {
    if (courseId === "cryptography_final") return "20, 184, 166";
    return (
      (COURSES.find((c) => c.id === courseId) || {}).colorRgb || "59,130,246"
    );
  }

  function getCourseIcon(courseId) {
    if (courseId === "cryptography_final") return "🔐";
    return (COURSES.find((c) => c.id === courseId) || {}).icon || "📚";
  }

  /**
   * Build a lookup map: course lecture ID → study item lectureId
   * so marking COURSES lectures as pre-completed also hides them from the schedule.
   *
   * Mapping strategy (based on data.js naming conventions):
   *   - DB:    "db-N"     → "db-N" (same ID)
   *   - Crypto: "cry-N"   → "cry-N" (same ID)
   *   - DS:    "ds-N"    → "ds-N" (same ID)
   *   - Networks: "net-N" → "net-N" (same ID)
   *   - Generic IDs in study items map to specific COURSES lectures where possible.
   */
  const COURSE_LECTURE_TO_STUDY_ID_MAP = (function () {
    const map = {};

    // Database: lectures are db-1 through db-11
    const db = COURSES.find((c) => c.id === "database");
    if (db) {
      db.lectures.forEach((lec) => {
        map[lec.id] = lec.id;
      });
    }

    // Crypto: lectures are cry-1 through cry-8
    const cry = COURSES.find((c) => c.id === "cryptography");
    if (cry) {
      cry.lectures.forEach((lec) => {
        map[lec.id] = lec.id;
      });
    }

    // Data Structures: lectures are ds-1 through ds-17, but some have suffixes like ds-6a, ds-6b
    const ds = COURSES.find((c) => c.id === "datastructure");
    if (ds) {
      ds.lectures.forEach((lec) => {
        map[lec.id] = lec.id;
      });
    }

    // Networks: lectures are net-1 through net-5
    const net = COURSES.find((c) => c.id === "networks");
    if (net) {
      net.lectures.forEach((lec) => {
        map[lec.id] = lec.id;
      });
    }

    return map;
  })();

  // ==========================================
  // BUILD STUDY ITEMS FROM COURSES
  // ==========================================

  /**
   * Courses are the source of truth for schedulable work: one study item per
   * course lecture/topic, using the same ID and title everywhere.
   */
  function buildStudyItems() {
    const items = [];

    // Real lecture lists → one item per lecture
    let sequence = 0;

    COURSES.forEach((course) => {
      const examDate = dateToStr(new Date(course.examDate));

      if (course.lectures && course.lectures.length > 0) {
        course.lectures.forEach((lec) => {
          items.push({
            lectureId: lec.id,
            courseId: course.id,
            courseName: course.shortName,
            lectureTitle: lec.title,
            lectureLink: lec.link || null,
            hours: lec.hours || 1.5,
            type: "learning",
            examDate,
            sequence: sequence++,
          });
        });
      } else if (course.topics && course.topics.length > 0) {
        course.topics.forEach((topic, idx) => {
          items.push({
            lectureId: `${course.id}-topic-${idx + 1}`,
            courseId: course.id,
            courseName: course.shortName,
            lectureTitle: topic,
            lectureLink: null,
            hours: 1.5,
            type: "learning",
            examDate,
            sequence: sequence++,
          });
        });
      }

      [
        {
          suffix: "previous-exams",
          title: "Previous Exams / Practice Questions",
          hours: 2,
          type: "practice",
        },
        {
          suffix: "active-recall",
          title: "Active Recall + Weak Points",
          hours: 1.5,
          type: "recall",
        },
        {
          suffix: "final-revision",
          title: "Final Revision",
          hours: 2,
          type: "revision",
        },
      ].forEach((review) => {
        items.push({
          lectureId: `${course.id}-${review.suffix}`,
          courseId: course.id,
          courseName: course.shortName,
          lectureTitle: review.title,
          lectureLink: null,
          hours: review.hours,
          type: review.type,
          examDate,
          sequence: sequence++,
          isAutoReview: true,
        });
      });
    });

    const realCourseIds = new Set(COURSES.map((course) => course.id));
    CUSTOM_PHASES.forEach((phase) => {
      phase.studyItems.forEach((item) => {
        if (item.type === "exam") return; // skip exam placeholders
        if (!realCourseIds.has(item.courseId)) {
          items.push({
            lectureId: item.lectureId,
            courseId: item.courseId,
            courseName: item.courseName,
            lectureTitle: item.lectureTitle,
            lectureLink: null,
            hours: item.hours,
            type: item.type,
            examDate: phase.examDate,
            sequence: sequence++,
          });
        }
      });
    });

    return items;
  }

  /**
   * Given a pre-completed lecture ID from COURSES, return the matching
   * study item lectureId so it can be filtered out of the schedule.
   * Returns the input ID if no mapping found.
   */
  function mapCourseLectureToStudyId(lectureId) {
    return COURSE_LECTURE_TO_STUDY_ID_MAP[lectureId] || lectureId;
  }

  // ==========================================
  // ADAPTIVE SCHEDULE GENERATOR
  // ==========================================

  function generateSchedule(
    userStartDate,
    preCompleted = [],
    dailyGoalHours = 4,
  ) {
    const userStart = parseDate(userStartDate);
    userStart.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const effectiveStart = userStart > today ? userStart : today;

    // Completed set: include pre-completed lectures (mapped) + live schedule toggles
    const completedIds = new Set();
    preCompleted.forEach((l) => {
      const rawId = l.id || l;
      const mappedId = mapCourseLectureToStudyId(rawId);
      completedIds.add(mappedId);
      completedIds.add(rawId); // also keep the raw ID in case schedule uses it directly
    });
    try {
      const state = JSON.parse(
        localStorage.getItem("study_planner_state") || "{}",
      );
      (state.completedLectures || [])
        .concat((state.preCompletedLectures || []).map((l) => l.id || l))
        .forEach((id) => {
          completedIds.add(mapCourseLectureToStudyId(id));
          completedIds.add(id);
        });
    } catch (_) {}

    const goalHours = Math.max(1, Number(dailyGoalHours) || 4);
    const effectiveStartStr = dateToStr(effectiveStart);

    const sortedExams = [...EXAM_CALENDAR]
      .map((exam) => ({
        ...exam,
        dateObj: parseDate(exam.date),
      }))
      .sort((a, b) => a.dateObj - b.dateObj);

    const remainingExams = sortedExams.filter(
      (exam) => exam.dateObj >= effectiveStart,
    );

    const allItems = buildStudyItems();

    if (remainingExams.length === 0) {
      const emptyStats = calculateStats([], completedIds, {
        allItems,
        remainingExams,
        effectiveStartStr,
      });
      return {
        days: [],
        phases: [],
        courseData: [],
        suggestions: [],
        stats: emptyStats,
        meta: {
          startDate: dateToStr(userStart),
          effectiveStart: effectiveStartStr,
          dailyGoalHours: goalHours,
          generatedAt: new Date().toISOString(),
        },
      };
    }

    const scheduleDays = buildCalendarDays(effectiveStart, remainingExams);
    const examByCourse = {};
    remainingExams.forEach((exam) => {
      examByCourse[exam.courseId] = exam;
    });

    const sourcePlanItems = buildSourcePlanItems(remainingExams, completedIds);
    fillCalendarFromSourcePlan(
      scheduleDays,
      sourcePlanItems,
      examByCourse,
      effectiveStartStr,
      goalHours,
    );

    const validatedDays = validateAndCleanSchedule(scheduleDays);
    const phases = groupIntoPhases(validatedDays);
    const stats = calculateStats(validatedDays, completedIds, {
      allItems,
      remainingExams,
      effectiveStartStr,
    });

    return {
      days: validatedDays,
      phases,
      courseData: [],
      suggestions: [],
      stats,
      meta: {
        startDate: dateToStr(userStart),
        effectiveStart: effectiveStartStr,
        dailyGoalHours: goalHours,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  function buildSourcePlanItems(remainingExams, completedIds) {
    let sequence = 0;
    const items = [];
    const allItems = buildStudyItems();

    remainingExams.forEach((exam) => {
      const courseItems = allItems
        .filter(
          (item) =>
            item.courseId === exam.courseId &&
            !completedIds.has(item.lectureId),
        )
        .sort((a, b) => a.sequence - b.sequence);
      const planStartDate = getCoursePlanStartDate(exam.courseId, exam.date);

      courseItems.forEach((item, index) => {
        const plannedDate = getDistributedPlanDate(
          planStartDate,
          exam.date,
          index,
          courseItems.length,
        );
        if (plannedDate >= exam.date) return;

        items.push({
          ...item,
          plannedDate,
          examDate: exam.date,
          sequence: sequence++,
          isSourcePlanItem: true,
        });
      });
    });

    return items.sort((a, b) => {
      if (a.plannedDate !== b.plannedDate) {
        return parseDate(a.plannedDate) - parseDate(b.plannedDate);
      }
      return a.sequence - b.sequence;
    });
  }

  function getCoursePlanStartDate(courseId, examDate) {
    if (COURSE_PLAN_START_DATES[courseId]) return COURSE_PLAN_START_DATES[courseId];
    const course = COURSES.find((c) => c.id === courseId);
    const lectureCount = Math.max(1, (course && course.lectures ? course.lectures.length : 1));
    return dateToStr(addDays(examDate, -lectureCount));
  }

  function getDistributedPlanDate(startDate, examDate, index, totalItems) {
    const daysAvailable = Math.max(1, daysBetween(startDate, examDate));
    const dayOffset =
      totalItems <= 1
        ? Math.max(0, daysAvailable - 1)
        : Math.floor((index * (daysAvailable - 1)) / (totalItems - 1));
    return dateToStr(addDays(startDate, dayOffset));
  }

  function fillCalendarFromSourcePlan(
    days,
    sourceItems,
    examByCourse,
    effectiveStartStr,
    dailyGoalHours,
  ) {
    const queues = {};
    Object.keys(examByCourse).forEach((courseId) => {
      queues[courseId] = sourceItems
        .filter((item) => item.courseId === courseId)
        .sort((a, b) => {
          if (a.plannedDate !== b.plannedDate) {
            return parseDate(a.plannedDate) - parseDate(b.plannedDate);
          }
          return a.sequence - b.sequence;
        });
    });

    for (const day of days) {
      const date = parseDate(day.dateStr);
      const examCourseIds = new Set((day.examsOnDay || []).map((exam) => exam.id));

      if (day.isExamDay) {
        addSourcePlanExamDayStudies(
          day,
          queues,
          examByCourse,
          examCourseIds,
          days,
        );
        continue;
      }

      const focusCourseId = getFinalFocusCourse(day.dateStr, queues, examByCourse);
      const allowedSubjects = focusCourseId
        ? [focusCourseId]
        : Object.keys(queues).filter((courseId) => {
            const exam = examByCourse[courseId];
            return exam && date < exam.dateObj && queues[courseId].length > 0;
          });

      if (allowedSubjects.length === 0) continue;

      const selectedSubjects = choosePlanSubjectsForDay(
        day.dateStr,
        allowedSubjects,
        queues,
        examByCourse,
        days,
        effectiveStartStr,
        focusCourseId,
      );

      const studies = [];
      selectedSubjects.forEach((courseId) => {
        const targetCount = getPlanTargetCountForDay(
          courseId,
          day.dateStr,
          queues,
          examByCourse,
          days,
          effectiveStartStr,
        );

        let added = 0;
        while (
          queues[courseId] &&
          queues[courseId].length > 0 &&
          added < targetCount &&
          parseDate(day.dateStr) < examByCourse[courseId].dateObj
        ) {
          const next = queues[courseId][0];
          const isDue = next.plannedDate <= day.dateStr;
          const isCompressionNeeded = hasOverduePlanItems(
            courseId,
            day.dateStr,
            queues,
          );

          if (!isDue && !isCompressionNeeded) break;

          studies.push(createStudyFromItem(queues[courseId].shift()));
          added++;
        }
      });

      day.studies = studies;
      day.totalHours = studies.reduce((sum, study) => sum + study.hours, 0);
      day.strategy = focusCourseId
        ? "source_plan_final_focus"
        : studies.length > 0
          ? "source_plan"
          : "light_day";

      const nextExam = Object.values(examByCourse)
        .filter((exam) => exam.dateObj > date)
        .sort((a, b) => a.dateObj - b.dateObj)[0];
      if (nextExam) {
        day.daysBeforeExam = daysBetween(date, nextExam.dateObj);
      }
    }

    flushSourcePlanBacklog(days, queues, examByCourse, dailyGoalHours);
  }

  function addSourcePlanExamDayStudies(
    day,
    queues,
    examByCourse,
    examCourseIds,
    days,
  ) {
    const date = parseDate(day.dateStr);
    const focusCourseId = getFinalFocusCourse(day.dateStr, queues, examByCourse);
    const eligibleSubjects = Object.keys(queues).filter((courseId) => {
      if (examCourseIds.has(courseId)) return false;
      const exam = examByCourse[courseId];
      return (
        exam &&
        queues[courseId] &&
        queues[courseId].length > 0 &&
        date < exam.dateObj
      );
    });

    const selectedSubjects = (
      focusCourseId && eligibleSubjects.includes(focusCourseId)
        ? [focusCourseId]
        : eligibleSubjects.sort((a, b) => {
            const pa = getPlanPressureIncludingExamDays(
              a,
              day.dateStr,
              queues,
              examByCourse,
              days,
            );
            const pb = getPlanPressureIncludingExamDays(
              b,
              day.dateStr,
              queues,
              examByCourse,
              days,
            );
            if (pb !== pa) return pb - pa;
            return examByCourse[a].dateObj - examByCourse[b].dateObj;
          }).slice(0, 1)
    );

    selectedSubjects.forEach((courseId) => {
      const targetCount = getPostExamTargetCountForDay(
        courseId,
        day.dateStr,
        queues,
        examByCourse,
        days,
      );
      let added = 0;
      while (
        queues[courseId] &&
        queues[courseId].length > 0 &&
        added < targetCount
      ) {
        day.studies.push(createStudyFromItem(queues[courseId].shift()));
        added++;
      }
    });

    day.totalHours =
      2 * (day.examsOnDay || []).length +
      day.studies.reduce((sum, study) => sum + study.hours, 0);
  }

  function getFinalFocusCourse(dateStr, queues, examByCourse) {
    const date = parseDate(dateStr);
    return Object.keys(examByCourse)
      .filter((courseId) => {
        const exam = examByCourse[courseId];
        return (
          exam &&
          date < exam.dateObj &&
          daysBetween(date, exam.dateObj) <= EMERGENCY_FOCUS_DAYS
        );
      })
      .sort((a, b) => examByCourse[a].dateObj - examByCourse[b].dateObj)[0];
  }

  function choosePlanSubjectsForDay(
    dateStr,
    allowedSubjects,
    queues,
    examByCourse,
    days,
    effectiveStartStr,
    focusCourseId,
  ) {
    if (focusCourseId) return [focusCourseId];

    const plannedToday = allowedSubjects.filter((courseId) =>
      queues[courseId].some((item) => item.plannedDate === dateStr),
    );
    const overdue = allowedSubjects.filter((courseId) =>
      hasOverduePlanItems(courseId, dateStr, queues),
    );
    const pressure = allowedSubjects
      .filter((courseId) => queues[courseId].length > 0)
      .sort((a, b) => {
        const pa = getPlanPressure(a, dateStr, queues, examByCourse, days);
        const pb = getPlanPressure(b, dateStr, queues, examByCourse, days);
        if (pb !== pa) return pb - pa;
        return examByCourse[a].dateObj - examByCourse[b].dateObj;
      });

    const selected = [];
    [...plannedToday, ...overdue, ...pressure].forEach((courseId) => {
      if (selected.length >= 2) return;
      if (!selected.includes(courseId)) selected.push(courseId);
    });

    return selected.filter((courseId) => {
      const first = queues[courseId] && queues[courseId][0];
      return (
        first &&
        (first.plannedDate <= dateStr ||
          hasOverduePlanItems(courseId, dateStr, queues) ||
          effectiveStartStr > first.plannedDate)
      );
    });
  }

  function getPlanTargetCountForDay(
    courseId,
    dateStr,
    queues,
    examByCourse,
    days,
    effectiveStartStr,
  ) {
    const overdueCount = queues[courseId].filter((item) => item.plannedDate < dateStr).length;
    const hasLateStartBacklog = queues[courseId].some(
      (item) => item.plannedDate < effectiveStartStr,
    );
    const dueCount = queues[courseId].filter((item) => item.plannedDate <= dateStr).length;

    if (!hasLateStartBacklog && overdueCount === 0) {
      return Math.max(1, dueCount);
    }

    const eligibleDaysLeft = Math.max(
      1,
      countStudyDaysForCourse(dateStr, examByCourse[courseId], days),
    );
    const compressedCount = Math.ceil(queues[courseId].length / eligibleDaysLeft);
    return Math.max(1, compressedCount);
  }

  function hasOverduePlanItems(courseId, dateStr, queues) {
    return queues[courseId].some((item) => item.plannedDate < dateStr);
  }

  function getPlanPressure(courseId, dateStr, queues, examByCourse, days) {
    const eligibleDaysLeft = Math.max(
      1,
      countStudyDaysForCourse(dateStr, examByCourse[courseId], days),
    );
    return queues[courseId].length / eligibleDaysLeft;
  }

  function getPlanPressureIncludingExamDays(courseId, dateStr, queues, examByCourse, days) {
    const eligibleDaysLeft = Math.max(
      1,
      countAssignableDaysForCourse(dateStr, examByCourse[courseId], days),
    );
    return queues[courseId].length / eligibleDaysLeft;
  }

  function getPostExamTargetCountForDay(courseId, dateStr, queues, examByCourse, days) {
    const eligibleDaysLeft = Math.max(
      1,
      countAssignableDaysForCourse(dateStr, examByCourse[courseId], days),
    );
    return Math.max(1, Math.ceil(queues[courseId].length / eligibleDaysLeft));
  }

  function flushSourcePlanBacklog(days, queues, examByCourse) {
    Object.keys(queues).forEach((courseId) => {
      while (queues[courseId] && queues[courseId].length > 0) {
        const exam = examByCourse[courseId];
        const targetDay = [...days]
          .reverse()
          .find((day) => {
            if (day.isExamDay) return false;
            if (parseDate(day.dateStr) >= exam.dateObj) return false;

            const focusCourseId = getFinalFocusCourse(
              day.dateStr,
              queues,
              examByCourse,
            );
            if (focusCourseId && focusCourseId !== courseId) return false;

            const subjects = new Set(day.studies.map((study) => study.courseId));
            return (
              subjects.has(courseId) ||
              subjects.size < 2 ||
              day.studies.length === 0
            );
          });

        if (!targetDay) break;

        targetDay.studies.push(createStudyFromItem(queues[courseId].shift()));
        targetDay.totalHours = targetDay.studies.reduce(
          (sum, study) => sum + study.hours,
          0,
        );
        targetDay.strategy = "source_plan_deadline_compression";
      }
    });
  }

  function buildCalendarDays(effectiveStart, remainingExams) {
    const lastExamDate = remainingExams[remainingExams.length - 1].dateObj;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (
      let date = parseDate(effectiveStart);
      date <= lastExamDate;
      date = addDays(date, 1)
    ) {
      const dateStr = dateToStr(date);
      const examsOnDate = remainingExams.filter((exam) => exam.date === dateStr);
      const firstExam = examsOnDate[0] || null;
      const phaseIndex = firstExam
        ? firstExam.phaseIndex
        : getPhaseForDate(dateStr, remainingExams);

      days.push({
        date: parseDate(date),
        dateStr,
        dayIndex: days.length,
        studies: [],
        totalHours: examsOnDate.length > 0 ? 2 * examsOnDate.length : 0,
        examsOnDay: examsOnDate.map((exam) => ({
          id: exam.courseId,
          name: exam.courseName,
          shortName: exam.courseName,
          colorRgb: getCourseColor(exam.courseId),
          icon: getCourseIcon(exam.courseId),
          examDate: exam.date,
        })),
        isExamDay: examsOnDate.length > 0,
        isToday: dateEquals(date, today),
        phase: firstExam ? firstExam.phaseLabel : getPhaseLabel(phaseIndex),
        strategy: examsOnDate.length > 0 ? "exam_day" : "balanced",
        phaseIndex,
        examName: firstExam ? firstExam.courseName : null,
        examId: firstExam ? `${firstExam.courseId}-exam` : null,
        examCourseId: firstExam ? firstExam.courseId : null,
        daysBeforeExam: firstExam ? 0 : null,
        isPostExam: false,
      });
    }

    return days;
  }

  function getPhaseForDate(dateStr, remainingExams) {
    const nextExam = remainingExams.find((exam) => exam.date >= dateStr);
    return nextExam ? nextExam.phaseIndex : remainingExams[remainingExams.length - 1].phaseIndex;
  }

  function getPhaseLabel(phaseIndex) {
    const labels = {
      1: "Database + Marketing",
      2: "Statistics + Crypto + Networks",
      3: "Data Structures",
      4: "Cryptography Final",
    };
    return labels[phaseIndex] || `Phase ${phaseIndex}`;
  }

  function buildSubjectQueues(allItems, remainingExams, completedIds) {
    const remainingCourseIds = new Set(remainingExams.map((exam) => exam.courseId));
    const typeOrder = { learning: 0, practice: 1, revision: 2, recall: 3 };
    const queues = {};

    remainingCourseIds.forEach((courseId) => {
      queues[courseId] = [];
    });

    allItems
      .filter(
        (item) =>
          remainingCourseIds.has(item.courseId) &&
          !completedIds.has(item.lectureId),
      )
      .sort((a, b) => {
        if (a.courseId !== b.courseId) return a.courseId.localeCompare(b.courseId);
        const typeDiff = (typeOrder[a.type] ?? 2) - (typeOrder[b.type] ?? 2);
        if (typeDiff !== 0 && a.type !== "learning" && b.type !== "learning") {
          return typeDiff;
        }
        return (a.sequence || 0) - (b.sequence || 0);
      })
      .forEach((item) => {
        queues[item.courseId].push(item);
      });

    return queues;
  }

  function fillCalendarWithStudy(days, queues, examByCourse, dailyGoalHours) {
    const dayByDate = {};
    days.forEach((day) => {
      dayByDate[day.dateStr] = day;
    });

    for (const day of days) {
      if (day.isExamDay) continue;

      const date = parseDate(day.dateStr);
      const urgentCourseIds = Object.keys(queues).filter((courseId) => {
        const exam = examByCourse[courseId];
        return (
          exam &&
          queues[courseId].length > 0 &&
          date < exam.dateObj &&
          daysBetween(date, exam.dateObj) <= 2
        );
      });

      const selected = [];
      let targetHours = Math.max(
        dailyGoalHours,
        getTotalActivePressure(day.dateStr, queues, examByCourse, days),
      );

      if (urgentCourseIds.length > 0) {
        urgentCourseIds
          .sort((a, b) => examByCourse[a].dateObj - examByCourse[b].dateObj)
          .slice(0, 1)
          .forEach((courseId) => selected.push(courseId));
        const urgentDaysLeft = Math.max(
          1,
          countStudyDaysForCourse(day.dateStr, examByCourse[selected[0]], days),
        );
        targetHours = Math.max(
          dailyGoalHours,
          remainingQueueHours(queues[selected[0]]) / urgentDaysLeft,
        );
        day.strategy = "pre_exam_intensive";
      } else {
        getRankedCoursePressures(day.dateStr, queues, examByCourse, days)
          .slice(0, 2)
          .forEach((entry) => selected.push(entry.courseId));
        day.strategy = selected.length > 1 ? "balanced_rotation" : "focused";
      }

      if (selected.length === 0) continue;

      const studies = [];
      let totalHours = 0;

      while (totalHours < targetHours && selected.some((id) => queues[id].length > 0)) {
        const nextCourse = selected
          .filter((id) => queues[id].length > 0)
          .sort((a, b) => {
            const pa = getCoursePressure(a, day.dateStr, queues, examByCourse, days);
            const pb = getCoursePressure(b, day.dateStr, queues, examByCourse, days);
            if (pb.pressure !== pa.pressure) return pb.pressure - pa.pressure;
            return examByCourse[a].dateObj - examByCourse[b].dateObj;
          })[0];

        const item = queues[nextCourse].shift();
        studies.push(createStudyFromItem(item));
        totalHours += item.hours;
      }

      day.studies = studies;
      day.totalHours = studies.reduce((s, st) => s + st.hours, 0);

      const nextExam = Object.values(examByCourse)
        .filter((exam) => exam.dateObj > date)
        .sort((a, b) => a.dateObj - b.dateObj)[0];
      if (nextExam) {
        day.daysBeforeExam = daysBetween(date, nextExam.dateObj);
      }
    }

    flushUnscheduledBeforeExams(days, queues, examByCourse, dailyGoalHours);
  }

  function getRankedCoursePressures(dateStr, queues, examByCourse, days) {
    return Object.keys(queues)
      .map((courseId) => getCoursePressure(courseId, dateStr, queues, examByCourse, days))
      .filter((entry) => entry.remainingHours > 0 && entry.daysLeft > 0)
      .sort((a, b) => {
        if (b.pressure !== a.pressure) return b.pressure - a.pressure;
        return examByCourse[a.courseId].dateObj - examByCourse[b.courseId].dateObj;
      });
  }

  function getTotalActivePressure(dateStr, queues, examByCourse, days) {
    const date = parseDate(dateStr);
    const remainingHours = Object.keys(queues).reduce((sum, courseId) => {
      const exam = examByCourse[courseId];
      if (!exam || exam.dateObj <= date) return sum;
      return sum + remainingQueueHours(queues[courseId]);
    }, 0);
    const remainingStudyDays = days.filter(
      (day) => !day.isExamDay && day.dateStr >= dateStr,
    ).length;
    return remainingStudyDays > 0 ? remainingHours / remainingStudyDays : 0;
  }

  function getCoursePressure(courseId, dateStr, queues, examByCourse, days) {
    const exam = examByCourse[courseId];
    const remainingHours = remainingQueueHours(queues[courseId]);
    const daysLeft = countStudyDaysForCourse(dateStr, exam, days);
    const pressure = daysLeft > 0 ? remainingHours / daysLeft : Number.POSITIVE_INFINITY;
    return { courseId, remainingHours, daysLeft, pressure };
  }

  function countStudyDaysForCourse(dateStr, exam, days) {
    return days.filter(
      (day) =>
        !day.isExamDay &&
        day.dateStr >= dateStr &&
        parseDate(day.dateStr) < exam.dateObj,
    ).length;
  }

  function countAssignableDaysForCourse(dateStr, exam, days) {
    return days.filter((day) => {
      if (day.dateStr < dateStr) return false;
      if (parseDate(day.dateStr) >= exam.dateObj) return false;
      const examCourseIds = new Set((day.examsOnDay || []).map((e) => e.id));
      return !examCourseIds.has(exam.courseId);
    }).length;
  }

  function remainingQueueHours(queue) {
    return (queue || []).reduce((sum, item) => sum + item.hours, 0);
  }

  function createStudyFromItem(item) {
    const course = COURSES.find((c) => c.id === item.courseId) || {};
    return {
      courseId: item.courseId,
      courseName: item.courseName,
      lectureId: item.lectureId,
      lectureTitle: item.lectureTitle,
      lectureSubtitle: item.hours + "h",
      lectureLink: item.lectureLink,
      hours: item.hours,
      type: item.type,
      isReview: ["revision", "spaced_review", "final_review"].includes(item.type),
      isRecall: item.type === "recall",
      isPractice: item.type === "practice",
      courseColor: course.colorRgb || "59,130,246",
      courseIcon: course.icon || "📚",
      isPostExam: false,
      phaseIndex: EXAM_CALENDAR.find((exam) => exam.courseId === item.courseId)?.phaseIndex || 1,
    };
  }

  function flushUnscheduledBeforeExams(days, queues, examByCourse) {
    Object.keys(queues).forEach((courseId) => {
      const queue = queues[courseId];
      const exam = examByCourse[courseId];
      while (queue.length > 0) {
        const targetDay = [...days]
          .reverse()
          .find(
            (day) =>
              !day.isExamDay &&
              parseDate(day.dateStr) < exam.dateObj &&
              new Set(day.studies.map((st) => st.courseId)).size <= 2 &&
              (day.studies.length === 0 ||
                day.studies.some((st) => st.courseId === courseId) ||
                new Set(day.studies.map((st) => st.courseId)).size < 2),
          );

        if (!targetDay) break;

        const item = queue.shift();
        targetDay.studies.push(createStudyFromItem(item));
        targetDay.totalHours = targetDay.studies.reduce((s, st) => s + st.hours, 0);
        targetDay.strategy = "deadline_compression";
      }
    });
  }

  // ==========================================
  // DISTRIBUTE ITEMS FOR ONE SUBJECT
  // ==========================================

  /**
   * Assign study items for a single subject across available days.
   * Uses intelligent backward distribution: spreads items across available days
   * while keeping related items grouped when possible.
   * When days are limited, multiple items land on the same day (up to 3 items).
   * Max 2 different subjects per day across all subjects.
   *
   * Strategy:
   * - Spread items evenly across available days
   * - itemsPerDay starts at 1; increases when daysAvailable < itemCount
   * - Last 3 days before exam: intensive review if time permits
   * - Priority: learning → practice → revision → recall
   */
  function distributeSubjectItems(
    subjectItems,
    phaseStart,
    examDate,
    exam,
    completedIds,
    effectiveStart,
  ) {
    const daysAvailable = Math.max(1, daysBetween(phaseStart, examDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (subjectItems.length === 0) return [];

    // Calculate items per day
    let itemsPerDay = 1;
    const maxItemsPerDay = 3;
    while (
      itemsPerDay < maxItemsPerDay &&
      Math.ceil(subjectItems.length / itemsPerDay) > daysAvailable
    ) {
      itemsPerDay++;
    }

    const resultDays = [];
    const totalGroups = Math.ceil(subjectItems.length / itemsPerDay);
    const actualDays = Math.min(totalGroups, daysAvailable);

    // Create a list of study dates, spreading them evenly from phaseStart to exam-1
    const studyDates = [];
    for (let d = 0; d < actualDays; d++) {
      const ratio = actualDays > 1 ? d / (actualDays - 1) : 0;
      const daysFromStart = Math.floor(ratio * (daysAvailable - 1));
      const studyDate = addDays(phaseStart, daysFromStart);

      // Ensure we don't go on or past exam date
      if (studyDate >= examDate) continue;
      if (studyDate < effectiveStart || studyDate < today) continue;

      const dateStr = dateToStr(studyDate);
      // Only add if this date isn't already scheduled for this subject
      if (!studyDates.some((sd) => sd.dateStr === dateStr)) {
        studyDates.push({ dateStr, date: studyDate });
      }
    }

    // If we don't have enough dates, add them by working backward from exam
    if (studyDates.length < actualDays) {
      for (let daysBack = 1; daysBack < daysAvailable; daysBack++) {
        if (studyDates.length >= actualDays) break;
        const studyDate = addDays(examDate, -daysBack);
        if (studyDate < effectiveStart || studyDate < today) continue;

        const dateStr = dateToStr(studyDate);
        if (!studyDates.some((sd) => sd.dateStr === dateStr)) {
          studyDates.push({ dateStr, date: studyDate });
        }
      }
    }

    // Sort study dates chronologically
    studyDates.sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));

    // Distribute items across study dates
    for (let dateIdx = 0; dateIdx < studyDates.length; dateIdx++) {
      const { dateStr, date: targetDate } = studyDates[dateIdx];

      // Calculate which items belong on this date
      const itemsForThisDay =
        Math.ceil((subjectItems.length * (dateIdx + 1)) / studyDates.length) -
        Math.ceil((subjectItems.length * dateIdx) / studyDates.length);
      const startIdx = Math.ceil(
        (subjectItems.length * dateIdx) / studyDates.length,
      );
      const endIdx = startIdx + itemsForThisDay;
      const groupItems = subjectItems.slice(startIdx, endIdx);

      const daysBeforeExam = daysBetween(targetDate, examDate);
      const studies = groupItems.map((item) => {
        const course = COURSES.find((c) => c.id === item.courseId) || {};
        return {
          courseId: item.courseId,
          courseName: item.courseName,
          lectureId: item.lectureId,
          lectureTitle: item.lectureTitle,
          lectureSubtitle: item.hours + "h",
          lectureLink: item.lectureLink,
          hours: item.hours,
          type: item.type,
          isReview: ["revision", "spaced_review", "final_review"].includes(
            item.type,
          ),
          isRecall: item.type === "recall",
          isPractice: item.type === "practice",
          courseColor: course.colorRgb || "59,130,246",
          courseIcon: course.icon || "📚",
          isPostExam: false,
          phaseIndex: exam.phaseIndex,
        };
      });

      const totalHours = studies.reduce((s, st) => s + st.hours, 0);

      resultDays.push({
        date: targetDate,
        dateStr,
        dayIndex: resultDays.length,
        studies,
        totalHours,
        examsOnDay: [],
        isExamDay: false,
        isToday: dateEquals(targetDate, today),
        phase: exam.phaseLabel,
        strategy:
          daysBeforeExam <= 3 ? "pre_exam_intensive" : "adaptive_compression",
        phaseIndex: exam.phaseIndex,
        examName: exam.courseName,
        examId: null,
        examCourseId: exam.courseId,
        daysBeforeExam,
        isPostExam: false,
        itemsPerDay,
      });
    }

    // If no days were generated (all dates collapsed), create one emergency day
    if (resultDays.length === 0 && subjectItems.length > 0) {
      const fallbackDate = addDays(examDate, -1);
      if (fallbackDate >= effectiveStart && fallbackDate > today) {
        const studies = subjectItems.map((item) => {
          const course = COURSES.find((c) => c.id === item.courseId) || {};
          return {
            courseId: item.courseId,
            courseName: item.courseName,
            lectureId: item.lectureId,
            lectureTitle: item.lectureTitle,
            lectureSubtitle: item.hours + "h",
            lectureLink: item.lectureLink,
            hours: item.hours,
            type: item.type,
            isReview: ["revision", "spaced_review", "final_review"].includes(
              item.type,
            ),
            isRecall: item.type === "recall",
            isPractice: item.type === "practice",
            courseColor: course.colorRgb || "59,130,246",
            courseIcon: course.icon || "📚",
            isPostExam: false,
            phaseIndex: exam.phaseIndex,
          };
        });
        resultDays.push({
          date: fallbackDate,
          dateStr: dateToStr(fallbackDate),
          dayIndex: 0,
          studies,
          totalHours: studies.reduce((s, st) => s + st.hours, 0),
          examsOnDay: [],
          isExamDay: false,
          isToday: dateEquals(fallbackDate, today),
          phase: exam.phaseLabel,
          strategy: "emergency_compression",
          phaseIndex: exam.phaseIndex,
          examName: exam.courseName,
          examId: null,
          examCourseId: exam.courseId,
          daysBeforeExam: 1,
          isPostExam: false,
          itemsPerDay: subjectItems.length,
        });
      }
    }

    return resultDays;
  }

  // ==========================================
  // INTERLEAVE MULTIPLE SUBJECTS IN SAME DAY
  // ==========================================

  /**
   * When multiple subjects have study days on the same date, combine them.
   * Rule: max 2 different subjects per day.
   * If >2 subjects on same day, distribute overflow to next available day.
   */
  function interleaveDays(scheduleDays) {
    if (scheduleDays.length === 0) return [];

    // Group by date string
    const byDate = {};
    scheduleDays.forEach((day) => {
      if (!byDate[day.dateStr]) byDate[day.dateStr] = [];
      byDate[day.dateStr].push(day);
    });

    const merged = [];
    const dates = Object.keys(byDate).sort();
    let pendingStudies = []; // Overflow items from max 2 subjects rule

    dates.forEach((dateStr) => {
      const daysOnDate = byDate[dateStr];
      const isExamDay = daysOnDate.some((d) => d.isExamDay);

      if (isExamDay) {
        // Exam days are final - no interleaving, just add all exams
        const firstDay = daysOnDate[0];
        merged.push({
          date: firstDay.date,
          dateStr,
          dayIndex: merged.length,
          studies: [],
          totalHours: 2,
          examsOnDay: daysOnDate.flatMap((d) => d.examsOnDay),
          isExamDay: true,
          isToday: dateEquals(firstDay.date, new Date()),
          phase: firstDay.phase,
          strategy: "exam_day",
          phaseIndex: firstDay.phaseIndex,
          examName: firstDay.examName,
          examId: firstDay.examId,
          examCourseId: firstDay.examCourseId,
          daysBeforeExam: 0,
          isPostExam: false,
        });
        pendingStudies = []; // Clear pending after exam
      } else {
        // Combine studies: max 2 subjects per day
        const allStudies = [...pendingStudies];
        const seenSubjects = new Set();
        pendingStudies.forEach((st) => seenSubjects.add(st.courseId));

        for (const day of daysOnDate) {
          for (const st of day.studies) {
            if (!seenSubjects.has(st.courseId)) {
              if (seenSubjects.size < 2) {
                seenSubjects.add(st.courseId);
                allStudies.push(st);
              } else {
                // Too many subjects, push to next day
                pendingStudies.push(st);
              }
            } else {
              // Same subject already on this day, add it
              allStudies.push(st);
            }
          }
        }

        if (allStudies.length > 0) {
          const firstDay = daysOnDate[0];
          const totalHours = allStudies.reduce((s, st) => s + st.hours, 0);
          merged.push({
            date: firstDay.date,
            dateStr,
            dayIndex: merged.length,
            studies: allStudies,
            totalHours,
            examsOnDay: [],
            isExamDay: false,
            isToday: dateEquals(firstDay.date, new Date()),
            phase: firstDay.phase,
            strategy: firstDay.strategy,
            phaseIndex: firstDay.phaseIndex,
            examName: firstDay.examName,
            examId: firstDay.examId,
            examCourseId: firstDay.examCourseId,
            daysBeforeExam: firstDay.daysBeforeExam,
            isPostExam: false,
          });

          // Keep only overflow items that didn't fit
          const usedIds = new Set(allStudies.map((st) => st.lectureId));
          pendingStudies = pendingStudies.filter(
            (st) => !usedIds.has(st.lectureId),
          );
        }
      }
    });

    // Handle any remaining pending studies by distributing them to available days
    if (pendingStudies.length > 0) {
      for (let i = merged.length - 1; i >= 0; i--) {
        if (merged[i].isExamDay || pendingStudies.length === 0) continue;

        const day = merged[i];
        const subjectCount = new Set(day.studies.map((st) => st.courseId)).size;

        for (let j = pendingStudies.length - 1; j >= 0; j--) {
          const st = pendingStudies[j];
          if (!day.studies.some((s) => s.courseId === st.courseId)) {
            if (subjectCount < 2) {
              day.studies.push(st);
              day.totalHours += st.hours;
              pendingStudies.splice(j, 1);
            }
          } else {
            // Same subject, can always add
            day.studies.push(st);
            day.totalHours += st.hours;
            pendingStudies.splice(j, 1);
          }
        }
      }
    }

    return merged;
  }

  // ==========================================
  // VALIDATE AND CLEAN SCHEDULE
  // ==========================================

  /**
   * Remove any study items scheduled on or after their subject's exam date.
   * This is a safety check to ensure no tasks appear post-exam.
   * Also ensure chronological order.
   */
  function validateAndCleanSchedule(scheduleDays) {
    // Build exam date map: courseId → exam date string
    const examDateMap = {};
    EXAM_CALENDAR.forEach((exam) => {
      examDateMap[exam.courseId] = exam.date;
    });

    const cleaned = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const day of scheduleDays) {
      // Keep exam days
      if (day.isExamDay) {
        cleaned.push(day);
        continue;
      }

      // Filter out studies scheduled on or after their exam date
      const validStudies = day.studies.filter((st) => {
        const examDate = examDateMap[st.courseId];
        if (!examDate) return true; // Keep if no exam date found
        const dayDate = parseDate(day.dateStr);
        const examDateObj = parseDate(examDate);
        return dayDate < examDateObj;
      });

      day.studies = validStudies;
      day.totalHours = validStudies.reduce((s, st) => s + st.hours, 0);
      day.date = parseDate(day.dateStr);
      cleaned.push(day);
    }

    // Re-sort chronologically and re-assign dayIndex
    cleaned.sort((a, b) => parseDate(a.dateStr) - parseDate(b.dateStr));
    cleaned.forEach((day, idx) => {
      day.dayIndex = idx;
    });

    return cleaned;
  }

  // ==========================================
  // PHASE GROUPING
  // ==========================================

  function groupIntoPhases(scheduleDays) {
    if (scheduleDays.length === 0) return [];

    const phases = [];
    let currentPhase = null;
    const phaseLabels = {
      1: "Database + Marketing",
      2: "Statistics + Crypto + Networks",
      3: "Data Structures",
    };

    scheduleDays.forEach((day) => {
      const idx = day.phaseIndex || 1;

      if (day.isExamDay) {
        if (currentPhase && currentPhase.days.length > 0) {
          phases.push(currentPhase);
        }
        phases.push({
          label: `Exam: ${day.examName}`,
          days: [day],
          phase: "exam",
          phaseIndex: idx,
        });
        currentPhase = null;
      } else if (!currentPhase || currentPhase.phaseIndex !== idx) {
        if (currentPhase && currentPhase.days.length > 0) {
          phases.push(currentPhase);
        }
        currentPhase = {
          label: phaseLabels[idx] || `Phase ${idx}`,
          phaseIndex: idx,
          days: [day],
          phase: day.phase,
        };
      } else {
        currentPhase.days.push(day);
      }
    });

    if (currentPhase && currentPhase.days.length > 0) {
      phases.push(currentPhase);
    }

    return phases;
  }

  // ==========================================
  // STATISTICS — always computed fresh
  // ==========================================

  function calculateStats(scheduleDays, completedIds, context = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const contextStart = context.effectiveStartStr
      ? parseDate(context.effectiveStartStr)
      : today;
    const effectiveStart = contextStart > today ? contextStart : today;

    // Merge completed ids from both sources
    const allCompleted = new Set(completedIds || []);
    try {
      const state = JSON.parse(
        localStorage.getItem("study_planner_state") || "{}",
      );
      (state.completedLectures || []).forEach((id) =>
        allCompleted.add(mapCourseLectureToStudyId(id)),
      );
      (state.preCompletedLectures || []).forEach((l) =>
        allCompleted.add(mapCourseLectureToStudyId(l.id || l)),
      );
    } catch (_) {}

    // If allCompleted is still empty (no storage), seed from completedIds param
    if (allCompleted.size === 0 && completedIds instanceof Set) {
      completedIds.forEach((id) => allCompleted.add(id));
    }

    const scheduledStudyItems = [];
    scheduleDays.forEach((day) => {
      day.studies.forEach((st) => {
        if (!st.isPostExam && st.type !== "exam") {
          scheduledStudyItems.push(st);
        }
      });
    });

    const remainingCourseIds = new Set(
      (context.remainingExams || [])
        .filter((exam) => parseDate(exam.date) >= effectiveStart)
        .map((exam) => exam.courseId),
    );

    const relevantItems = (context.allItems || buildStudyItems()).filter((item) =>
      remainingCourseIds.size > 0
        ? remainingCourseIds.has(item.courseId)
        : scheduledStudyItems.some((st) => st.courseId === item.courseId),
    );

    const completedRelevant = relevantItems.filter((item) =>
      allCompleted.has(item.lectureId),
    );

    const completedIdsInRelevant = new Set(
      completedRelevant.map((item) => item.lectureId),
    );
    const remainingItemsList = relevantItems.filter(
      (item) => !completedIdsInRelevant.has(item.lectureId),
    );

    const totalItems = relevantItems.length;
    const totalHours = relevantItems.reduce((sum, item) => sum + item.hours, 0);
    const completedItems = completedRelevant.length;
    const completedHours = completedRelevant.reduce((sum, item) => sum + item.hours, 0);

    const remainingItems = remainingItemsList.length;
    const remainingHours = remainingItemsList.reduce((sum, item) => sum + item.hours, 0);

    const examDays = scheduleDays.filter(
      (d) => d.isExamDay && parseDate(d.dateStr) >= effectiveStart,
    );
    const completionPct =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const nextExamDay = examDays
      .sort((a, b) => parseDate(a.dateStr) - parseDate(b.dateStr))[0];

    const nextExamDate = nextExamDay ? parseDate(nextExamDay.dateStr) : effectiveStart;
    const daysRemaining = nextExamDay
      ? Math.max(0, daysBetween(effectiveStart, nextExamDate))
      : 0;

    const nextExam = nextExamDay
      ? {
          ...(COURSES.find((c) => c.id === nextExamDay.examCourseId) || {}),
          examDate: nextExamDay.dateStr,
        }
      : null;

    const examDaysCount = examDays.length;

    return {
      totalLectures: totalItems,
      completedLectures: completedItems,
      remainingLectures: remainingItems,
      totalHours: Math.round(totalHours * 10) / 10,
      completedHours: Math.round(completedHours * 10) / 10,
      remainingHours: Math.round(remainingHours * 10) / 10,
      totalDays: scheduleDays.filter((d) => !d.isExamDay).length,
      daysRemaining,
      completionPercentage: completionPct,
      nextExam,
      examDaysCount,
    };
  }

  // ==========================================
  // PUBLIC API
  // ==========================================

  return {
    generateSchedule,
    recalculateStats: function (schedule) {
      if (!schedule || !schedule.days) return null;
      // Always read fresh from localStorage so dashboard reflects latest state
      const completedIds = new Set();
      try {
        const state = JSON.parse(localStorage.getItem("study_planner_state") || "{}");
        (state.completedLectures || []).forEach(id => completedIds.add(mapCourseLectureToStudyId(id)));
        (state.preCompletedLectures || []).forEach(l => completedIds.add(mapCourseLectureToStudyId(l.id || l)));
      } catch (_) {}
      const effectiveStartStr =
        (schedule.meta && schedule.meta.effectiveStart) ||
        (schedule.days[0] && schedule.days[0].dateStr) ||
        dateToStr(new Date());
      const remainingExams = EXAM_CALENDAR
        .map((exam) => ({ ...exam, dateObj: parseDate(exam.date) }))
        .filter((exam) => parseDate(exam.date) >= parseDate(effectiveStartStr));
      return calculateStats(schedule.days, completedIds, {
        allItems: buildStudyItems(),
        remainingExams,
        effectiveStartStr,
      });
    },
    daysBetween,
    formatDate,
  };
})();
