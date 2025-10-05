import React, { useState } from 'react';
import { BookOpen, Users, Award, Zap, CheckCircle, Star, ArrowRight } from 'lucide-react';
import LogoBG from '@/assets/logo_bg';
import LogoFG from '@/assets/logo_fg';

export default function ProLearningLanding() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Interactive Courses",
      description: "Engage with dynamic content designed by industry experts"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Learning",
      description: "Connect with thousands of learners worldwide"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certified Programs",
      description: "Earn recognized certifications upon completion"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast Track Learning",
      description: "Learn at your own pace with adaptive technology"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students" },
    { number: "500+", label: "Expert Instructors" },
    { number: "1000+", label: "Quality Courses" },
    { number: "95%", label: "Success Rate" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      content: "ProLearning transformed my career. The courses are practical and well-structured.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      content: "Best investment in my education. The instructors are top-notch!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      content: "I love the flexibility and the quality of content. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <LogoFG />
              </div>
              <span className="text-xl font-bol">ProLearning</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Our features</a>
              <a href="#plans" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Plans</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About us</a>
            </div>

            <button 
                onClick={() => window.location.href = '/signup'} 
                className="cursor-pointer bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
              Create an account
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                🎓 Transform Your Future Today
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
              THE BEST LEARNING<br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PLATFORM FOR YOU!
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Master new skills, advance your career, and achieve your goals with expert-led courses and personalized learning paths.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => window.location.href = '/login'} className="cursor-pointer bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2">
                GET STARTED!
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => window.location.href = '/videodemo'} className="cursor-pointer bg-white text-gray-900 px-8 py-4 rounded-full hover:bg-gray-50 transition-all font-semibold text-lg shadow-lg border-2 border-gray-200">
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Why Choose ProLearning?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience learning like never before with our cutting-edge platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveFeature(index)}
                className={`p-8 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl transform scale-105'
                    : 'bg-gray-50 text-gray-900 hover:shadow-lg'
                }`}
              >
                <div className={`mb-4 ${activeFeature === index ? 'text-white' : 'text-blue-600'}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className={activeFeature === index ? 'text-blue-100' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Loved by Students Worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100">
            Join thousands of learners who are already transforming their careers
          </p>
          <button className="bg-white text-blue-600 px-10 py-4 rounded-full hover:bg-gray-100 transition-all font-bold text-lg shadow-2xl transform hover:scale-105 flex items-center gap-2 mx-auto">
            Get Started Free
            <CheckCircle className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <LogoFG />
                </div>
                <span className="text-xl font-bold text-white">ProLearning</span>
              </div>
              <p className="text-gray-400">Empowering learners worldwide with quality education.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ProLearning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}