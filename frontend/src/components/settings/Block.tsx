import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useChat from "@/hooks/useChat";
import { ShieldBan, ShieldCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";

type BlockedUser = {
  _id: string;
  name: string;
  username: string;
  profilepic: string;
};

export default function Block() {
  const { unblockUser } = useChat();
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/blocked-users");
      if (!res.ok) return;
      const data = await res.json();
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleUnblock = async (userId: string) => {
    await unblockUser(userId);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <ShieldBan className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Blocked Users</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Blocked users cannot message you or appear in your search results.
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
            <ShieldCheck className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No blocked users</p>
            <p className="text-xs opacity-70">People you block will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      to={`/profile/${user.username}`}
                      className="font-medium text-sm hover:underline truncate block"
                    >
                      {user.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-green-600 border-green-500/40 hover:bg-green-50 hover:text-green-700 rounded-full h-8 text-xs gap-1.5"
                  onClick={() => handleUnblock(user._id)}
                >
                  <UserX className="h-3.5 w-3.5" />
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
