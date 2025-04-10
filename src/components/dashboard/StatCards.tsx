
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface StatCardsProps {
  todayCount: number;
  favoritesCount?: number;
  highPriorityCount: number;
}

export function StatCards({ todayCount, favoritesCount = 0, highPriorityCount }: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Tasks Due Today" value={todayCount} />
      <StatCard title="Favorite Tasks" value={favoritesCount} />
      <StatCard title="High Priority Tasks" value={highPriorityCount} />
    </div>
  );
}
