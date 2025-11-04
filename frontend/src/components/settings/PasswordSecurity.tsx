import React from 'react'
import { ScrollArea } from '../ui/scroll-area'
import { Card , CardHeader, CardDescription, CardTitle} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '../ui/button'
// import Birthday from './Birthday'

const PasswordSecurity = () => {
  return (
    <div className="h-[90vh] w-full flex justify-center items-start ">
      <div className="w-full max-w-4xl rounded-xl ">
        <ScrollArea className="h-[70vh] lg:h-[80vh] ">
            
         <Card>

            <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>Change your password here. After saving, you'll be logged out.</CardDescription>

                 <div className="grid grid-rows-1 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Current Password</Label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">New Password</Label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location"> Confirm New Password</Label>
                    <Input />
                  </div>
                  
                </div>

               




              </CardHeader>
             
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

        </ScrollArea>
      </div>
    </div>
  )
}

export default PasswordSecurity