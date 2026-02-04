import { Card } from '@/components/ui/card';
import { useGetWeightEntries, useGetWorkoutEntries, useGetCallerUserProfile } from '../hooks/useQueries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity, Calendar } from 'lucide-react';
import { Variant_kg_lbs } from '../backend';

export default function AnalyticsView() {
  const { data: weightEntries = [] } = useGetWeightEntries();
  const { data: workoutEntries = [] } = useGetWorkoutEntries();
  const { data: userProfile } = useGetCallerUserProfile();

  const weightUnit = userProfile?.units.weight === Variant_kg_lbs.kg ? 'kg' : 'lbs';

  // Prepare weight chart data
  const weightChartData = weightEntries.map((entry) => ({
    date: new Date(Number(entry.date) / 1000000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    weight: entry.value,
  }));

  // Calculate rolling averages
  const calculateRollingAverage = (data: number[], window: number) => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = data.slice(start, i + 1);
      const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      result.push(avg);
    }
    return result;
  };

  const weights = weightEntries.map((e) => e.value);
  const avg7 = calculateRollingAverage(weights, 7);
  const avg30 = calculateRollingAverage(weights, 30);

  const rollingAverageData = weightEntries.map((entry, index) => ({
    date: new Date(Number(entry.date) / 1000000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    actual: entry.value,
    '7-day': avg7[index],
    '30-day': avg30[index],
  }));

  // Prepare workout heatmap data
  const workoutsByDate = new Map<string, number>();
  workoutEntries.forEach((workout) => {
    const dateStr = new Date(Number(workout.date) / 1000000).toDateString();
    workoutsByDate.set(dateStr, (workoutsByDate.get(dateStr) || 0) + 1);
  });

  // Generate last 90 days for heatmap
  const heatmapData: { date: Date; count: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const count = workoutsByDate.get(date.toDateString()) || 0;
    heatmapData.push({ date, count });
  }

  const maxWorkouts = Math.max(...heatmapData.map((d) => d.count), 1);

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-3xl font-bold text-foreground">Analytics & Trends</h2>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Weigh-ins</p>
                <p className="text-2xl font-bold">{weightEntries.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold">{workoutEntries.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {
                    workoutEntries.filter((w) => {
                      const date = new Date(Number(w.date) / 1000000);
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weight Chart */}
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-xl font-semibold">Weight Progress</h3>
          {weightChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: weightUnit, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="oklch(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: 'oklch(var(--chart-1))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No weight data available yet
            </div>
          )}
        </Card>

        {/* Rolling Averages Chart */}
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-xl font-semibold">Rolling Averages</h3>
          {rollingAverageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rollingAverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: weightUnit, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="oklch(var(--chart-1))"
                  strokeWidth={1}
                  dot={false}
                  opacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="7-day"
                  stroke="oklch(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="30-day"
                  stroke="oklch(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No data available for rolling averages
            </div>
          )}
        </Card>

        {/* Workout Frequency Heatmap */}
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Workout Frequency (Last 90 Days)</h3>
          <div className="grid grid-cols-10 gap-1">
            {heatmapData.map((item, index) => {
              const intensity = item.count / maxWorkouts;
              const opacity = intensity === 0 ? 0.1 : 0.3 + intensity * 0.7;
              return (
                <div
                  key={index}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: `oklch(var(--chart-4) / ${opacity})`,
                  }}
                  title={`${item.date.toLocaleDateString()}: ${item.count} workout${item.count !== 1 ? 's' : ''}`}
                />
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Less active</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="h-4 w-4 rounded-sm"
                  style={{
                    backgroundColor: `oklch(var(--chart-4) / ${opacity})`,
                  }}
                />
              ))}
            </div>
            <span>More active</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
