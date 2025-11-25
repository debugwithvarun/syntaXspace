import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import usePop from '@/hooks/usePop';

const Login = () => {
  const { isAuth, setIsAuth, setEmail, setName, setUsername,setProfilePic } = useAuth();
  const {setMsg,setPopUp}=usePop()
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        usernameOrEmail: formData.usernameOrEmail.toLowerCase(), // normalize email/username
      };
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMsg("Login Successfully")
        setPopUp("ds")
       
        const data=await res.json()
        const userInfo=data.userInfo
        console.log(userInfo)
        setUsername(userInfo.username)
        setEmail(userInfo.email)
        setName(userInfo.name)
        setProfilePic(`http://localhost:8000${userInfo.profilepic}`)
        setIsAuth(true);
      } else {
        const code = await res.json();
        if (code.code === 2) {
          setMsg("Incorrect password")
          setPopUp("w")
          
        }
        else {
          setMsg("User not exists")
          setPopUp("w")

        };
      }
    } catch (err) {
      console.error(err);
      setMsg("Something went wrong")
      setPopUp("e")
      // alert('Something went wrong');
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center"
      style={{ background: 'var(--gradient-primary)', color: 'var(--color-foreground)' }}
    >
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-300 text-sm">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Username"
              autoComplete='on'
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/15"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="off"
              required
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 hover:bg-white/15"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Log In
          </button>

          <p className="text-center text-gray-300 text-sm mt-4">
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
