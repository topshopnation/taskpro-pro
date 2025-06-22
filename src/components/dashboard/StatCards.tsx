
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number;
  route?: string;
  onClick?: () => void;
}

function StatCard({ title, value, route, onClick }: StatCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  return (
    <Card 
      className={route || onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
      onClick={route || onClick ? handleClick : undefined}
    >
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
  overdueCount: number;
  highPriorityCount: number;
  totalCount?: number;
  completedCount?: number;
}

export function StatCards({ todayCount, overdueCount, highPriorityCount, totalCount, completedCount }: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Tasks Due Today" value={todayCount} route="/today" />
      <StatCard title="Overdue Tasks" value={overdueCount} route="/overdue" />
      <StatCard title="High Priority Tasks" value={highPriorityCount} />
      {totalCount !== undefined && (
        <StatCard title="Total Tasks" value={totalCount} />
      )}
      {completedCount !== undefined && (
        <StatCard title="Completed Tasks" value={completedCount} />
      )}
    </div>
  );
}
