import { db } from "./db";
import { users, meals, schedules, scheduleEntries, complianceLogs, recipes } from "@shared/schema";
import { startOfWeek } from "date-fns";

async function seed() {
  console.log("Seeding database...");

  const demoUser = await db.insert(users).values({
    username: "demo_user",
    password: "hashed_password",
    email: "user@nutriplan.com",
    fullName: "Demo User",
    role: "user",
    targetCalories: 2000,
  }).returning();

  const demoSpecialist = await db.insert(users).values({
    username: "demo_specialist",
    password: "hashed_password",
    email: "specialist@nutriplan.com",
    fullName: "Dr. Sarah Johnson",
    role: "specialist",
    targetCalories: 2000,
  }).returning();

  const client1 = await db.insert(users).values({
    username: "client1",
    password: "hashed_password",
    email: "client1@nutriplan.com",
    fullName: "John Smith",
    role: "user",
    specialistId: demoSpecialist[0].id,
    targetCalories: 2200,
  }).returning();

  const client2 = await db.insert(users).values({
    username: "client2",
    password: "hashed_password",
    email: "client2@nutriplan.com",
    fullName: "Emma Williams",
    role: "user",
    specialistId: demoSpecialist[0].id,
    targetCalories: 1800,
  }).returning();

  const breakfastMeals = await db.insert(meals).values([
    {
      name: "Protein Oatmeal Bowl",
      description: "Steel-cut oats with protein powder, berries, and almonds",
      mealType: "breakfast",
      calories: 420,
      protein: "25",
      carbs: "52",
      fats: "12",
      servingSize: "1 bowl",
    },
    {
      name: "Greek Yogurt Parfait",
      description: "Greek yogurt layered with granola and fresh fruit",
      mealType: "breakfast",
      calories: 380,
      protein: "22",
      carbs: "48",
      fats: "10",
      servingSize: "1 parfait",
    },
    {
      name: "Veggie Egg White Scramble",
      description: "Egg whites with spinach, tomatoes, and whole grain toast",
      mealType: "breakfast",
      calories: 350,
      protein: "28",
      carbs: "35",
      fats: "8",
      servingSize: "1 serving",
    },
  ]).returning();

  const lunchMeals = await db.insert(meals).values([
    {
      name: "Grilled Chicken Salad",
      description: "Mixed greens with grilled chicken, vegetables, and balsamic vinaigrette",
      mealType: "lunch",
      calories: 480,
      protein: "38",
      carbs: "32",
      fats: "18",
      servingSize: "1 large salad",
    },
    {
      name: "Turkey & Avocado Wrap",
      description: "Whole wheat wrap with turkey, avocado, lettuce, and tomato",
      mealType: "lunch",
      calories: 520,
      protein: "32",
      carbs: "45",
      fats: "20",
      servingSize: "1 wrap",
    },
    {
      name: "Quinoa Buddha Bowl",
      description: "Quinoa with roasted vegetables, chickpeas, and tahini dressing",
      mealType: "lunch",
      calories: 490,
      protein: "18",
      carbs: "62",
      fats: "16",
      servingSize: "1 bowl",
    },
  ]).returning();

  const dinnerMeals = await db.insert(meals).values([
    {
      name: "Baked Salmon & Vegetables",
      description: "Oven-baked salmon with asparagus and sweet potato",
      mealType: "dinner",
      calories: 580,
      protein: "42",
      carbs: "48",
      fats: "22",
      servingSize: "1 plate",
    },
    {
      name: "Lean Beef Stir-Fry",
      description: "Lean beef with mixed vegetables over brown rice",
      mealType: "dinner",
      calories: 620,
      protein: "45",
      carbs: "55",
      fats: "20",
      servingSize: "1 serving",
    },
    {
      name: "Grilled Chicken & Broccoli",
      description: "Herb-marinated chicken breast with steamed broccoli and quinoa",
      mealType: "dinner",
      calories: 550,
      protein: "48",
      carbs: "42",
      fats: "16",
      servingSize: "1 plate",
    },
  ]).returning();

  const snackMeals = await db.insert(meals).values([
    {
      name: "Protein Smoothie",
      description: "Banana, protein powder, almond milk, and spinach",
      mealType: "snack",
      calories: 220,
      protein: "20",
      carbs: "28",
      fats: "4",
      servingSize: "12 oz",
    },
    {
      name: "Apple & Almond Butter",
      description: "Sliced apple with natural almond butter",
      mealType: "snack",
      calories: 180,
      protein: "6",
      carbs: "24",
      fats: "8",
      servingSize: "1 apple + 2 tbsp",
    },
    {
      name: "Trail Mix",
      description: "Mixed nuts, seeds, and dried fruit",
      mealType: "snack",
      calories: 200,
      protein: "8",
      carbs: "18",
      fats: "12",
      servingSize: "1/4 cup",
    },
  ]).returning();

  const schedule = await db.insert(schedules).values({
    userId: demoUser[0].id,
    name: "Weekly Meal Plan",
    startDate: startOfWeek(new Date()),
    isActive: true,
  }).returning();

  for (let day = 0; day <= 6; day++) {
    await db.insert(scheduleEntries).values([
      {
        scheduleId: schedule[0].id,
        mealId: breakfastMeals[day % breakfastMeals.length].id,
        mealType: "breakfast",
        dayOfWeek: day,
      },
      {
        scheduleId: schedule[0].id,
        mealId: lunchMeals[day % lunchMeals.length].id,
        mealType: "lunch",
        dayOfWeek: day,
      },
      {
        scheduleId: schedule[0].id,
        mealId: dinnerMeals[day % dinnerMeals.length].id,
        mealType: "dinner",
        dayOfWeek: day,
      },
      {
        scheduleId: schedule[0].id,
        mealId: snackMeals[day % snackMeals.length].id,
        mealType: "snack",
        dayOfWeek: day,
      },
    ]);
  }

  await db.insert(recipes).values([
    {
      name: "Mediterranean Chicken Bowl",
      description: "A healthy Mediterranean-inspired bowl with grilled chicken",
      ingredients: ["2 chicken breasts", "1 cup quinoa", "1 cucumber", "1 cup cherry tomatoes", "1/4 cup feta cheese", "2 tbsp olive oil", "Lemon juice", "Fresh herbs"],
      instructions: ["Cook quinoa according to package", "Grill seasoned chicken breasts", "Dice cucumber and tomatoes", "Combine all ingredients in bowl", "Drizzle with olive oil and lemon", "Top with feta and herbs"],
      calories: 520,
      protein: "42",
      carbs: "48",
      fats: "16",
      servingSize: "1 large bowl",
      mealType: "lunch",
    },
    {
      name: "Berry Protein Smoothie Bowl",
      description: "Refreshing smoothie bowl packed with antioxidants",
      ingredients: ["1 cup mixed berries", "1 banana", "1 scoop protein powder", "1/2 cup Greek yogurt", "1/4 cup granola", "1 tbsp chia seeds", "Almond milk"],
      instructions: ["Blend berries, banana, protein powder, and yogurt", "Add almond milk for desired consistency", "Pour into bowl", "Top with granola and chia seeds", "Add fresh berries on top"],
      calories: 380,
      protein: "28",
      carbs: "52",
      fats: "8",
      servingSize: "1 bowl",
      mealType: "breakfast",
    },
  ]);

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
