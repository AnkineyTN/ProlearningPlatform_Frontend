import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import LogoFG from '@/assets/logo_fg';
import LanguageToggle from '@/components/language/language-toggle';
import ModeToggle from '@/components/theme/mode-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] overflow-hidden',
        className,
      )}
    >
      {children}
    </section>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <BookOpen size={18} />,
      title: t('landing.features.interactiveCourses.title'),
      description: t('landing.features.interactiveCourses.description'),
    },
    {
      icon: <Users size={18} />,
      title: t('landing.features.communityLearning.title'),
      description: t('landing.features.communityLearning.description'),
    },
    {
      icon: <Award size={18} />,
      title: t('landing.features.certifiedPrograms.title'),
      description: t('landing.features.certifiedPrograms.description'),
    },
    {
      icon: <Zap size={18} />,
      title: t('landing.features.fastTrackLearning.title'),
      description: t('landing.features.fastTrackLearning.description'),
    },
  ];

  const stats = [
    { number: '50K+', label: t('landing.stats.activeStudents') },
    { number: '500+', label: t('landing.stats.expertInstructors') },
    { number: '1000+', label: t('landing.stats.qualityCourses') },
    { number: '95%', label: t('landing.stats.successRate') },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      content: t('landing.testimonials.sarah.content'),
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      content: t('landing.testimonials.michael.content'),
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      content: t('landing.testimonials.emily.content'),
      rating: 5,
    },
  ];

  return (
    <div className='min-h-screen bg-[var(--pl-bg)] text-[var(--pl-text)]'>
      {/* Navigation */}
      <nav className='fixed top-0 w-full z-50 backdrop-blur-md bg-[var(--pl-bg)]/80 border-b border-[var(--pl-border)]'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div
              className='flex items-center gap-2 cursor-pointer'
              onClick={() => (window.location.href = '/')}
            >
              <div className='w-8 h-8 grid place-items-center'>
                <LogoFG />
              </div>
              <span
                className='text-[18px] tracking-[-0.015em] font-semibold text-[var(--pl-text)]'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ProLearning
              </span>
            </div>

            <div className='hidden md:flex items-center gap-7'>
              {[
                { href: '#features', label: t('landing.title.features') },
                { href: '#plans', label: t('landing.title.plans') },
                { href: '#about', label: t('landing.title.about') },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className='text-[13px] font-medium text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] transition-colors'
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className='hidden md:flex items-center gap-3'>
              <button
                onClick={() => (window.location.href = '/login')}
                className='px-4 py-2 rounded-full text-[13px] font-medium text-[var(--pl-text)] bg-transparent border border-[var(--pl-border-strong)] hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
              >
                {t('landing.login')}
              </button>
              <button
                onClick={() => (window.location.href = '/signup')}
                className='px-4 py-2 rounded-full text-[13px] font-semibold bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90 transition-opacity cursor-pointer'
              >
                {t('landing.signUp')}
              </button>
              <div className='flex items-center gap-2 pl-2 ml-1 border-l border-[var(--pl-border)]'>
                <NotificationBell />
                <ModeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className='pt-36 pb-20 px-6'>
        <div className='max-w-5xl mx-auto text-center'>
          <div className='inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)]'>
            <span className='text-[10px] tracking-[0.16em] uppercase font-semibold text-[var(--pl-accent-strong)]'>
              {t('landing.intro.header')}
            </span>
          </div>

          <h1
            className='text-[56px] md:text-[72px] leading-[1.02] tracking-[-0.025em] m-0 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('landing.intro.subheader')}
            <br />
            <span className='text-[var(--pl-accent-strong)]'>
              {t('landing.intro.platform')}
            </span>
          </h1>

          <p
            className='mt-6 text-[19px] italic max-w-2xl mx-auto text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('landing.intro.description')}
          </p>

          <div className='flex flex-wrap items-center justify-center gap-4 mt-10'>
            <button
              onClick={() => (window.location.href = '/login')}
              className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold bg-[var(--pl-text)] text-[var(--pl-bg)] hover:opacity-90 transition-opacity cursor-pointer'
            >
              {t('landing.getStarted')}
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => (window.location.href = '/videodemo')}
              className='inline-flex items-center gap-2 px-6 py-3 rounded-full text-[14px] font-semibold border border-[var(--pl-border-strong)] bg-transparent text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
            >
              {t('landing.watchDemo')}
            </button>
          </div>

          {/* Stats strip */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-[14px] mt-16'>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] px-5 py-5 text-left'
              >
                <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-3'>
                  {stat.label}
                </div>
                <div className='text-[34px] font-semibold tracking-[-0.03em] leading-none text-[var(--pl-text)]'>
                  {stat.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id='features' className='py-20 px-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <div className='text-[10px] tracking-[0.18em] uppercase mb-3 text-[var(--pl-text-faint)]'>
              {t('landing.title.features')}
            </div>
            <h2
              className='text-[40px] md:text-[44px] tracking-[-0.02em] leading-[1.05] m-0 text-[var(--pl-text)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('landing.whyChooseUs')}
            </h2>
            <p
              className='mt-4 text-[16px] italic max-w-2xl mx-auto text-[var(--pl-text-muted)]'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('landing.whyChooseUsDescription')}
            </p>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-[14px]'>
            {features.map((feature) => (
              <Panel
                key={feature.title}
                className='px-5 pt-[18px] pb-5 transition-colors hover:border-[var(--pl-accent-border)] cursor-default'
              >
                <div className='w-10 h-10 rounded-[10px] grid place-items-center bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] mb-4'>
                  {feature.icon}
                </div>
                <h3 className='text-[15px] font-semibold tracking-[-0.01em] text-[var(--pl-text)] m-0 mb-2'>
                  {feature.title}
                </h3>
                <p className='text-[13px] leading-[1.55] text-[var(--pl-text-muted)] m-0'>
                  {feature.description}
                </p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20 px-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <div className='text-[10px] tracking-[0.18em] uppercase mb-3 text-[var(--pl-text-faint)]'>
              {t('landing.title.testimonials')}
            </div>
            <h2
              className='text-[40px] md:text-[44px] tracking-[-0.02em] leading-[1.05] m-0 text-[var(--pl-text)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('landing.title.testimonials')}
            </h2>
          </div>

          <div className='grid md:grid-cols-3 gap-[14px]'>
            {testimonials.map((testimonial) => (
              <Panel key={testimonial.name} className='px-6 pt-[18px] pb-5'>
                <div className='flex gap-1 mb-4'>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className='fill-[var(--pl-accent)] text-[var(--pl-accent)]'
                    />
                  ))}
                </div>
                <p
                  className='text-[15px] italic leading-[1.55] m-0 mb-5 text-[var(--pl-text)]'
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className='text-[13.5px] font-semibold text-[var(--pl-text)]'>
                    {testimonial.name}
                  </div>
                  <div className='text-[12px] text-[var(--pl-text-faint)] mt-0.5'>
                    {testimonial.role}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 px-6'>
        <div className='max-w-4xl mx-auto'>
          <Panel className='px-10 py-14 text-center'>
            <div className='text-[10px] tracking-[0.18em] uppercase mb-3 text-[var(--pl-text-faint)]'>
              {t('landing.cta.title')}
            </div>
            <h2
              className='text-[40px] md:text-[48px] tracking-[-0.02em] leading-[1.05] m-0 text-[var(--pl-text)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('landing.cta.title')}
            </h2>
            <p
              className='mt-4 text-[17px] italic max-w-2xl mx-auto text-[var(--pl-text-muted)]'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {t('landing.cta.description')}
            </p>
            <button
              onClick={() => (window.location.href = '/signup')}
              className='inline-flex items-center gap-2 mt-8 px-7 py-3 rounded-full text-[14px] font-semibold bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90 transition-opacity cursor-pointer'
            >
              {t('landing.cta.buttonText')}
              <CheckCircle size={16} />
            </button>
          </Panel>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-[var(--pl-border)] py-12 px-6'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-8 h-8 grid place-items-center'>
                  <LogoFG />
                </div>
                <span
                  className='text-[16px] font-semibold tracking-[-0.015em] text-[var(--pl-text)]'
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  ProLearning
                </span>
              </div>
              <p className='text-[13px] leading-[1.55] text-[var(--pl-text-muted)] m-0'>
                {t('landing.footer.description')}
              </p>
            </div>

            {[
              {
                heading: t('landing.footer.product'),
                items: [
                  t('landing.footer.features'),
                  t('landing.footer.pricing'),
                  t('landing.footer.courses'),
                ],
              },
              {
                heading: t('landing.footer.company'),
                items: [
                  t('landing.footer.about'),
                  t('landing.footer.careers'),
                  t('landing.footer.contact'),
                ],
              },
              {
                heading: t('landing.footer.legal'),
                items: [
                  t('landing.footer.privacy'),
                  t('landing.footer.terms'),
                  t('landing.footer.security'),
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <div className='text-[10px] tracking-[0.16em] uppercase mb-4 text-[var(--pl-text-faint)]'>
                  {col.heading}
                </div>
                <ul className='list-none m-0 p-0 space-y-2'>
                  {col.items.map((item) => (
                    <li key={item}>
                      <a
                        href='#'
                        className='text-[13px] text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] transition-colors'
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className='border-t border-[var(--pl-border)] mt-10 pt-6 text-center text-[12px] text-[var(--pl-text-faint)]'>
            © 2025 ProLearning. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
