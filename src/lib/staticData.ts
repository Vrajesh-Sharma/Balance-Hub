// Home Page Data
export const homePageData = {
  hero: {
    title: "Master Your Work-Life Balance",
    subtitle: "Take control of your time and well-being with our all-in-one platform for tracking, planning, and improving your work-life balance.",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
  },
  features: [
    {
      icon: "BarChart2",
      title: "Balance Tracking",
      description: "Track and visualize your work-life balance with intuitive charts and insights."
    },
    {
      icon: "Calendar",
      title: "Smart Planning",
      description: "Plan your day with intelligent scheduling that prioritizes both work and personal time."
    },
    {
      icon: "Brain",
      title: "Stress Management",
      description: "Access tools and techniques to reduce stress and maintain mental wellness."
    },
    {
      icon: "Target",
      title: "Goal Setting",
      description: "Set and track personal and professional goals with our smart goal-tracking system."
    }
  ],
  testimonials: [
    {
      name: "Vrajesh Sharma",
      role: "AI Engineer",
      content: "This platform has completely transformed how I manage my work-life balance. The insights are invaluable!",
      image: "src/assets/IMG_20240628_121552924~2.jpg"
    },
    {
      name: "Vrajesh Sharma",
      role: "AI Engineer",
      content: "This platform has completely transformed how I manage my work-life balance. The insights are invaluable!",
      image: "src/assets/IMG_20240628_121552924~2.jpg"
    },
    {
      name: "Vrajesh Sharma",
      role: "AI Engineer",
      content: "This platform has completely transformed how I manage my work-life balance. The insights are invaluable!",
      image: "src/assets/IMG_20240628_121552924~2.jpg"
    },
    {
      name: "Vrajesh Sharma",
      role: "AI Engineer",
      content: "This platform has completely transformed how I manage my work-life balance. The insights are invaluable!",
      image: "src/assets/IMG_20240628_121552924~2.jpg"
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
  prompts: [
    {
      id: 1,
      question: "What were your main achievements today?",
      category: "Accomplishments"
    },
    {
      id: 2,
      question: "How did you maintain work-life balance today?",
      category: "Balance"
    },
    {
      id: 3,
      question: "What challenges did you face and how did you overcome them?",
      category: "Challenges"
    },
    {
      id: 4,
      question: "What are you grateful for today?",
      category: "Gratitude"
    },
    {
      id: 5,
      question: "What could you improve tomorrow?",
      category: "Growth"
    }
  ],
  categories: [
    { id: "work", label: "Work", color: "blue" },
    { id: "personal", label: "Personal", color: "green" },
    { id: "health", label: "Health", color: "red" },
    { id: "relationships", label: "Relationships", color: "purple" }
  ],
  moods: [
    { id: "productive", label: "Productive", icon: "Zap" },
    { id: "happy", label: "Happy", icon: "Smile" },
    { id: "neutral", label: "Neutral", icon: "Meh" },
    { id: "stressed", label: "Stressed", icon: "Frown" },
    { id: "tired", label: "Tired", icon: "Battery" }
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