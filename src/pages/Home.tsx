import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  Calendar, 
  Brain,
  Target
} from 'lucide-react';
import { homePageData } from '../lib/staticData';

const iconMap = {
  BarChart2,
  Calendar,
  Brain,
  Target
};

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/ask-ai');
  };

  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {homePageData.hero.title}
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          {homePageData.hero.subtitle}
        </p>
        <motion.img
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl"
          src={homePageData.hero.image}
          alt="Work-life balance visualization"
        />
      </motion.section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        {homePageData.features.map((feature, index) => {
          const Icon = iconMap[feature.icon as keyof typeof iconMap];
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <Icon className="h-12 w-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          );
        })}
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {homePageData.testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-300">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center bg-gradient-to-r from-cyan-900 to-blue-900 p-12 rounded-xl"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of others who have already improved their work-life balance.
        </p>
        <button 
          onClick={handleGetStarted}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-bold transition-colors transform hover:scale-105 duration-200 flex items-center justify-center gap-2 mx-auto"
        >
          <Brain className="h-5 w-5" />
          Get Started Now
        </button>
      </motion.section>
    </div>
  );
}