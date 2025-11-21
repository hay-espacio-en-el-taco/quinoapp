import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Recipe } from "@shared/schema";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeLibrary() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Recipe Library</h1>
        <p className="text-muted-foreground">
          Browse healthy recipes tailored to your nutritional goals
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-recipes"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="hover-elevate transition-all" data-testid={`card-recipe-${recipe.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">{recipe.name}</CardTitle>
                  {recipe.mealType && (
                    <Badge variant="secondary" className="capitalize flex-shrink-0">
                      {recipe.mealType}
                    </Badge>
                  )}
                </div>
                {recipe.description && (
                  <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <p className="text-xl font-semibold text-primary">{recipe.calories}</p>
                    <p className="text-xs text-muted-foreground">cal</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium">{recipe.protein}g</p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium">{recipe.carbs}g</p>
                    <p className="text-xs text-muted-foreground">carbs</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium">{recipe.fats}g</p>
                    <p className="text-xs text-muted-foreground">fats</p>
                  </div>
                </div>
                {recipe.servingSize && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.servingSize}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recipes found matching your search.</p>
        </div>
      )}
    </div>
  );
}
