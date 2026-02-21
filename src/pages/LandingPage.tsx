import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import LogoFG from "@/assets/logo_fg";
import { LanguageToggle } from "@/components/language/language-toggle";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const { t } = useTranslation();

  const features = [
    {
      icon: <BookOpen className='w-8 h-8' />,
      title: t("landing.features.interactiveCourses.title"),
      description: t("landing.features.interactiveCourses.description"),
    },
    {
      icon: <Users className='w-8 h-8' />,
      title: t("landing.features.communityLearning.title"),
      description: t("landing.features.communityLearning.description"),
    },
    {
      icon: <Award className='w-8 h-8' />,
      title: t("landing.features.certifiedPrograms.title"),
      description: t("landing.features.certifiedPrograms.description"),
    },
    {
      icon: <Zap className='w-8 h-8' />,
      title: t("landing.features.fastTrackLearning.title"),
      description: t("landing.features.fastTrackLearning.description"),
    },
  ];

  const stats = [
    { number: "50K+", label: t("landing.stats.activeStudents") },
    { number: "500+", label: t("landing.stats.expertInstructors") },
    { number: "1000+", label: t("landing.stats.qualityCourses") },
    { number: "95%", label: t("landing.stats.successRate") },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Developer",
      content: t("landing.testimonials.sarah.content"),
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      content: t("landing.testimonials.michael.content"),
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "UX Designer",
      content: t("landing.testimonials.emily.content"),
      rating: 5,
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <nav className='fixed top-0 w-full backdrop-blur-md shadow-sm z-50'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div
              className='flex items-center space-x-2 cursor-pointer'
              onClick={() => (window.location.href = "/")}
            >
              <div className='w-8 h-8 flex items-center justify-center'>
                <LogoFG />
              </div>
              <span className='text-xl font-bol'>ProLearning</span>
            </div>

            <div className='hidden md:flex items-center space-x-8'>
              <a
                href='#features'
                className='text-muted-foreground hover:text-violet-500 transition-colors font-medium'
              >
                {t("landing.title.features")}
              </a>
              <a
                href='#plans'
                className='text-muted-foreground hover:text-violet-500 transition-colors font-medium'
              >
                {t("landing.title.plans")}
              </a>
              <a
                href='#about'
                className='text-muted-foreground hover:text-violet-500 transition-colors font-medium'
              >
                {t("landing.title.about")}
              </a>
            </div>

            <div className='hidden md:flex items-center space-x-4'>
              <Button
                variant='outline'
                onClick={() => (window.location.href = "/login")}
                className='cursor-pointer px-6 py-2.5 rounded-full transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                {t("landing.login")}
              </Button>
              <Button
                variant='default'
                onClick={() => (window.location.href = "/signup")}
                className='cursor-pointer px-6 py-2.5 rounded-full transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                {t("landing.signUp")}
              </Button>
              <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
                <div className='flex w-full justify-between px-4 gap-4'>
                  <ModeToggle />
                  <LanguageToggle />
                </div>
              </header>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='pt-32 pb-20 px-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center space-y-8'>
            <div className='inline-block'>
              <span className='px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold'>
                🎓 {t("landing.intro.header")}
              </span>
            </div>

            <h1 className='text-6xl md:text-7xl font-bold text-popover-foreground leading-tight'>
              {t("landing.intro.subheader")}
              <br />
              <span className='bg-gradient-to-r from-pink-500 via-purple-600 to-violet-600 bg-clip-text text-transparent'>
                {t("landing.intro.platform")}
              </span>
            </h1>

            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              {t("landing.intro.description")}
            </p>

            <div className='flex items-center justify-center gap-8 pt-4'>
              <button
                onClick={() => (window.location.href = "/login")}
                className='cursor-pointer bg-foreground hover:bg-card-hovered text-background px-8 py-4 rounded-full transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2'
              >
                {t("landing.getStarted")}
                <ArrowRight className='w-5 h-5' />
              </button>
              <button
                onClick={() => (window.location.href = "/videodemo")}
                className='cursor-pointer bg-gradient-to-br from-pink-500 via-purple-600 to-violet-600 hover:scale-105 text-foreground px-8 py-4 rounded-full transition-all font-semibold text-lg shadow-lg'
              >
                {t("landing.watchDemo")}
              </button>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-8 pt-16'>
              {stats.map((stat, index) => (
                <div key={index} className='space-y-2'>
                  <div className='text-4xl font-bold text-foreground'>
                    {stat.number}
                  </div>
                  <div className='text-muted-foreground font-medium'>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 bg-card'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center space-y-4 mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-foreground'>
              {t("landing.whyChooseUs")}
            </h2>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              {t("landing.whyChooseUsDescription")}
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(-1)}
                className={`p-8 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeFeature === index
                    ? "bg-gradient-to-br from-pink-500 via-purple-600 to-violet-600 text-white shadow-2xl transform scale-105"
                    : "bg-background hover:shadow-lg"
                }`}
              >
                <div
                  className={`mb-4 ${activeFeature === index ? "text-white" : "text-blue-600"}`}
                >
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold mb-3'>{feature.title}</h3>
                <p
                  className={
                    activeFeature === index
                      ? "text-violet-100"
                      : "text-gray-600"
                  }
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='text-center space-y-4 mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold text-foreground'>
              {t("landing.title.testimonials")}
            </h2>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className='bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all'
              >
                <div className='flex gap-1 mb-4'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-5 h-5 fill-yellow-400 text-yellow-400'
                    />
                  ))}
                </div>
                <p className='text-gray-700 mb-6 italic'>
                  "{testimonial.content}"
                </p>
                <div>
                  <div className='font-bold text-gray-900'>
                    {testimonial.name}
                  </div>
                  <div className='text-gray-600 text-sm'>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-violet-600'>
        <div className='max-w-4xl mx-auto px-6 text-center space-y-8'>
          <h2 className='text-4xl md:text-5xl font-bold text-white'>
            {t("landing.cta.title")}
          </h2>
          <p className='text-xl text-blue-100'>
            {t("landing.cta.description")}
          </p>
          <button
            onClick={() => (window.location.href = "/signup")}
            className='bg-white cursor-pointer text-violet-600 px-10 py-4 rounded-full hover:bg-gray-100 transition-all font-bold text-lg shadow-2xl transform hover:scale-105 flex items-center gap-2 mx-auto'
          >
            {t("landing.cta.buttonText")}
            <CheckCircle className='w-6 h-6' />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className='text-muted-foreground py-12'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <div className='w-8 h-8 rounded-lg flex items-center justify-center'>
                  <LogoFG />
                </div>
                <span className='text-xl font-bold text-foreground'>
                  ProLearning
                </span>
              </div>
              <p className='text-muted-foreground'>
                {t("landing.footer.description")}
              </p>
            </div>

            <div>
              <h4 className='font-bold text-foreground mb-4'>
                {t("landing.footer.product")}
              </h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.features")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.pricing")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.courses")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold text-foreground mb-4'>
                {t("landing.footer.company")}
              </h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.about")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.careers")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.contact")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-bold text-foreground mb-4'>
                {t("landing.footer.legal")}
              </h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.terms")}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    {t("landing.footer.security")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-muted-foreground mt-8 pt-8 text-center text-muted-foreground'>
            <p>© 2025 ProLearning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
