import  { createContext} from "react";

interface AuthContextType {
  isAuth: boolean;
  loading: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setName:React.Dispatch<React.SetStateAction<string>>;
  setUsername:React.Dispatch<React.SetStateAction<string>>;
  setEmail:React.Dispatch<React.SetStateAction<string>>;
  setProfilePic:React.Dispatch<React.SetStateAction<string>>;
  setUserId:React.Dispatch<React.SetStateAction<string>>;
  name:string ;
  userId:string ;
  username:string ;
  email:string ;
  profilepic:string;
  postCount:number ;
  setPostCount:React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;



// import { useAuth } from "../hooks/useAuth";
// import axios from "../api/axiosInstance";

// const LogoutButton = () => {
//   const { setIsAuth } = useAuth();

//   const handleLogout = async () => {
//     try {
//       await axios.post("/logout"); // call backend
//       setIsAuth(false);             // update frontend state
//       window.location.href = "/login"; // redirect to login
//     } catch (err) {
//       console.error("Logout failed", err);
//     }
//   };

//   return <button onClick={handleLogout}>Logout</button>;
// };

// export default LogoutButton;
