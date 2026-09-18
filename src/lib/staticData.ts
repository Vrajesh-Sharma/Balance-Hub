// Home Page Data
export const homePageData = {
  hero: {
    title: "Plan your day. Track your balance. Feel better.",
    subtitle: "Balance Hub brings your schedule, habits, stress tools, and goals into one place — so you can see where your time goes and make intentional changes.",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
  },
  features: [
    {
      icon: "BarChart2",
      title: "Balance Tracking",
      description: "Visualize how you spend time across work, personal, exercise, and hobbies. Spot imbalances at a glance.",
    },
    {
      icon: "Calendar",
      title: "Habit Planner",
      description: "Build routines that stick. Schedule habits, set reminders, and track consistency over weeks and months.",
    },
    {
      icon: "Brain",
      title: "Stress Hub",
      description: "Breathing exercises, quick meditations, and grounding techniques — available whenever you need them.",
    },
    {
      icon: "Target",
      title: "Goal Setting",
      description: "Set measurable goals, break them into milestones, and track progress without the overwhelm.",
    }
  ],
  capabilities: [
    {
      icon: "BookOpen",
      title: "Journal",
      description: "Reflect daily with guided prompts. Tag entries by category and mood to spot patterns over time.",
    },
    {
      icon: "Gamepad2",
      title: "Balance Game",
      description: "A lightweight way to plan your day: allocate energy to tasks and see the trade-offs visually.",
    },
    {
      icon: "Library",
      title: "Resources",
      description: "Curated articles and tools on time management, stress reduction, and sustainable productivity.",
    },
    {
      icon: "Timer",
      title: "Work Time Tracker",
      description: "Log work sessions, breaks, and overtime. Export reports for yourself or your team.",
    },
    {
      icon: "Brain",
      title: "Smart Scheduler",
      description: "Get schedule suggestions based on your energy patterns, priorities, and existing commitments.",
    },
    {
      icon: "Target",
      title: "Goals Dashboard",
      description: "View all goals in one place. Filter by category, timeline, or progress. Adjust without starting over.",
    }
  ],
  testimonials: [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content: "Finally a tool that doesn't try to gamify my life. I just want to see where my time goes and make better choices. Balance Hub does that.",
      image: "https://i.pinimg.com/736x/fe/1a/2e/fe1a2e4d4acb5670119f3ec052f877dd.jpg"
    },
    {
      name: "Marcus Webb",
      role: "Product Designer",
      content: "The habit planner is the only one I've stuck with past two weeks. The weekly view helps me see progress without obsessing over streaks.",
      image: "https://i.pinimg.com/736x/31/72/db/3172db5b899b0993c6077d76cd20e1df.jpg"
    },
    {
      name: "Priya Nair",
      role: "Data Analyst",
      content: "I use the stress hub breathing exercises between meetings. It's simple, no fluff, and actually helps me reset.",
      image: "https://i.pinimg.com/736x/fc/ef/30/fcef306368649b257431d9538b1566e2.jpg"
    },
    {
      name: "James Okafor",
      role: "Engineering Manager",
      content: "Our team uses the work time tracker to keep meetings honest. It's changed how we plan sprints.",
      image: "https://i.pinimg.com/736x/51/6c/29/516c29cf8a2f7c70751649186565d400.jpg"
    }
  ]
};

// Balance Tracker Data
export const balanceTrackerData = {
  activityTypes: [
    { value: "work", label: "Work" },
    { value: "personal", label: "Personal" },
    { value: "exercise", label: "Exercise" },
    { value: "hobbies", label: "Hobbies" }
  ],
  colors: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]
};

// Goals Data
export const goalsData = {
  categories: [
    { value: "work", label: "Work" },
    { value: "personal", label: "Personal" },
    { value: "exercise", label: "Exercise" },
    { value: "learning", label: "Learning" }
  ]
};

