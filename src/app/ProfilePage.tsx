import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/AuthContext";
import { Calendar, Mail, Shield, User } from "lucide-react";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-bold">Your profile</h1>

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <User className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold">{user?.name}</h2>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-text-primary/10 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-text-secondary">
              <Shield className="h-4 w-4" />
              Role
            </span>
            <span className="font-medium">{user?.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-text-secondary">
              <Calendar className="h-4 w-4" />
              Member since
            </span>
            <span className="font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-text-secondary">
              <Mail className="h-4 w-4" />
              Email
            </span>
            <span className="font-medium">{user?.email}</span>
          </div>
        </div>
      </Card>

      <Button variant="danger" className="w-full gap-2" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
