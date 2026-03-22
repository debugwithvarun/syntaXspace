import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

const Logout = () => {
  const navigate = useNavigate();
  const { setIsAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function doLogOut() {
      try {
        const res = await apiFetch("/logout", { method: "POST" });

        if (!isMounted) return;

        if (res.ok) {
          // FIX 1: Remove JWT token from localStorage on logout
          localStorage.removeItem("token");
          setTimeout(() => {
            if (isMounted) {
              setIsAuth(false);
              navigate("/login", { replace: true });
            }
          }, 2000);
        } else {
          console.log("Logout failed");
        }
      } catch (err) {
        if (isMounted) console.log("Logout error:", err);
      }
    }

    doLogOut();

    return () => {
      isMounted = false;
    };
  }, [navigate, setIsAuth]);

  return (
    <div
      className="w-full min-h-screen flex justify-center items-center text-white text-4xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{ backgroundColor: 'var(--background)' }}
    >
      Logging out...
    </div>
  );
};

export default Logout;
