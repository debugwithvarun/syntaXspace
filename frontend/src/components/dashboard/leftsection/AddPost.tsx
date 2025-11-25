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
import { useAuth } from "@/hooks/useAuth"

export function AddPost() {
  const { postCount } = useAuth()
  const { setOpen } = useIdle()

  const isEmpty = postCount === 0

  return (
    <Empty className={`p-6 md:p-8 ${!isEmpty && "border-t bg-muted/30"}`}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconCode />
        </EmptyMedia>

        <EmptyTitle>
          {isEmpty ? "No Posts Yet" : "Add Another Post"}
        </EmptyTitle>

        <EmptyDescription>
          {isEmpty
            ? "You haven't shared any code posts yet. Create your first post to share your work with others."
            : "Keep building your profile by sharing more awesome code posts."}
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button onClick={() => setOpen((e) => !e)}>
          {isEmpty ? "Create Code Post" : "Add More Posts"}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
