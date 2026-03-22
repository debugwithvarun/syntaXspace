
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card' 
import { ScrollArea } from '@/components/ui/scroll-area' 
import NewsField from './NewsField'
import { apiFetch } from '@/lib/api'

type articleProps = {
  headline: string,
  desc: string,
  author: string
}
const NewsCard = () => {
  const [article, setArticle] = useState<articleProps[]>([])
  useEffect(() => {
    const getData = async () => {
      const res = await apiFetch("/get-news")
      if (res.ok) {
        const {article} = await res.json()
        setArticle(article)
        // console.log(article)
      }
    }
    getData()
  }, [])

  return (
    <Card className="py-0 pt-4 gap-4 bg-secondary overflow-hidden">
      <h6 className="scroll-m-20 text-sm font-semibold tracking-tight px-6">
        NewsLetter
      </h6>
      <ScrollArea className="max-h-[260px] bg-background py-4 rounded-xl rounded-t-none">
        <div className="flex flex-col gap-2 pr-6 ">
          {article.length !== 0 ?
            <NewsField items={article}/>
           : (<p className="font md pl-6 text-sm">No suggestions at this time.</p>)
          }
        </div>
      </ScrollArea>
    </Card>
  )
}

export default NewsCard