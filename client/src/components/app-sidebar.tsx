import { Home, Utensils, Camera, BookOpen, Users, BarChart3, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const userItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "My Schedule",
    url: "/schedule",
    icon: Utensils,
  },
  {
    title: "Grocery Scanner",
    url: "/scanner",
    icon: Camera,
  },
  {
    title: "Recipe Library",
    url: "/recipes",
    icon: BookOpen,
  },
];

const specialistItems = [
  {
    title: "Dashboard",
    url: "/specialist",
    icon: BarChart3,
  },
  {
    title: "My Clients",
    url: "/specialist/clients",
    icon: Users,
  },
  {
    title: "Recipe Library",
    url: "/recipes",
    icon: BookOpen,
  },
];

interface AppSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AppSidebar({ userRole = "user", userName = "User" }: AppSidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const items = userRole === "specialist" ? specialistItems : userItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Utensils className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">NutriPlan</span>
            <span className="text-xs text-muted-foreground">Nutrition Companion</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{userName}</span>
            <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
