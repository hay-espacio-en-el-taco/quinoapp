import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface SpecialistStats {
  totalClients: number;
  activePlans: number;
  averageCompliance: number;
  pendingReviews: number;
}

export default function SpecialistDashboard() {
  const { data: stats, isLoading } = useQuery<SpecialistStats>({
    queryKey: ["/api/specialist/stats"],
  });

  const statCards = [
    {
      title: "Total Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      description: "Active users",
    },
    {
      title: "Active Plans",
      value: stats?.activePlans || 0,
      icon: TrendingUp,
      description: "Nutrition schedules",
    },
    {
      title: "Avg Compliance",
      value: `${stats?.averageCompliance || 0}%`,
      icon: CheckCircle2,
      description: "Meal adherence rate",
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews || 0,
      icon: Clock,
      description: "Require attention",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Specialist Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your clients' progress and manage nutrition plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs font-medium">
                    {stat.title}
                  </CardDescription>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-20" />
                ) : (
                  <>
                    <p className="text-3xl font-semibold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Overview of client engagement and compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Activity feed will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