// Habit Planner Data
export const habitPlannerData = {
  templates: [
    {
      name: "Morning Routine",
      schedule: [
        { time: "06:00", activity: "Morning Workout" },
        { time: "07:00", activity: "Breakfast & Planning" },
        { time: "08:00", activity: "Deep Work Session" }
      ]
    },
    {
      name: "Focus Day",
      schedule: [
        { time: "09:00", activity: "Team Meeting" },
        { time: "10:00", activity: "Project Work" },
        { time: "14:00", activity: "Learning Session" }
      ]
    },
    {
      name: "Balanced Day",
      schedule: [
        { time: "08:00", activity: "Exercise" },
        { time: "10:00", activity: "Work Block" },
        { time: "15:00", activity: "Personal Time" }
      ]
    }
  ]
};

// Stress Hub Data
export const stressHubData = {
  breathingPatterns: [
    {
      name: "4-7-8 Breathing",
      description: "Inhale for 4, hold for 7, exhale for 8",
      inhale: 4,
      hold: 7,
      exhale: 8
    },
    {
      name: "Box Breathing",
      description: "Equal duration for inhale, hold, exhale, and hold",
      inhale: 4,
      hold: 4,
      exhale: 4
    }
  ],
  quickTips: [
    {
      title: "Take a Walk",
      description: "A 10-minute walk can help clear your mind and reduce stress levels.",
      icon: "Wind"
    },
    {
      title: "Deep Breathing",
      description: "Practice deep breathing exercises to activate your relaxation response.",
      icon: "Brain"
    },
    {
      title: "Mindful Moment",
      description: "Take a moment to focus on your senses and ground yourself.",
      icon: "Heart"
    }
  ],
  meditationVideo: "https://www.youtube.com/embed/ZToicYcHIOU"
};

// Journal Page Data
export const journalData = {
  categories: [
    { id: 'work', label: 'Work' },
    { id: 'personal', label: 'Personal' },
    { id: 'health', label: 'Health & Wellness' },
    { id: 'goals', label: 'Goals & Achievements' }
  ],
  moods: [
    { id: 'productive', label: 'Productive' },
    { id: 'happy', label: 'Happy' },
    { id: 'neutral', label: 'Neutral' },
    { id: 'stressed', label: 'Stressed' },
    { id: 'tired', label: 'Tired' }
  ],
  prompts: [
    { 
      id: 1, 
      category: 'Work',
      question: 'What was your biggest achievement at work today?' 
    },
    { 
      id: 2, 
      category: 'Personal',
      question: 'How did you maintain work-life balance today?' 
    },
    { 
      id: 3, 
      category: 'Health & Wellness',
      question: 'What steps did you take today to maintain your physical and mental well-being?' 
    },
    { 
      id: 4, 
      category: 'Goals & Achievements',
      question: 'What progress did you make towards your personal or professional goals?' 
    },
    { 
      id: 5, 
      category: 'Daily Reflection',
      question: "What are three things you're grateful for today?"
    }
  ]
};

// Game Data
export const gameData = {
  tasks: [
    {
      id: 1,
      name: "Work Project",
      energyCost: 30,
      reward: 50,
      time: 2
    },
    {
      id: 2,
      name: "Exercise",
      energyCost: 20,
      reward: 30,
      time: 1
    },
    {
      id: 3,
      name: "Family Time",
      energyCost: 10,
      reward: 40,
      time: 2
    }
  ],
  initialCharacter: {
    energy: 100,
    health: 100,
    happiness: 100
  },
  gameTimeRange: {
    start: 9,
    end: 17
  }
};

// Resources Data
export const resourcesData = {
  articles: [
    {
      id: 1,
      title: "Understanding Work-Life Balance",
      category: "Guide",
      readTime: "5 min",
      link: "#"
    },
    {
      id: 2,
      title: "10 Tips for Better Time Management",
      category: "Tips",
      readTime: "8 min",
      link: "#"
    },
    {
      id: 3,
      title: "Managing Workplace Stress",
      category: "Mental Health",
      readTime: "6 min",
      link: "#"
    }
  ],
  tools: [
    {
      id: 1,
      title: "Pomodoro Timer",
      description: "Stay focused with timed work sessions",
      link: "#"
    },
    {
      id: 2,
      title: "Meditation Guide",
      description: "Simple meditation exercises for stress relief",
      link: "#"
    }
  ]
};