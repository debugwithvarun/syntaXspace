import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import AboutSection from './Tabs/AboutSection'

import PostSection from './Tabs/PostSection'

const tabTriggerClass =
  'relative flex items-center gap-2 px-1 py-1 text-sm font-medium text-muted-foreground ' +
  'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:transition-transform ' +
  'hover:bg-secondary hover:text-foreground ' +
  'data-[state=active]:bg-transparent data-[state=active]:shadow-none ' +
  'data-[state=active]:text-foreground data-[state=active]:after:bg-primary data-[state=active]:after:scale-x-100'

const TabSection = ({postCount}:{postCount:number}) => {
  return (
    <Tabs defaultValue="work" className="w-full">
      <TabsList className="flex w-full justify-start gap-4 rounded-none rounded-b-xl  border-b bg-background px-6 py-1">
        <TabsTrigger value="work" className={tabTriggerClass}>
          <span>Work</span>
          <span className="text-xs text-muted-foreground">{postCount}</span>
        </TabsTrigger>


     

        <TabsTrigger value="about" className={tabTriggerClass}>
          <span>About</span>
        </TabsTrigger>
      </TabsList>

      {/* Work */}
      
      <TabsContent value="work">
        <PostSection/>
      </TabsContent>



      {/* Likes */}
      {/* <TabsContent value="likes">
        <div className="px-6 py-6 text-sm text-muted-foreground">
          Likes content goes here.
        </div>
      </TabsContent> */}

      {/* About */}
      <TabsContent value="about">
       
          <AboutSection />
     
      </TabsContent>
    </Tabs>
  )
}

export default TabSection
