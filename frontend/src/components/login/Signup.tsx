import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import SignupSchema from "../../Schema/SignupSchema";
import usePop from "@/hooks/usePop";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const { setPopUp, setMsg } = usePop();
  const { isAuth } = useAuth();


  useEffect(() => {
    if (isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(SignupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
  }) => {
    try {
      data.username = data.username.toLowerCase()
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMsg("Account Created Successfully !");
        setPopUp("s");
        navigate("/login");
      } else {
        setMsg("Signup Error")
        setPopUp("e")
      }
    } catch (error) {
      console.log("Error  ", error);
      setMsg("Something Went wrong")
      setPopUp("e")
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center"
      style={{ background: "var(--gradient-primary)", color: "var(--color-foreground)" }}
    >
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl p-2 font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sign Up
          </h1>
          <p className="text-gray-300 text-sm">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              {...register("username")}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              {...register("name")}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              {...register("email")}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>


          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>


          <p className="text-center text-gray-300 text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
            >
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
