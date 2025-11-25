import { AddPost } from '@/components/dashboard/leftsection/AddPost'


import RcmdCard from '@/components/dashboard/rightsection/RcmdCard'
import { Card } from '@/components/ui/card'


const RightSection = () => {
  return (
    <div className="h-full md:min-w-[300px]  flex pt-10 md:flex-col gap-6 max-lg:hidden">
        
      <RcmdCard/>
      <Card className='p-0 w-fit max-w-[325px]'>
      <AddPost/>

      </Card>
      </div>
  )
}

export default RightSection