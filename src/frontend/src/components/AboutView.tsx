import { ArrowLeft, Calendar, ImageIcon, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutViewProps {
  onBack: () => void;
}

export default function AboutView({ onBack }: AboutViewProps) {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About physiq
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personal body transformation tracker
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                What is physiq?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                physiq is a comprehensive body tracking application designed to help you monitor and visualize your fitness journey over time. Whether you're building muscle, losing weight, or maintaining your physique, physiq gives you the tools to track your progress with precision.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Track Body Variances Between Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Capture progress photos and measurements on any date. physiq automatically calculates the time variance between entries, showing you exactly how many days have passed between each checkpoint. This makes it easy to see how your body changes over specific time periods.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Compare Images Between Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                View your transformation with powerful side-by-side and overlay comparison tools. Compare any two dates to see visual changes in your physique. The app highlights Day 1, Day 30, and Day 90 milestones, making it easy to track your progress at key intervals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Navigate Entries by Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Use the interactive calendar to quickly jump to any date with recorded data. Visual indicators show which days have photos, measurements, or workout logs. Swipe through your timeline to review your journey day by day, with easy navigation between entries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Progress Photos:</strong> Capture and store unlimited progress photos with timestamps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Body Measurements:</strong> Track weight, chest, waist, and hip measurements over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Workout Logging:</strong> Record your training sessions with muscle groups and duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Analytics Dashboard:</strong> Visualize trends with charts and statistics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Date Variance Tracking:</strong> See exactly how many days between any two entries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong className="text-foreground">Secure & Private:</strong> Your data is stored securely on the Internet Computer blockchain</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-primary/20">
            <CardHeader>
              <CardTitle>Start Your Journey</CardTitle>
              <CardDescription>
                Track your progress, compare your transformation, and achieve your fitness goals with physiq.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onBack} className="w-full sm:w-auto">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
