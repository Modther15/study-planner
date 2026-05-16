/**
 * Course data for all 6 subjects
 * Each course includes: lectures, exam date/time, difficulty, study hours needed,
 * resources (Drive links), and video references
 */

const COURSES = [
  {
    id: "networks",
    name: "Computer Networks 1",
    shortName: "Networks",
    icon: "🌐",
    color: "var(--accent-red)",
    colorRgb: "239, 68, 68",
    difficulty: "hard",
    hoursNeeded: 30,
    examDate: "2026-06-04T09:00:00",
    examDuration: "9:00 AM - 11:00 AM",
    totalLectures: 5,
    videoRef:
      "https://www.youtube.com/watch?v=Gb6WaxEXGdw&list=PLCaBbsduBn60kJ_uzegOmQ5yZTdz5BnqC",
    driveMain:
      "https://drive.google.com/drive/folders/1NloZzNoXu3zMw3lefvBpj58T69x7kTqv",
    lectures: [
      {
        id: "net-1",
        title: "Data Link Layer Protocols (ARQ)",
        subtitle: "Part 1",
        link: "https://drive.google.com/file/d/1OVGf7HPgjmNfKvCIm6EdFWJc4NNSVbWM/view?usp=drivesdk",
      },
      {
        id: "net-2",
        title: "Error Detection & Correction (CRC)",
        subtitle: "Part 2",
        link: "https://drive.google.com/file/d/12TQYQU_1zOKOxaVI9-MxGIECWaFGYBds/view?usp=drivesdk",
      },
      {
        id: "net-3",
        title: "LAN Overview",
        subtitle: "Part 3",
        link: "https://drive.google.com/file/d/1h2C6DuYk9gsLTO7VGtXMJ4dGSnnh0iSZ/view?usp=drivesdk",
      },
      {
        id: "net-4",
        title: "Ethernet",
        subtitle: "Part 4",
        link: "https://drive.google.com/file/d/197nZMcFDDl2GR007Y_CeQTlrfiXgMNem/view?usp=drivesdk",
      },
      {
        id: "net-5",
        title: "Wireless LAN",
        subtitle: "Part 5",
        link: "https://drive.google.com/file/d/1JryKGKZdtHXUT32ZJC2rrQDiiPQ7K43b/view?usp=drivesdk",
      },
    ],
    resources: [
      {
        label: "Lectures Folder",
        link: "https://drive.google.com/drive/folders/1NloZzNoXu3zMw3lefvBpj58T69x7kTqv",
      },
      {
        label: "Midterms",
        link: "https://drive.google.com/drive/folders/1DXNo1M8_Je2qCdQ9x1unyoUwAk929EYW",
      },
      {
        label: "Practice Sheets",
        link: "https://drive.google.com/drive/folders/1PEHulevsYQF3s6QmOEFweMXlQu7anKPp",
      },
      {
        label: "Quizzes",
        link: "https://drive.google.com/drive/folders/10as1xT4LTe8AfbCJ4HD008RlxCjzzbpl",
      },
      {
        label: "Finals",
        link: "https://drive.google.com/drive/folders/1LKcKRm-09RiY0OL6HsgysI5vKeqO8brt",
      },
    ],
    topics: [
      "ARQ",
      "CRC",
      "Sliding Window",
      "CSMA/CD",
      "MAC",
      "802.11",
      "Throughput",
      "Delay",
    ],
  },
  {
    id: "cryptography",
    name: "Advanced Cryptography",
    shortName: "Crypto",
    icon: "🔐",
    color: "var(--accent-teal)",
    colorRgb: "20, 184, 166",
    difficulty: "hard",
    hoursNeeded: 30,
    examDate: "2026-06-03T09:00:00",
    examDuration: "9:00 AM - 11:00 AM",
    totalLectures: 8,
    videoRef:
      "https://www.youtube.com/watch?v=i78wptDVxZA&list=PLByf1VP5-5RSZlwQ2l0Xkvx7Jf2X0G2ST",
    driveMain:
      "https://drive.google.com/drive/folders/1B0HUbmOtCey7Xu9pay6zubHEl0dNHPwm",
    doctorVideos:
      "https://drive.google.com/drive/folders/10SUC62586NxhFKnv7499mgmklA_RyjJD",
    lectures: [
      {
        id: "cry-1",
        title: "Introduction to Cryptography",
        subtitle: "Ch.1",
        link: "https://drive.google.com/file/d/1VqZnPUNU3liwFxwr1R2djj9jhf24gq3e/view?usp=drivesdk",
      },
      {
        id: "cry-2",
        title: "Stream Ciphers",
        subtitle: "Ch.2",
        link: "https://drive.google.com/file/d/1uDbjVOjKKNvpOyXWLH9XYAtZfs6jXoWc/view?usp=drivesdk",
      },
      {
        id: "cry-3",
        title: "The Data Encryption Standard (DES)",
        subtitle: "Ch.3",
        link: "https://drive.google.com/file/d/1L3ZvQgHabSBuocKlBXHxYK0ZeO94OxBw/view?usp=drivesdk",
      },
      {
        id: "cry-4",
        title: "The Advanced Encryption Standard (AES)",
        subtitle: "Ch.4",
        link: "https://drive.google.com/file/d/1yvY4JvPPWWynfxE0Y0u5DUS_M9g1S7bN/view?usp=drivesdk",
      },
      {
        id: "cry-5",
        title: "More About Block Ciphers",
        subtitle: "Ch.5",
        link: "https://drive.google.com/file/d/1GjV0S0272z8qHjKcmJaf_VFlxdHVFtj0/view?usp=drivesdk",
      },
      {
        id: "cry-6",
        title: "Introduction to Public-Key Cryptography",
        subtitle: "Ch.6",
        link: "https://drive.google.com/file/d/13-q_4rruCm4YPk6_xUu8h7NkDyIzgDy0/view?usp=drivesdk",
      },
      {
        id: "cry-7",
        title: "The RSA Cryptosystem",
        subtitle: "Ch.7",
        link: "https://drive.google.com/file/d/1aCh61fNtmySeS1ATxIIi-N9gwoLTzABD/view?usp=drivesdk",
      },
      {
        id: "cry-8",
        title: "Public-Key Cryptosystems Based on DLP",
        subtitle: "Ch.8",
        link: "https://drive.google.com/file/d/1FuPsBO-tCEVp_V2nqTsfiRdLOuKpfSbb/view?usp=drivesdk",
      },
    ],
    resources: [
      {
        label: "Lectures Folder",
        link: "https://drive.google.com/drive/folders/1B0HUbmOtCey7Xu9pay6zubHEl0dNHPwm",
      },
      {
        label: "Books",
        link: "https://drive.google.com/drive/folders/1SdWa05S-ykyqvroHTXIwJIsC87lfDYtS",
      },
      {
        label: "Assignments",
        link: "https://drive.google.com/drive/folders/1WIDjEzU0ioGmqYywfgjcAKk8ZF40SVWY",
      },
      {
        label: "Labs",
        link: "https://drive.google.com/drive/folders/1rl17etJiqOVyTH_ANA92pLAhF_MC5TA6",
      },
      {
        label: "Midterms",
        link: "https://drive.google.com/drive/folders/12mMyOj-n90asqt6dQiFuiHXnfaYQDoxQ",
      },
      {
        label: "Problems + Solution",
        link: "https://drive.google.com/drive/folders/1qqRLE73h2ek_32g7lCtfuDC1g8FPxz5s",
      },
      {
        label: "Finals",
        link: "https://drive.google.com/drive/folders/1XIq1uRus4taHa3XseqYb9h9OpNO39KUo",
      },
      {
        label: "Doctor Solving Videos",
        link: "https://drive.google.com/drive/folders/10SUC62586NxhFKnv7499mgmklA_RyjJD",
      },
    ],
    topics: [
      "Classical Ciphers",
      "DES",
      "AES",
      "RSA",
      "DLP",
      "Modular Arithmetic",
      "Hash Functions",
      "Digital Signatures",
    ],
  },
  {
    id: "datastructure",
    name: "Data Structures",
    shortName: "Data Struct.",
    icon: "📊",
    color: "var(--accent-amber)",
    colorRgb: "245, 158, 11",
    difficulty: "medium",
    hoursNeeded: 25,
    examDate: "2026-06-07T09:00:00",
    examDuration: "9:00 AM - 11:00 AM",
    totalLectures: 17,
    videoRef:
      "https://drive.google.com/drive/folders/1xQSlyf6nU67JivLgf5Ijoke2W5lgnnze",
    veryGoodVideo: "https://youtu.be/4xQG6NLa1vo?si=H1faN4_nzKPLT6Ur",
    driveMain:
      "https://drive.google.com/drive/folders/1993GMMB68dKUOS0L5b2PLL2YYHKfc8EB",
    lectures: [
      {
        id: "ds-1",
        title: "Introduction & Complexity Analysis",
        subtitle: "Lec 1",
        link: "https://drive.google.com/file/d/1kq-NiNUZeVCb9gKZECpelABLsubQqdB3/view?usp=drivesdk",
      },
      {
        id: "ds-2",
        title: "Arrays & Big-O Notation",
        subtitle: "Lec 2",
        link: "https://drive.google.com/file/d/1c8sv9XkqxQDtHUufsn2oWXBRnjnPcJ-K/view?usp=drivesdk",
      },
      {
        id: "ds-3",
        title: "Algorithm Analysis",
        subtitle: "Lec 3",
        link: "https://drive.google.com/file/d/1pynpV3fC007TZ-4uFizL49_R7V73WhVG/view?usp=drivesdk",
      },
      {
        id: "ds-4",
        title: "Quadratic Sorting",
        subtitle: "Lec 4",
        link: "https://drive.google.com/file/d/1TO7XjJuJI-ar3UrPbDITqXCz0rCTkGl3/view?usp=drivesdk",
      },
      {
        id: "ds-5",
        title: "Sorting (Bubble, Selection, Insertion)",
        subtitle: "Lec 5",
        link: "https://drive.google.com/file/d/1JvQ5JrzDO2Q6Jhk_zVrchdtus6cVAR8x/view?usp=drivesdk",
      },
      {
        id: "ds-6a",
        title: "Quadratic Algorithms",
        subtitle: "Lec 6A",
        link: "https://drive.google.com/file/d/1D8bDXXHy7T7fCJJ1uTETJJMlmL_F9hqK/view?usp=drivesdk",
      },
      {
        id: "ds-6b",
        title: "QuickSort",
        subtitle: "Lec 6B",
        link: "https://drive.google.com/file/d/1XfSxSFdQkgFCVGBvNkrb6lp7jQJpCPCu/view?usp=drivesdk",
      },
      {
        id: "ds-7",
        title: "Linked Lists",
        subtitle: "Lec 7",
        link: "https://drive.google.com/file/d/1YMFNlhuFwHTG-2V8h6BqyASQrUz90CAX/view?usp=drivesdk",
      },
      {
        id: "ds-8",
        title: "Doubly Linked Lists",
        subtitle: "Lec 8",
        link: "https://drive.google.com/file/d/10mqyLjIO3TvNQD9lVoxuKB-CNWylqBKP/view?usp=drivesdk",
      },
      {
        id: "ds-9",
        title: "Binary Search & Vectors",
        subtitle: "Lec 9",
        link: "https://drive.google.com/file/d/19a-ysFBUtX7koD9lKtoO8N5_fY1c6EA3/view?usp=drivesdk",
      },
      {
        id: "ds-10",
        title: "Stacks",
        subtitle: "Lec 10",
        link: "https://drive.google.com/file/d/1fXbueEDMhDbxNzBFXfbPLQp2-tlcMyDJ/view?usp=drivesdk",
      },
      {
        id: "ds-11",
        title: "Stacks & Queues",
        subtitle: "Lec 11",
        link: "https://drive.google.com/file/d/1nET5iHUcsELTJTx8k79r7eTM9a8PKEVN/view?usp=drivesdk",
      },
      {
        id: "ds-12",
        title: "Trees - I",
        subtitle: "Lec 12",
        link: "https://drive.google.com/file/d/1ccqMbi1nANqJZp-3xw9mNGpzR9hOeK4T/view?usp=drivesdk",
      },
      {
        id: "ds-13",
        title: "Trees 2",
        subtitle: "Lec 13",
        link: "https://drive.google.com/file/d/1exA8nmFgxyG9pU0AA9CEHZhimXtdQm-U/view?usp=drivesdk",
      },
      {
        id: "ds-14",
        title: "Trees 3",
        subtitle: "Lec 14",
        link: "https://drive.google.com/file/d/1ims99m1EHNGRqtcfP4uMITjWxuEWBs9_/view?usp=drivesdk",
      },
      {
        id: "ds-15",
        title: "Hashing",
        subtitle: "Lec 15",
        link: "https://drive.google.com/file/d/18ACMi8nvtm0jAQBTRUpycJ7uv-No8wlA/view?usp=drivesdk",
      },
      {
        id: "ds-16",
        title: "Graphs",
        subtitle: "Lec 16",
        link: "https://drive.google.com/file/d/1dqaD2evNTODCfvQXeDaulg_6IcBGaODw/view?usp=drivesdk",
      },
      {
        id: "ds-17",
        title: "Graphs (BFS/DFS)",
        subtitle: "Lec 17",
        link: "https://drive.google.com/file/d/15K2XewkJtK1WKOjYuPs1g3iarEMcUJiO/view?usp=drivesdk",
      },
    ],
    resources: [
      {
        label: "Lectures Folder",
        link: "https://drive.google.com/drive/folders/1993GMMB68dKUOS0L5b2PLL2YYHKfc8EB",
      },
      {
        label: "Labs",
        link: "https://drive.google.com/drive/folders/19NZlW5KEzbFT1yaH1sEKAql1TXQzA12w",
      },
      {
        label: "Exercises",
        link: "https://drive.google.com/drive/folders/1LvTADDrazKsFpvGczCRrbnsnn4K1mvmI",
      },
      {
        label: "Quizzes",
        link: "https://drive.google.com/drive/folders/1NkPjmPV7Fb7aETQdQoJqLcJtUru9Arbh",
      },
      {
        label: "Midterms",
        link: "https://drive.google.com/drive/folders/11FVMvBzEudI8G9QiZj_KfaX-kdH5nIRy",
      },
      {
        label: "Finals",
        link: "https://drive.google.com/drive/folders/1JsZPqyqUT4RzckfgQd-VAtu6seTtOu03",
      },
      {
        label: "Assignments",
        link: "https://drive.google.com/drive/folders/1q3cWRJ8Rxq3kjblgev8OiAR1TEsVtGMy",
      },
      {
        label: "Textbook (PDF)",
        link: "https://drive.google.com/file/d/1APDWEGrb8rdijB5blgPGRX5EjjJz45a2/view?usp=drivesdk",
      },
    ],
    topics: [
      "Big-O",
      "Sorting",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "BST",
      "Hashing",
      "Graphs",
      "BFS/DFS",
    ],
  },
  {
    id: "statistics",
    name: "Probability & Statistics 2",
    shortName: "Stat-2",
    icon: "📈",
    color: "var(--accent-purple)",
    colorRgb: "139, 92, 246",
    difficulty: "medium",
    hoursNeeded: 25,
    examDate: "2026-06-01T09:00:00",
    examDuration: "9:00 AM - 11:00 AM",
    totalLectures: 0,
    videoRef:
      "https://www.youtube.com/watch?v=OtN3iMTZJGE&list=PLMCoJU1AQ0p3Ora9nHgh3Rt-sxuVVMvQ7",
    driveMain:
      "https://drive.google.com/drive/folders/1Z9VceI0Q7Mi2TuueC09BYhZiUppQf5ah",
    lectures: [],
    resources: [
      {
        label: "Main Folder",
        link: "https://drive.google.com/drive/folders/1Z9VceI0Q7Mi2TuueC09BYhZiUppQf5ah",
      },
      {
        label: "Midterms",
        link: "https://drive.google.com/drive/folders/1cSfdhH51IdhsG97TnioExBpyZLSObNU_",
      },
      {
        label: "Quizzes",
        link: "https://drive.google.com/drive/folders/1hrLoahzt6aiJSlSliJjyTK10TMkCQYjg",
      },
      {
        label: "Section Materials",
        link: "https://drive.google.com/drive/folders/1gChn6YcCjrXub84jgvxHqpPtOD1uz9bC",
      },
      {
        label: "Lectures",
        link: "https://drive.google.com/drive/folders/1_D8ePrcYM925nehSxQK9KN8yGjueASqg",
      },
    ],
    topics: [
      "Sampling Distributions",
      "Confidence Intervals",
      "Hypothesis Testing",
      "T-tests",
      "Z-tests",
      "ANOVA",
      "Chi-square",
      "Regression",
    ],
  },
  {
    id: "database",
    name: "Database Systems",
    shortName: "Database",
    icon: "💾",
    color: "var(--accent-blue)",
    colorRgb: "59, 130, 246",
    difficulty: "easy",
    hoursNeeded: 20,
    examDate: "2026-05-23T09:00:00",
    examDuration: "9:00 AM - 11:00 AM",
    totalLectures: 11,
    videoRef:
      "https://www.youtube.com/watch?v=V7uLt0q6Gjo&list=PLBcOV2jq_2hLcMj22ISRsrgBNnaVxfi23",
    driveMain:
      "https://drive.google.com/drive/folders/1exdgSL9O6VWGKF7RPIhL-Ce3J_l_aTXQ",
    lectures: [
      {
        id: "db-1",
        title: "Introduction to Database Systems",
        subtitle: "Lec 1",
      },
      { id: "db-2", title: "Relational Model", subtitle: "Lec 2" },
      { id: "db-3", title: "SQL DDL & Constraints", subtitle: "Lec 3" },
      { id: "db-4", title: "DML & Basic Queries", subtitle: "Lec 4" },
      { id: "db-5", title: "Advanced Joins", subtitle: "Lec 5" },
      { id: "db-6", title: "Set Operators & Subqueries", subtitle: "Lec 6" },
      { id: "db-7", title: "Relational Algebra", subtitle: "Lec 7" },
      { id: "db-8", title: "ER Diagrams", subtitle: "Lec 8" },
      { id: "db-9", title: "ER to Relational Mapping", subtitle: "Lec 9" },
      { id: "db-10", title: "EERD", subtitle: "Lec 10" },
      { id: "db-11", title: "Normalization", subtitle: "Lec 11" },
    ],
    resources: [
      {
        label: "Main DB Folder",
        link: "https://drive.google.com/drive/folders/1exdgSL9O6VWGKF7RPIhL-Ce3J_l_aTXQ",
      },
      {
        label: "Past Midterms",
        link: "https://drive.google.com/drive/folders/1ICA1Ae36AOh-4V7qcIDohcexmfhRlQIp",
      },
      {
        label: "Labs",
        link: "https://drive.google.com/drive/folders/1lRmN6J_Jg44AziOsdrZlseYjVnSeNVj4",
      },
      {
        label: "Practical",
        link: "https://drive.google.com/drive/folders/1jyjFz3urtlIZhH21H-Mf9uCG22-xVYbZ",
      },
      {
        label: "Quizzes",
        link: "https://drive.google.com/drive/folders/1SoLOzwwy_c-Cc90ZEuwKncPh86i43OM0",
      },
    ],
    topics: [
      "SQL",
      "Normalization",
      "ER Diagrams",
      "Relational Algebra",
      "Joins",
      "DML/DDL",
    ],
  },
  {
    id: "marketing",
    name: "Marketing & Sales",
    shortName: "Marketing",
    icon: "📣",
    color: "var(--accent-green)",
    colorRgb: "16, 185, 129",
    difficulty: "easy",
    hoursNeeded: 15,
    examDate: "2026-05-25T12:00:00",
    examDuration: "12:00 PM - 2:00 PM",
    totalLectures: 0,
    videoRef: null,
    driveMain:
      "https://drive.google.com/drive/folders/1AlCUI9tAPHF_KgQ9uHcOzrM58qPdo6vT",
    lectures: [],
    resources: [
      {
        label: "Main Marketing Folder",
        link: "https://drive.google.com/drive/folders/1AlCUI9tAPHF_KgQ9uHcOzrM58qPdo6vT",
      },
      {
        label: "MCQ Questions",
        link: "https://drive.google.com/drive/folders/1jmkgYbiPhTQr-UrkJYD1rTIuyA9MRQhc",
      },
      {
        label: "Marketing Summary (PDF)",
        link: "https://drive.google.com/file/d/1COHo0tBWtqzED5vR73iHBPWsEPbOHDJA/view?usp=drive_link",
      },
      {
        label: "Assignments/Exercises",
        link: "https://drive.google.com/drive/folders/1v6oqBoIOt-WHGJRRltYJWFwjuIUM08i9",
      },
    ],
    topics: [
      "Marketing Fundamentals",
      "Consumer Behavior",
      "4Ps",
      "STP",
      "SWOT",
      "MCQ",
    ],
  },
];

