import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useState } from 'react';

const schema = z.object({
  username: z.string()
    .min(3, 'At least 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function SignupPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      setServerError('');
      await registerUser(data.username, data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err?.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥏</div>
          <h1 className="text-3xl font-extrabold text-forest-800">dihgolf</h1>
          <p className="text-stone-500 mt-1">Join the community.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-5">Create account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              placeholder="discgolfer42"
              error={errors.username?.message}
              hint="Letters, numbers, underscores only"
              {...register('username')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="text-sm text-stone-500 text-center mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
