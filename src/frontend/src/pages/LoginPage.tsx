import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { TrendingUp, Camera, BarChart3, User } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Branding & Features */}
            <div className="flex flex-col justify-center">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Body Tracker
                </h1>
              </div>

              <h2 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                Track Your Fitness Journey
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Capture daily progress photos, log your workouts, and visualize your transformation with powerful analytics.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                    <Camera className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Daily Photo Journal</h3>
                    <p className="text-sm text-muted-foreground">
                      Capture and compare your progress with before/after photos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualize trends with interactive charts and heatmaps
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                    <User className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Personal & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is secure and only accessible by you
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-card-foreground">Get Started</h3>
                  <p className="text-muted-foreground">
                    Sign in securely to start tracking your progress
                  </p>
                </div>

                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" />
                      Sign In
                    </>
                  )}
                </Button>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Secure authentication powered by Internet Identity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025. Built with ❤️ using{' '}
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
