import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import type { ComplianceLog } from "@shared/schema";
import { useState } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: complianceData, isLoading } = useQuery<ComplianceLog[]>({
    queryKey: ["/api/compliance/history"],
  });

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "skipped":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getComplianceForDay = (date: Date) => {
    if (!complianceData) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return complianceData.filter(
      (log) => format(new Date(log.scheduledDate), "yyyy-MM-dd") === dateStr
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">My Schedule</h1>
        <p className="text-muted-foreground">
          View your weekly meal plan and track your progress
        </p>
      </div>

      <Tabs defaultValue="week" className="space-y-6">
        <TabsList>
          <TabsTrigger value="week" data-testid="tab-week">Week View</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weekDays.map((day) => {
                const dayLogs = getComplianceForDay(day);
                const completedCount = dayLogs.filter((l) => l.status === "completed").length;
                const totalCount = dayLogs.length;
                const complianceRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                return (
                  <Card key={day.toISOString()} data-testid={`card-day-${format(day, "yyyy-MM-dd")}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {format(day, "EEEE")}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {format(day, "MMM d")}
                          </CardDescription>
                        </div>
                        {complianceRate >= 75 ? (
                          <Badge className="bg-green-500">
                            {Math.round(complianceRate)}%
                          </Badge>
                        ) : complianceRate >= 50 ? (
                          <Badge className="bg-yellow-500">
                            {Math.round(complianceRate)}%
                          </Badge>
                        ) : totalCount > 0 ? (
                          <Badge variant="destructive">
                            {Math.round(complianceRate)}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Started</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {dayLogs.length > 0 ? (
                        dayLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="capitalize text-muted-foreground">
                              {log.mealType}
                            </span>
                            {getStatusIcon(log.status)}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No meals scheduled
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Calendar</CardTitle>
              <CardDescription>Select a date to view meal details</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                data-testid="calendar-schedule"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
