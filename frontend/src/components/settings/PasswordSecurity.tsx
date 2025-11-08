import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import usePop from "@/hooks/usePop";

const API_BASE = "http://localhost:8000";

const PasswordSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setPopUp, setMsg } = usePop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMsg("All fields are required");
      setPopUp("dw");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg("New passwords do not match");
      setPopUp("dw");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/setting/security`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(data.msg || "Password updated successfully");
        setPopUp("ds");

        // Wait briefly and redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMsg(data.msg || "Failed to update password");
        setPopUp("dw");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setMsg("Something went wrong");
      setPopUp("de");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[90vh] w-full flex justify-center items-start">
      <div className="w-full max-w-4xl rounded-xl">
        <ScrollArea className="h-[70vh] lg:h-[80vh]">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>

                <div className="grid grid-rows-1 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 pb-4">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PasswordSecurity;
