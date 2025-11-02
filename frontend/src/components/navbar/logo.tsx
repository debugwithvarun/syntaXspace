import logo from "../../assets/logo/xlogo.png"
import logo2 from "../../assets/logo/purpletext.png"

export default function Logo() {

  return (
    <>
    <img src={logo} alt="" height={33} width={33} className="md:hidden min-h-[33px] min-w-[33px]"/>
    <img src={logo2} alt="" height={33} width={150}  className="max-md:hidden "/>
    </>
  )
}
