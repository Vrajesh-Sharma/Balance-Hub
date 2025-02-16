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
      content: "Balance Hub has completely transformed how I manage my work-life balance. The insights are invaluable!",
      image: "https://i.pinimg.com/736x/fe/1a/2e/fe1a2e4d4acb5670119f3ec052f877dd.jpg"
    },
    {
      name: "Yug Limbachiya",
      role: "UI/UX Designer",
      content: "Achieving balance felt impossible until I found Balance Hub. Now, I feel more in control and energized!",
      image: "https://i.pinimg.com/736x/31/72/db/3172db5b899b0993c6077d76cd20e1df.jpg"
    },
    {
      name: "Parth Bhutaiya",
      role: "Data Scientist",
      content: "Balance Hub provides practical strategies that actually work. My work-life harmony has never been better!",
      image: "https://i.pinimg.com/736x/fc/ef/30/fcef306368649b257431d9538b1566e2.jpg"
    },
    {
      name: "Utsav Ratpiya",
      role: "Product Manager",
      content: "Finally, a platform that understands the importance of both career growth and personal well-being.",
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