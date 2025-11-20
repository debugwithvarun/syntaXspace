import { IconCode } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useIdle } from "@/hooks/useIdle"

export function AddPost() {
  const {setOpen}=useIdle()
  return (
    <Empty className="p-6 md:p-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconCode />
        </EmptyMedia>

        <EmptyTitle>No Posts Yet</EmptyTitle>

        <EmptyDescription>
          You haven&apos;t shared any code posts yet. Create your first post to
          share your work with others.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button onClick={() => setOpen(e => !e)}>
          Create Code Post
        </Button>
      </EmptyContent>
    </Empty>
  )
}
  