/**
 * Productive activity suggestions for completed lectures
 */
const SUGGESTED_ACTIVITIES = [
  {
    type: "exam",
    label: "Solve Previous Exams",
    icon: "📝",
    description: "Practice with past exam papers to test your knowledge",
  },
  {
    type: "revision",
    label: "Revision Session",
    icon: "🔄",
    description: "Go over the material again with spaced repetition",
  },
  {
    type: "practice",
    label: "Practice Sheets",
    icon: "✏️",
    description: "Work through additional problem sets",
  },
  {
    type: "video",
    label: "Supplementary Videos",
    icon: "🎬",
    description: "Watch additional explanations and examples",
  },
  {
    type: "quiz",
    label: "Take a Quiz",
    icon: "🧠",
    description: "Test your understanding with quiz questions",
  },
];

/**
 * Motivational messages based on progress
 */
const MOTIVATIONAL_MESSAGES = {
  0: [
    "Ready to begin! Let's make a plan and crush these exams! 🚀",
    "Your journey starts now. Every hour counts! 💪",
    "Let's turn preparation into success! 📚",
  ],
  10: [
    "Great start! Keep the momentum going! 🔥",
    "You're building good habits. Stay consistent! ⭐",
  ],
  25: [
    "Quarter done! You're on the right track! 🏃",
    "Nice progress! The hard work is paying off! 🌟",
  ],
  40: [
    "Almost halfway there! Keep pushing! 💯",
    "You're making excellent progress! Don't stop now! 🏆",
  ],
  50: [
    "Halfway! You're doing amazing! 🎯",
    "The midpoint — you've proven you can do this! 🌈",
  ],
  60: [
    "More than halfway! You're in the home stretch! 🏠",
    "Solid progress! Only a little more to go! 💪",
  ],
  75: [
    "Three quarters done! You're almost there! 🔥",
    "Keep going, you're close! 💪",
    "Final stretch — don't lose focus now! 🎪",
  ],
  90: [
    "Almost done! Just a little more! 🎉",
    "You're so close! Finish strong! 🏅",
    "The end is in sight — push through! ⚡",
  ],
  95: ["So close! You've got this! 🔥", "One final push and you're done! 💫"],
  100: [
    "Congratulations! You did it! 🎉🎉🎉",
    "All exams conquered! You're amazing! 🏆",
    "Proud of you! You nailed it! 🌟",
  ],
};

