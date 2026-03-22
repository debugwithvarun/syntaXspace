import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import usePop from "@/hooks/usePop";
import { apiFetch } from "@/lib/api";

const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setPopUp, setMsg } = usePop();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setMsg("Please enter your password to confirm.");
      setPopUp("dw");
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch(`/setting/delete`, {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg(data.msg);
        setPopUp("ds");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMsg(data.msg || "Failed to delete account");
        setPopUp("dw");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
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
          <form className="space-y-6 px-4" onSubmit={handleDelete}>
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Your account will be **deactivated immediately** and **permanently deleted after 30 days**
                  if you do not log in again during this period.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!confirmDelete ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full sm:w-auto"
                    >
                      Delete My Account
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Confirm your password to schedule your account for deletion.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="password">Current Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setConfirmDelete(false);
                          setPassword("");
                        }}
                        className="w-full sm:w-auto"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        className="w-full sm:w-auto"
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Confirm Delete"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DeleteAccount;
