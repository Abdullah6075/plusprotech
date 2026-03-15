import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../services/authApi';
import { setCredentials } from '../store/authSlice';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ClipboardList, Bell, History, ShieldCheck, Wrench } from 'lucide-react';
import logo from '../assets/logo.png';

const BENEFITS = [
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: 'Track Your Repair',
    desc: 'Check the live status of your device repair anytime, from anywhere.',
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    title: 'View Your Invoices',
    desc: 'Easily access and download all your repair invoices at any time.',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: 'Stay Updated',
    desc: 'Receive updates when your device is ready for pickup.',
  },
  {
    icon: <History className="w-5 h-5" />,
    title: 'Appointment History',
    desc: 'View all your past and upcoming repair appointments in one place.',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const result = await login(values).unwrap();
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
        }));
        navigate(result.data.user?.role === 'admin' ? '/dashboard' : '/');
      } catch (err) {
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['email', 'password'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          const errorMessage = err?.data?.error || err?.error || 'Login failed. Please try again.';
          if (errorMessage.toLowerCase().includes('email')) {
            setFieldError('email', errorMessage);
          } else {
            setFieldError('password', errorMessage);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — benefits ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Brand accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EC4421]" />

        {/* Logo */}
        <Link to="/">
          <img
            src={logo}
            alt="PlusProtech"
            className="h-11 w-auto object-contain"
          />
        </Link>

        {/* Middle content */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#EC4421]" />
              <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Customer Portal</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Your Repairs,<br />
              <span className="text-[#EC4421]">Always in Sight</span>
            </h2>
            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-sm">
              Logging in gives you full visibility over your device repairs. Track progress, view history, and stay informed — all from your personal dashboard.
            </p>
          </div>

          {/* Benefits list */}
          <ul className="flex flex-col gap-5">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#EC4421]/15 rounded-xl flex items-center justify-center text-[#EC4421] shrink-0">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white tracking-tight">{b.title}</p>
                  <p className="text-xs text-gray-500 font-light mt-0.5 leading-relaxed">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
          <Wrench className="w-4 h-4 text-[#EC4421] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            <span className="text-white font-medium">Login is optional.</span> You can always browse our services and book a repair without an account. An account simply helps us keep you updated.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-8">
          <img src={logo} alt="PlusProtech" className="h-10 w-auto object-contain" />
        </Link>

        <div className="w-full max-w-sm flex flex-col gap-7">
          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-0.5 bg-[#EC4421]" />
              <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Customer Login</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Sign in to track your repairs and manage your appointments.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={formik.handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                aria-invalid={formik.touched.email && formik.errors.email ? 'true' : 'false'}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-destructive">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#EC4421] hover:text-[#c93519] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                aria-invalid={formik.touched.password && formik.errors.password ? 'true' : 'false'}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-destructive">{formik.errors.password}</p>
              )}
            </div>

            {/* API Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error?.data?.error || 'An error occurred. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className="w-full bg-[#EC4421] hover:bg-[#c93519] disabled:opacity-60 text-white py-3 rounded-full font-semibold text-sm tracking-tight transition-all shadow-lg shadow-[#EC4421]/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              {formik.isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Register link */}
          <div className="text-center text-sm border-t border-gray-100 pt-5">
            <span className="text-gray-400">New customer? </span>
            <Link
              to="/register"
              className="font-semibold text-[#EC4421] hover:text-[#c93519] transition-colors"
            >
              Create a free account
            </Link>
          </div>

          {/* Browse without login */}
          <div className="text-center">
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
            >
              Continue browsing without logging in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
