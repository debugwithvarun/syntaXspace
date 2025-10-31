import { ArrowRightIcon, Eclipse } from "lucide-react"
import { Link } from "react-router-dom"

export default function VerifyEmail() {
  return (
    <div className="dark bg-primary px-4 py-3 text-foreground">
      <div className="flex flex-col  justify-between gap-2 md:flex-row">
        <div className="flex grow gap-3 ">
          <Eclipse
            className="mt-0.2 shrink-0 opacity-60 max-md:hidden"
            size={16}
            aria-hidden="true"
          />
          <div className="flex grow flex-col justify-between gap-2 md:flex-row md:items-center">
            <p className="text-sm">
            Please verify your email address to connect it to your account.
            </p>
            <Link to="/" className="group text-sm font-medium whitespace-nowrap">
              Verify Now
              <ArrowRightIcon
                className="ms-1 -mt-0.5 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
