import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Recipe } from "@shared/schema";

export default function GroceryScanner() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/grocery/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedRecipe(data.recipe);
      toast({
        title: "Recipe Generated!",
        description: "Your custom recipe has been created based on the ingredients.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedRecipe(null);
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  }, [selectedFile, uploadMutation]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setGeneratedRecipe(null);
  }, [previewUrl]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Grocery Scanner</h1>
        <p className="text-muted-foreground">
          Upload a photo of your groceries and we'll generate a recipe that fits your nutritional needs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Grocery Image</CardTitle>
          <CardDescription>
            Take a photo or upload an image of your available ingredients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!previewUrl ? (
            <label
              htmlFor="grocery-upload"
              className="flex flex-col items-center justify-center min-h-96 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate transition-all"
              data-testid="dropzone-upload"
            >
              <div className="flex flex-col items-center gap-4 text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Camera className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-1">Upload your groceries</p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop your image here
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <input
                id="grocery-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  data-testid="img-preview"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  data-testid="button-analyze"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze & Generate Recipe"
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} data-testid="button-reset">
                  Choose Different Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedRecipe && (
        <Card data-testid="card-generated-recipe">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl mb-2">{generatedRecipe.name}</CardTitle>
                <CardDescription>{generatedRecipe.description}</CardDescription>
              </div>
              {generatedRecipe.mealType && (
                <Badge variant="secondary" className="capitalize">
                  {generatedRecipe.mealType}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{generatedRecipe.calories}</p>
                <p className="text-sm text-muted-foreground">calories</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium">{generatedRecipe.protein}g</p>
                <p className="text-sm text-muted-foreground">protein</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium">{generatedRecipe.carbs}g</p>
                <p className="text-sm text-muted-foreground">carbs</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium">{generatedRecipe.fats}g</p>
                <p className="text-sm text-muted-foreground">fats</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {(generatedRecipe.ingredients as string[]).map((ingredient, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <ol className="space-y-3">
                {(generatedRecipe.instructions as string[]).map((instruction, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Button className="w-full" data-testid="button-add-to-schedule">
              Add to My Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
