import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coffee, Salad, UtensilsCrossed, Cookie, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Meal, ComplianceLog } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const mealTypeIcons = {
  breakfast: Coffee,
  lunch: Salad,
  dinner: UtensilsCrossed,
  snack: Cookie,
};

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);

  const { data: todaySchedule, isLoading: scheduleLoading } = useQuery<{
    meals: Array<{ mealType: string; meal: Meal; completed: boolean }>;
    totalCalories: number;
    consumedCalories: number;
    targetCalories: number;
  }>({
    queryKey: ["/api/schedule/today"],
  });

  const { data: alternativeMeals, isLoading: alternativesLoading } = useQuery<Meal[]>({
    queryKey: ["/api/meals/alternatives", selectedMealType],
    queryFn: selectedMealType 
      ? async () => {
          const response = await fetch(`/api/meals/alternatives?mealType=${selectedMealType}`);
          if (!response.ok) throw new Error("Failed to fetch alternatives");
          return response.json();
        }
      : undefined,
    enabled: !!selectedMealType,
  });

  const replaceMealMutation = useMutation({
    mutationFn: async ({ mealType, newMealId }: { mealType: string; newMealId: string }) => {
      return apiRequest("POST", "/api/schedule/replace-meal", { mealType, newMealId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/today"] });
      setSelectedMealType(null);
      toast({
        title: "Meal Updated",
        description: "Your meal has been successfully replaced.",
      });
    },
  });

  const completeMealMutation = useMutation({
    mutationFn: async (mealType: string) => {
      return apiRequest("POST", "/api/compliance/complete", { mealType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule/today"] });
      toast({
        title: "Meal Logged",
        description: "Great job! Keep up the healthy habits.",
      });
    },
  });

  if (scheduleLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const meals = todaySchedule?.meals || [];
  const consumedCalories = todaySchedule?.consumedCalories || 0;
  const targetCalories = todaySchedule?.targetCalories || 2000;
  const calorieProgress = Math.min((consumedCalories / targetCalories) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Today's Nutrition</h1>
        <p className="text-muted-foreground">Track your daily meals and stay on target</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Calorie Progress</CardTitle>
          <CardDescription>
            {consumedCalories} of {targetCalories} calories consumed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={calorieProgress} className="h-3" data-testid="progress-calories" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-medium">{Math.round(calorieProgress)}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meals.map(({ mealType, meal, completed }) => {
          const Icon = mealTypeIcons[mealType as keyof typeof mealTypeIcons] || UtensilsCrossed;
          
          return (
            <Card key={mealType} className="relative">
              {completed && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" data-testid={`icon-completed-${mealType}`} />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg capitalize">{mealType}</CardTitle>
                    <CardDescription className="text-xs">{meal.servingSize || "1 serving"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1" data-testid={`text-meal-name-${mealType}`}>{meal.name}</h3>
                  {meal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold" data-testid={`text-calories-${mealType}`}>
                      {meal.calories}
                    </p>
                    <p className="text-xs text-muted-foreground">calories</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">{meal.protein}g</p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">{meal.carbs}g</p>
                    <p className="text-xs text-muted-foreground">carbs</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-medium">{meal.fats}g</p>
                    <p className="text-xs text-muted-foreground">fats</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {!completed && (
                    <Button
                      size="sm"
                      onClick={() => completeMealMutation.mutate(mealType)}
                      disabled={completeMealMutation.isPending}
                      className="flex-1"
                      data-testid={`button-complete-${mealType}`}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Dialog open={selectedMealType === mealType} onOpenChange={(open) => !open && setSelectedMealType(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMealType(mealType)}
                        className="flex-1"
                        data-testid={`button-replace-${mealType}`}
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="capitalize">Replace {mealType}</DialogTitle>
                        <DialogDescription>
                          Choose an alternative meal with similar calorie content (±50 calories)
                        </DialogDescription>
                      </DialogHeader>
                      {alternativesLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-48" />
                          ))}
                        </div>
                      ) : alternativeMeals && alternativeMeals.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                          {alternativeMeals.map((altMeal) => (
                            <Card
                              key={altMeal.id}
                              className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                              onClick={() => replaceMealMutation.mutate({ mealType, newMealId: altMeal.id })}
                              data-testid={`card-alternative-${altMeal.id}`}
                            >
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm line-clamp-2">{altMeal.name}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Calories</span>
                                  <Badge variant="secondary" className="text-xs">{altMeal.calories}</Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                  <div>
                                    <p className="font-medium">{altMeal.protein}g</p>
                                    <p className="text-muted-foreground">P</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">{altMeal.carbs}g</p>
                                    <p className="text-muted-foreground">C</p>
                                  </div>
                                  <div>
                                    <p className="font-medium">{altMeal.fats}g</p>
                                    <p className="text-muted-foreground">F</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-muted-foreground">
                          No alternative meals available with similar calories.
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
