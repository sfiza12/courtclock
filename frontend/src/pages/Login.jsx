import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Scale, Eye, EyeOff, ShieldAlert, Loader2 } from 'lucide-react';
import { judgeLogin } from '../api/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await judgeLogin(email, password);
      if (data && data.success) {
        // Store token in localStorage
        localStorage.setItem('courtclock_token', data.data.token);
        localStorage.setItem('courtclock_user', JSON.stringify(data.data.user));
        // Redirect to dashboard
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-[#2563EB]">
          <Scale size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          CourtClock
        </h2>
        <p className="mt-2 text-center text-[15px] text-slate-600">
          Sign in to your judicial dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {successMessage && !error && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <Scale className="text-green-500 mt-0.5" size={18} />
                <p className="text-[13px] text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <ShieldAlert className="text-red-500 mt-0.5" size={18} />
                <p className="text-[13px] text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label 
                htmlFor="email" 
                className="block text-[14px] font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB] sm:text-[14px]"
                  placeholder="judge@court.gov.in"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-[14px] font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB] sm:text-[14px] pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-[14px] font-medium text-white bg-[#2563EB] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Sign in to CourtClock"
                )}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-[14px] text-slate-600">New judge? </span>
              <Link to="/signup" className="text-[14px] font-medium text-[#2563EB] hover:underline">
                Sign up here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
