import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"


const PrivateRoute = () => {

  const {isAuth,loading} = useAuth()
  if (loading) return <p>Loading...</p>;
  return isAuth?<Outlet/>:<Navigate to="/login"/>;
}

export default PrivateRoute