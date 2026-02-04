import { useState } from 'react';
import { Calendar, TrendingUp, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalendarView from './CalendarView';
import AnalyticsView from './AnalyticsView';
import ProfileView from './ProfileView';
import AboutView from './AboutView';

export default function MainLayout() {
  const [activeView, setActiveView] = useState<'calendar' | 'analytics' | 'profile' | 'about'>('calendar');
  const [previousView, setPreviousView] = useState<'calendar' | 'analytics' | 'profile'>('calendar');

  const handleViewChange = (view: 'calendar' | 'analytics' | 'profile' | 'about') => {
    if (view === 'about') {
      // Store the current view before switching to about
      if (activeView !== 'about') {
        setPreviousView(activeView as 'calendar' | 'analytics' | 'profile');
      }
    }
    setActiveView(view);
  };

  const handleBackFromAbout = () => {
    setActiveView(previousView);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              physiq
            </h1>
          </div>

          <nav className="flex gap-2">
            <Button
              variant={activeView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('calendar')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
            <Button
              variant={activeView === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('analytics')}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button
              variant={activeView === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('profile')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button
              variant={activeView === 'about' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('about')}
              className="gap-2"
              aria-label="About"
            >
              <Info className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'about' && <AboutView onBack={handleBackFromAbout} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
