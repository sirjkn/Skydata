import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { login } from '../lib/auth';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      
      if (user) {
        // Successful login
        navigate('/');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error: any) {
      if (error.message === 'NO_CONNECTION') {
        setError('No internet connection. Please check your connection and try again.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC]">
      {/* Header */}
      <header className="bg-[#36454F] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div 
            className="flex items-center gap-3 cursor-pointer w-fit"
            onClick={() => navigate('/')}
          >
            <div className="bg-[#6B7F39] rounded-lg p-2">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Skyway Suites</h1>
              <p className="text-xs text-gray-300">Kenya's Premier Property Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#36454F] text-center">
                Welcome Back
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Sign in to your account to continue
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#36454F] mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="w-full border-2 border-gray-300 focus:border-[#6B7F39]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#36454F]">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/reset-password')}
                      className="text-sm text-[#6B7F39] hover:text-[#5a6930] font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full border-2 border-gray-300 focus:border-[#6B7F39]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-lg py-6"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-[#6B7F39]"
                >
                  Back to Home
                </Button>
              </div>

              {/* Create Account Link */}
              <div className="mt-4 text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-[#6B7F39] hover:text-[#5a6930] font-semibold"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}