import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface ClientWithCompliance extends User {
  complianceRate: number;
  lastActive: Date;
}

export default function SpecialistClients() {
  const { data: clients, isLoading } = useQuery<ClientWithCompliance[]>({
    queryKey: ["/api/specialist/clients"],
  });

  const getComplianceBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2">My Clients</h1>
          <p className="text-muted-foreground">
            Manage and monitor your clients' nutrition plans
          </p>
        </div>
        <Button data-testid="button-add-client">Add New Client</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : clients && clients.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Target Calories</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {client.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{client.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.email}</TableCell>
                      <TableCell>{client.targetCalories} cal</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getComplianceBadge(client.complianceRate)}
                          <span className="text-sm text-muted-foreground">
                            {client.complianceRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(client.lastActive), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-view-${client.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-message-${client.id}`}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No clients found. Add your first client to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
