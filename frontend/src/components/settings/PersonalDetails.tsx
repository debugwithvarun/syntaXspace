import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "../ui/scroll-area";

import usePop from "@/hooks/usePop";
import { apiFetch } from "@/lib/api";

const PersonalDetails = () => {
  const [email, setEmail] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [loading, setLoading] = useState(false);
  const { setPopUp, setMsg } = usePop();

  // ✅ Fetch personal details on mount
  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        const res = await apiFetch(`/setting/personal`);
        if (!res.ok) throw new Error("Failed to fetch details");
        const { data } = await res.json();

        setEmail(data.email || "");
        setPhoneno(data.phoneno || "");
        setWebsite(data.website || "");
        setLocation(data.location || "");
        setDob(data.dob || "");
        setPronouns(data.pronouns || "");
      } catch (error) {
        console.error("Error fetching personal details:", error);
        setMsg("Failed to load personal details");
        setPopUp("de");
      }
    };
    fetchPersonalDetails();
  }, []);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch(`/setting/personal`, {
        method: "PUT",
        body: JSON.stringify({ email, phoneno, website, location, dob, pronouns }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg("Personal details updated successfully!");
        setPopUp("ds");
      } else {
        setMsg(data.msg || "Update failed");
        setPopUp("dw");
      }
    } catch (error) {
      console.error("Error updating details:", error);
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
          <form className="space-y-6 px-4" onSubmit={handleSubmit}>
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How people can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneno">Phone Number</Label>
                    <Input
                      id="phoneno"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phoneno}
                      onChange={(e) => setPhoneno(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website / Portfolio</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Optional information about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronouns">Gender / Pronouns</Label>
                  <Select value={pronouns} onValueChange={(val) => setPronouns(val)}>
                    <SelectTrigger id="pronouns">
                      <SelectValue placeholder="Select your pronouns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="he">He/Him</SelectItem>
                      <SelectItem value="she">She/Her</SelectItem>
                      <SelectItem value="they">They/Them</SelectItem>
                      <SelectItem value="custom">Prefer to self-describe</SelectItem>
                      <SelectItem value="none">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 pb-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PersonalDetails;