/**
 * Base template study plan — relative offsets from BASE_START_DATE
 * All dates are relative to BASE_START_DATE. When user changes start date,
 * the system shifts all items by (userStart - BASE_START_DATE) days.
 *
 * Structure:
 * - baseStartDate: "2026-05-16" (reference start)
 * - phases: each phase has its exam date + study items
 * - Each item: relativeDay (offset from baseStartDate), courseId, title, hours, type, phase
 *
 * Rules enforced:
 * - Maximum 2 subjects per day
 * - Last 3 days before exam: ONLY that subject
 * - Revision + previous exams before every exam
 * - Heavy subjects (Networks) start earlier
 * - Adaptive prioritization based on exam difficulty and proximity
 */
const BASE_START_DATE = "2026-05-16";

const CUSTOM_PHASES = [
    // =============================================
    // PHASE 1: Database + Marketing (Exam: May 23, May 25)
    // =============================================
    {
        label: "Database + Marketing Prep",
        phaseIndex: 1,
        examDate: "2026-05-23",
        phaseStartDate: "2026-05-16",
        studyItems: [
            // May 16
            { relativeDay: 0, courseId: "database", courseName: "Database", lectureTitle: "Core Concepts + Relational Model", lectureId: "db-core-concepts-relational-model", hours: 2, type: "learning" },
            { relativeDay: 0, courseId: "database", courseName: "Database", lectureTitle: "SQL Basics", lectureId: "db-sql-basics", hours: 1.5, type: "learning" },
            // May 17
            { relativeDay: 1, courseId: "database", courseName: "Database", lectureTitle: "ERD + Normalization", lectureId: "db-erd-normalization", hours: 2, type: "learning" },
            { relativeDay: 1, courseId: "marketing", courseName: "Marketing", lectureTitle: "Introduction + Concepts", lectureId: "mkt-intro-concepts", hours: 1.5, type: "learning" },
            // May 18
            { relativeDay: 2, courseId: "database", courseName: "Database", lectureTitle: "Transactions + Indexing", lectureId: "db-transactions-indexing", hours: 2, type: "learning" },
            { relativeDay: 2, courseId: "marketing", courseName: "Marketing", lectureTitle: "Chapters Review", lectureId: "mkt-chapters-review", hours: 1.5, type: "revision" },
            // May 19
            { relativeDay: 3, courseId: "database", courseName: "Database", lectureTitle: "Solve Sheets / Questions", lectureId: "db-solve-sheets", hours: 2, type: "practice" },
            { relativeDay: 3, courseId: "database", courseName: "Database", lectureTitle: "Weak Topics Review", lectureId: "db-weak-topics-review", hours: 2, type: "revision" },
            // May 20
            { relativeDay: 4, courseId: "database", courseName: "Database", lectureTitle: "Previous Exams", lectureId: "db-previous-exams", hours: 2.5, type: "practice" },
            { relativeDay: 4, courseId: "marketing", courseName: "Marketing", lectureTitle: "Important Summaries", lectureId: "mkt-important-summaries", hours: 1.5, type: "revision" },
            // May 21 — 2 days before DB exam, final DB focus
            { relativeDay: 5, courseId: "database", courseName: "Database", lectureTitle: "Full Revision", lectureId: "db-full-revision", hours: 2, type: "revision" },
            { relativeDay: 5, courseId: "database", courseName: "Database", lectureTitle: "Active Recall", lectureId: "db-active-recall", hours: 1.5, type: "recall" },
            { relativeDay: 5, courseId: "database", courseName: "Database", lectureTitle: "Previous Exams 2", lectureId: "db-prev-exams-2", hours: 2, type: "practice" },
            // May 22 — 1 day before DB exam, final DB focus
            { relativeDay: 6, courseId: "database", courseName: "Database", lectureTitle: "Mock Exam", lectureId: "db-mock-exam", hours: 2.5, type: "practice" },
            { relativeDay: 6, courseId: "database", courseName: "Database", lectureTitle: "Final Revision", lectureId: "db-final-revision", hours: 2, type: "revision" },
            { relativeDay: 6, courseId: "database", courseName: "Database", lectureTitle: "Memorization Cleanup", lectureId: "db-memorization-cleanup", hours: 1, type: "recall" },
            // May 23 — DB EXAM
            { relativeDay: 7, courseId: "database", courseName: "Database", lectureTitle: "EXAM: Database Systems", lectureId: "db-exam", hours: 2, type: "exam" },
            // May 23 post-exam
            { relativeDay: 7, courseId: "marketing", courseName: "Marketing", lectureTitle: "Light Marketing Review", lectureId: "mkt-light-review", hours: 1, type: "revision", isPostExam: true },
            // May 24 — 1 day before Marketing exam
            { relativeDay: 8, courseId: "marketing", courseName: "Marketing", lectureTitle: "Solve Questions", lectureId: "mkt-solve-questions", hours: 2.5, type: "practice" },
            { relativeDay: 8, courseId: "marketing", courseName: "Marketing", lectureTitle: "Final Revision", lectureId: "mkt-final-revision", hours: 2, type: "revision" },
            // May 25 — Marketing EXAM
            { relativeDay: 9, courseId: "marketing", courseName: "Marketing", lectureTitle: "EXAM: Marketing & Sales", lectureId: "mkt-exam", hours: 2, type: "exam" },
        ],
    },
    // =============================================
    // PHASE 2: Statistics + Crypto + Networks (Jun 1, Jun 3, Jun 4)
    // =============================================
    {
        label: "Statistics + Crypto + Networks",
        phaseIndex: 2,
        examDate: "2026-06-01",
        phaseStartDate: "2026-05-26",
        studyItems: [
            // May 26
            { relativeDay: 10, courseId: "statistics", courseName: "Statistics", lectureTitle: "Chapters 1–2", lectureId: "stat-chapters-1-2", hours: 2, type: "learning" },
            { relativeDay: 10, courseId: "networks", courseName: "Networks", lectureTitle: "OSI + Physical Layer", lectureId: "net-osi-physical", hours: 2, type: "learning" },
            // May 27
            { relativeDay: 11, courseId: "statistics", courseName: "Statistics", lectureTitle: "Probability Distributions", lectureId: "stat-probability-distributions", hours: 2.5, type: "learning" },
            { relativeDay: 11, courseId: "networks", courseName: "Networks", lectureTitle: "Data Link Layer", lectureId: "net-data-link", hours: 2, type: "learning" },
            // May 28
            { relativeDay: 12, courseId: "statistics", courseName: "Statistics", lectureTitle: "Hypothesis Testing", lectureId: "stat-hypothesis-testing", hours: 2.5, type: "learning" },
            { relativeDay: 12, courseId: "cryptography", courseName: "Crypto", lectureTitle: "Intro + Classical Encryption", lectureId: "cry-intro-classical", hours: 2, type: "learning" },
            // May 29
            { relativeDay: 13, courseId: "statistics", courseName: "Statistics", lectureTitle: "Solve Problems", lectureId: "stat-solve-problems", hours: 2.5, type: "practice" },
            { relativeDay: 13, courseId: "networks", courseName: "Networks", lectureTitle: "ARQ + Routing", lectureId: "net-arq-routing", hours: 2, type: "learning" },
            // May 30 — 2 days before Stats exam
            { relativeDay: 14, courseId: "statistics", courseName: "Statistics", lectureTitle: "Previous Exams", lectureId: "stat-previous-exams", hours: 2.5, type: "practice" },
            { relativeDay: 14, courseId: "statistics", courseName: "Statistics", lectureTitle: "Intensive Solving", lectureId: "stat-intensive-solving", hours: 2, type: "practice" },
            // May 31 — 1 day before Stats exam, stats only
            { relativeDay: 15, courseId: "statistics", courseName: "Statistics", lectureTitle: "Final Revision", lectureId: "stat-final-revision", hours: 2, type: "revision" },
            { relativeDay: 15, courseId: "statistics", courseName: "Statistics", lectureTitle: "Weak Points", lectureId: "stat-weak-points", hours: 1.5, type: "revision" },
            { relativeDay: 15, courseId: "statistics", courseName: "Statistics", lectureTitle: "Formula Review", lectureId: "stat-formula-review", hours: 1.5, type: "recall" },
            // Jun 1 — Stats EXAM
            { relativeDay: 16, courseId: "statistics", courseName: "Statistics", lectureTitle: "EXAM: Statistics-2", lectureId: "stat-exam", hours: 2, type: "exam" },
            // Jun 1 post-exam
            { relativeDay: 16, courseId: "cryptography", courseName: "Crypto", lectureTitle: "Crypto Light Revision", lectureId: "cry-light-revision", hours: 1, type: "revision", isPostExam: true },
            // Jun 2 — 1 day before Crypto exam, crypto only
            { relativeDay: 17, courseId: "cryptography", courseName: "Crypto", lectureTitle: "Previous Exams", lectureId: "cry-previous-exams", hours: 1.5, type: "practice" },
            { relativeDay: 17, courseId: "cryptography", courseName: "Crypto", lectureTitle: "Algorithms Review", lectureId: "cry-algorithms-review", hours: 1.5, type: "revision" },
            { relativeDay: 17, courseId: "cryptography", courseName: "Crypto", lectureTitle: "Practice Problems", lectureId: "cry-practice-problems", hours: 1.5, type: "practice" },
            { relativeDay: 17, courseId: "cryptography", courseName: "Crypto", lectureTitle: "Final Revision", lectureId: "cry-final-revision", hours: 1.5, type: "revision" },
            // Jun 3 — Crypto EXAM
            { relativeDay: 18, courseId: "cryptography", courseName: "Crypto", lectureTitle: "EXAM: Advanced Cryptography", lectureId: "cry-exam", hours: 2, type: "exam" },
            // Jun 3 post-exam
            { relativeDay: 18, courseId: "networks", courseName: "Networks", lectureTitle: "Networks Revision", lectureId: "net-networks-revision", hours: 1, type: "revision", isPostExam: true },
            // Jun 4 — Networks EXAM
            { relativeDay: 19, courseId: "networks", courseName: "Networks", lectureTitle: "EXAM: Computer Networks-1", lectureId: "net-exam", hours: 2, type: "exam" },
            // Jun 4 post-exam
            { relativeDay: 19, courseId: "networks", courseName: "Networks", lectureTitle: "Routing", lectureId: "net-routing-post", hours: 1, type: "revision", isPostExam: true },
            { relativeDay: 19, courseId: "networks", courseName: "Networks", lectureTitle: "ARQ", lectureId: "net-arq-post", hours: 1, type: "revision", isPostExam: true },
            { relativeDay: 19, courseId: "networks", courseName: "Networks", lectureTitle: "Flow/Congestion Control", lectureId: "net-flow-control", hours: 1, type: "revision", isPostExam: true },
        ],
    },
    // =============================================
    // PHASE 3: Data Structures (Exam: June 7)
    // =============================================
    {
        label: "Data Structures Final",
        phaseIndex: 3,
        examDate: "2026-06-07",
        phaseStartDate: "2026-06-05",
        studyItems: [
            // Jun 5
            { relativeDay: 20, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Arrays", lectureId: "ds-arrays", hours: 2, type: "learning" },
            { relativeDay: 20, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Linked Lists", lectureId: "ds-linked-lists", hours: 2, type: "learning" },
            { relativeDay: 20, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Stack/Queue", lectureId: "ds-stack-queue", hours: 2, type: "learning" },
            // Jun 6
            { relativeDay: 21, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Trees", lectureId: "ds-trees", hours: 2, type: "learning" },
            { relativeDay: 21, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Graphs", lectureId: "ds-graphs", hours: 2, type: "learning" },
            { relativeDay: 21, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Previous Exams", lectureId: "ds-previous-exams", hours: 2, type: "practice" },
            { relativeDay: 21, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "Final Revision", lectureId: "ds-final-revision", hours: 1.5, type: "revision" },
            // Jun 7 — DS EXAM
            { relativeDay: 22, courseId: "datastructure", courseName: "Data Structures", lectureTitle: "EXAM: Data Structures", lectureId: "ds-exam", hours: 2, type: "exam" },
        ],
    },
    // =============================================
    // PHASE 4: Cryptography Final (Exam: June 13)
    // =============================================
    {
        label: "Cryptography Final Phase",
        phaseIndex: 4,
        examDate: "2026-06-13",
        phaseStartDate: "2026-06-08",
        studyItems: [
            // Jun 8
            { relativeDay: 23, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Classical Encryption Revision", lectureId: "cry-final-classical-revision", hours: 2, type: "revision" },
            { relativeDay: 23, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Caesar / Vigenere", lectureId: "cry-final-caesar-vigenere", hours: 1.5, type: "revision" },
            { relativeDay: 23, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Practice Problems", lectureId: "cry-final-practice-problems-1", hours: 2, type: "practice" },
            // Jun 9
            { relativeDay: 24, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "DES / AES", lectureId: "cry-final-des-aes", hours: 2, type: "revision" },
            { relativeDay: 24, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Symmetric Encryption", lectureId: "cry-final-symmetric", hours: 1.5, type: "revision" },
            { relativeDay: 24, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Solve Sheets", lectureId: "cry-final-solve-sheets", hours: 2, type: "practice" },
            // Jun 10
            { relativeDay: 25, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "RSA", lectureId: "cry-final-rsa", hours: 2, type: "revision" },
            { relativeDay: 25, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Public Key Cryptography", lectureId: "cry-final-public-key", hours: 2, type: "revision" },
            { relativeDay: 25, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Previous Exams", lectureId: "cry-final-previous-exams-1", hours: 2, type: "practice" },
            // Jun 11
            { relativeDay: 26, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Hashing", lectureId: "cry-final-hashing", hours: 1.5, type: "revision" },
            { relativeDay: 26, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Digital Signatures", lectureId: "cry-final-digital-signatures", hours: 1.5, type: "revision" },
            { relativeDay: 26, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Weak Topics Review", lectureId: "cry-final-weak-topics", hours: 2, type: "revision" },
            // Jun 12
            { relativeDay: 27, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Active Recall", lectureId: "cry-final-active-recall", hours: 1.5, type: "recall" },
            { relativeDay: 27, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Mock Exam", lectureId: "cry-final-mock-exam", hours: 2.5, type: "practice" },
            { relativeDay: 27, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Previous Exams", lectureId: "cry-final-previous-exams-2", hours: 2, type: "practice" },
            { relativeDay: 27, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Final Revision", lectureId: "cry-final-final-revision", hours: 2, type: "revision" },
            { relativeDay: 27, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "Important Notes / Summaries", lectureId: "cry-final-important-notes", hours: 1, type: "recall" },
            // Jun 13
            { relativeDay: 28, courseId: "cryptography_final", courseName: "Cryptography", lectureTitle: "EXAM: Cryptography", lectureId: "cry-final-exam", hours: 2, type: "exam" },
        ],
    },
];

/**
 * Achievement badges
 */
const ACHIEVEMENTS = [
  {
    id: "first_lecture",
    label: "First Step",
    description: "Marked your first lecture as completed",
    icon: "🎯",
  },
  {
    id: "early_bird",
    label: "Early Bird",
    description: "Started studying before the default date",
    icon: "🐦",
  },
  {
    id: "halfway",
    label: "Halfway There",
    description: "Reached 50% overall completion",
    icon: "🌟",
  },
  {
    id: "streak_3",
    label: "3-Day Streak",
    description: "Studied for 3 consecutive days",
    icon: "🔥",
  },
  {
    id: "streak_7",
    label: "Week Warrior",
    description: "Studied for 7 consecutive days",
    icon: "⚡",
  },
  {
    id: "all_exams_prepped",
    label: "All Prepped",
    description: "All lectures marked as prepared",
    icon: "🏆",
  },
  {
    id: "speed_demon",
    label: "Speed Demon",
    description: "Completed 5 lectures in one day",
    icon: "🚀",
  },
  {
    id: "night_owl",
    label: "Night Owl",
    description: "Studied after 10 PM",
    icon: "🦉",
  },
];
