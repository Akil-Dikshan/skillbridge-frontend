import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '@/api/authApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(email, password, role);
      // After registration, redirect to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 text-slate-50 border-slate-800 shadow-xl shadow-purple-500/5">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-purple-400">Join SkillBridge</CardTitle>
          <CardDescription className="text-slate-400">
            Create an account to start your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">I want to join as a:</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    checked={role === 'STUDENT'}
                    onChange={() => setRole('STUDENT')}
                    className="text-purple-500 bg-slate-950 border-slate-800 focus:ring-purple-500"
                  />
                  Student
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="MENTOR"
                    checked={role === 'MENTOR'}
                    onChange={() => setRole('MENTOR')}
                    className="text-purple-500 bg-slate-950 border-slate-800 focus:ring-purple-500"
                  />
                  Mentor
                </label>
              </div>
            </div>
            {error && (
              <div className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-purple-500 hover:bg-purple-600 text-slate-950 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <div className="text-sm text-slate-400 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
