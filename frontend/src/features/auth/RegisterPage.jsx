import { useState } from 'react';
import { registerUser } from '../../services/authService';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      await registerUser(formData);
      setIsSuccess(true);
      setMessage('Account created successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setIsSuccess(false);
      setMessage('Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-secondary-900/20"></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-secondary rounded-2xl mb-4 shadow-glow">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-secondary-900 dark:text-white mb-2">
            Join TeamOS
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Create your account to get started
          </p>
        </div>

        {/* Register Card */}
        <div className="card card-hover animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                className="input-modern"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input-modern"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="input-modern pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                isSuccess
                  ? 'bg-success-50 border border-success-200 text-success-700'
                  : 'bg-danger-50 border border-danger-200 text-danger-700'
              }`}>
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger-600" />
                )}
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating account...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Account created!
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-secondary-600 dark:text-secondary-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-secondary-500 dark:text-secondary-400 text-sm">
          <p>© 2024 UnifiedTeamOS. Built for modern teams.</p>
        </div>
      </div>
    </div>
  );
}