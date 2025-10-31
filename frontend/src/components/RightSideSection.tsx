import NewsCard from "./NewsCard"
import RcmdCard from "./RcmdCard"


const RightSideSection = () => {

  
  return (
    <div className="h-full md:min-w-[280px] md:max-w-[300px] flex pt-10 md:flex-col gap-6 max-lg:hidden">
        
      <RcmdCard/>
      <NewsCard/>
    </div>
  )
}

export default RightSideSection