import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import usePop from "@/hooks/usePop";
import { apiFetch } from "@/lib/api";



const EditProfile = () => {
  const { username, name, profilepic,setProfilePic } = useAuth();

  // ---------- State ----------
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    profilepic ? `${profilepic}` : null
  );
  const [uname, setUname] = useState(username);
  const [pname, setPname] = useState(name);
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const {setPopUp,setMsg}=usePop()


  // ---------- Fetch Profile Data ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch(`/setting/profile`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const { data } = await res.json();

        setBio(data.bio || "");
        setSkills(data.skills || []);
      } catch (error) {
        setMsg("Something went wrong")
        setPopUp('de')
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // ---------- Handlers ----------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", pname);
      formData.append("username", uname);
      formData.append("bio", bio);
      formData.append("skills", JSON.stringify(skills));
      if (profileImage) {
        formData.append("profilepic", profileImage);
      }

      const res = await apiFetch(`/setting/profile`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProfilePic(data.profile)
        setMsg("Profile updated successfully!");
        setPopUp("ds")

        if (data.profilepic){ 
          setProfilePreview(`${data.profilepic}`);
        }
      } else {
        setMsg("Profile Update failed")
        setPopUp("dw")
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMsg("Something went wrong while updating your profile.");
      setPopUp("de")
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="h-[90vh] w-full flex justify-center items-start">
      <div className="w-full max-w-4xl rounded-xl">
        <ScrollArea className="h-[70vh] lg:h-[80vh]">
          <form
            className="space-y-6 px-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload or change your profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-border">
                  {profilePreview ? (
                    <AvatarImage src={profilePreview} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary/10">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 space-y-4">
                  <Label htmlFor="profile-picture" className="cursor-pointer">
                    <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-fit">
                      <Camera className="h-4 w-4" />
                      <span>Choose Photo</span>
                    </div>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or WebP. Max size 5MB.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter Name"
                      value={pname}
                      onChange={(e) => setPname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter Username"
                      value={uname}
                      onChange={(e) => setUname(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About Me</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    className="min-h-[100px] resize-none"
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Technical Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
                <CardDescription>
                  Add tags to showcase your expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., Python, React)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-1"
                    >
                      {skill}
                      <span
                        onClick={() => removeSkill(skill)}
                        className="text-sm cursor-pointer hover:text-destructive"
                      >
                        ✕
                      </span>
                    </Badge>
                  ))}
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

export default EditProfile;
