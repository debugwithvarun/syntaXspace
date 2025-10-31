
import { Card } from './ui/card'
import ProfileTitle from './ProfileTitle'

const LeftSideSection = () => {
    return (
        <div className="h-full min-w-[280px] flex pt-10 flex-col gap-2 max-xl:hidden">
            <Card className="p-6">
                <ProfileTitle />
            </Card>
 
        </div>
    )
}

export default LeftSideSection