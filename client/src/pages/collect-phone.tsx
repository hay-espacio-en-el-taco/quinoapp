import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";

const phoneFormSchema = z.object({
  phoneNumber: z.string().regex(/^\+\d{10,15}$/, "Must be in international format (e.g. +5215512345678)"),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

export default function CollectPhonePage() {
  const { user, isLoading, isAuthenticated, updatePhone, isUpdatingPhone } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (user?.phoneNumber) {
    setLocation("/");
    return null;
  }

  async function onSubmit(values: PhoneFormValues) {
    try {
      await updatePhone(values.phoneNumber);
      setLocation("/");
    } catch {
      form.setError("phoneNumber", { message: "Failed to save phone number. Please try again." });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Almost there!</CardTitle>
          <CardDescription className="text-base">
            Add your phone number to receive meal reminders and nutrition notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+5215512345678"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      International format with country code (e.g. +52 for Mexico, +1 for US)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700"
                disabled={isUpdatingPhone}
              >
                {isUpdatingPhone ? "Saving..." : "Continue to NutriPlan"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
