
import { Skeleton } from '../ui/skeleton'

const ProfileShimmer = () => {
  return (
    <div className="flex items-center space-4 py-2">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  </div>
  )
}

export default ProfileShimmer