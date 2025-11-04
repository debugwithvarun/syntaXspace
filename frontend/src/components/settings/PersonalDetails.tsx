import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import Birthday from './Birthday';
import PhoneNo from './PhoneNo';

const PersonalDetails = () => {
  return (
    <div className="h-[90vh] w-full flex justify-center items-start ">
      <div className="w-full max-w-4xl rounded-xl ">
        <ScrollArea className="h-[70vh] lg:h-[80vh] ">
          <form className="space-y-6 px-4">

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
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                   <PhoneNo/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website / Portfolio</Label>
                  <Input id="website" type="url" placeholder="https://yourwebsite.com" />
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
                    <Input id="location" placeholder="San Francisco, CA" />
                  </div>
                  <div className="space-y-2">
                    <Birthday />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender / Pronouns</Label>
                  <Select>
                    <SelectTrigger id="gender">
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
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Save Changes
              </Button>
            </div>
            
          </form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PersonalDetails;
