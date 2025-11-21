import OpenAI from "openai";

const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = hasOpenAIKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function analyzeGroceryImage(base64Image: string): Promise<{
  ingredients: string[];
  suggestedMealType: string;
}> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const visionResponse = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this grocery image and identify all the ingredients. Provide a list of ingredients and suggest what type of meal (breakfast, lunch, dinner, or snack) would be best suited for these ingredients. Respond with JSON in this format: { 'ingredients': string[], 'suggestedMealType': string }"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(visionResponse.choices[0].message.content || "{}");
  return result;
}

export async function generateRecipe(
  ingredients: string[],
  mealType: string,
  targetCalories?: number
): Promise<{
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
}> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const calorieConstraint = targetCalories 
    ? `The recipe should be approximately ${targetCalories} calories (±100 calories).`
    : "The recipe should be a healthy, balanced meal.";

  const prompt = `Create a ${mealType} recipe using these ingredients: ${ingredients.join(", ")}. 
  ${calorieConstraint}
  
  Provide a complete recipe with nutritional information in JSON format:
  {
    "name": "Recipe Name",
    "description": "Brief description",
    "ingredients": ["ingredient 1 with measurement", "ingredient 2 with measurement"],
    "instructions": ["Step 1", "Step 2"],
    "calories": number,
    "protein": number (grams),
    "carbs": number (grams),
    "fats": number (grams),
    "servingSize": "serving size description"
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: "You are a professional nutritionist and chef. Create healthy, balanced recipes with accurate nutritional information."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result;
}
