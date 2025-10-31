import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username,setUsername]=useState("")
    const [email,setEmail]=useState("")
    const [name,setName]=useState("")
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch("/api/check-auth");
          if (res.ok) {
            const data = await res.json();
            const userInfo=data.userInfo
            console.log(userInfo)
            setUsername(userInfo.username)
            setEmail(userInfo.email)
            setName(userInfo.name)
            setIsAuth(data.success); 
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
  
    return (
      <AuthContext.Provider value={{ isAuth, loading,setIsAuth,username,email,name,setEmail,setName,setUsername }}>
        {children}
      </AuthContext.Provider>
    );
  };