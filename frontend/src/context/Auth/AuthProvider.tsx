  import { useEffect, useState } from "react";
  import AuthContext from "../Auth/AuthContext";
  import ImagePath from "@/lib/ImagePath";
  import { apiFetch } from "@/lib/api";

  export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
      const [isAuth, setIsAuth] = useState(false);
      const [loading, setLoading] = useState(true);
      const [username,setUsername]=useState("")
      const [email,setEmail]=useState("")
      const [name,setName]=useState("")
      const [_id,setId]=useState("")
      const [userId,setUserId]=useState("")
      const [postCount,setPostCount]=useState(0)
      const [profilepic,setProfilePic]=useState("")


      useEffect(() => {
        const checkAuth = async () => {
          try {
            const res = await apiFetch("/check-auth");
            if (res.ok) {
              const data = await res.json();
              const userInfo=data.userInfo
              // console.log(userInfo)
              setUsername(userInfo.username)
              setId(userInfo._id)
              setProfilePic(`${ImagePath(userInfo.profilepic)}`)
              setEmail(userInfo.email)
              setName(userInfo.name)
              setUserId(userInfo._id)
              setIsAuth(data.success); 
              setPostCount(userInfo.post.length || 0)
            } else {
              setIsAuth(false);
            }
          } catch {
            setIsAuth(false);
          } finally {
            setLoading(false);
          }
        };
        checkAuth();
      }, []);
      // console.log(username,profilepic,name,_id,email,userId,postCount)
      return (
        <AuthContext.Provider value={{ _id,isAuth, loading,setIsAuth,username,email,name,setEmail,setName,setUsername ,profilepic,setProfilePic, postCount, setPostCount,userId,setUserId,setId}}>
          {children}
        </AuthContext.Provider>
      );
    };