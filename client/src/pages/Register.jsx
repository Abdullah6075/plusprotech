import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../services/authApi';
import { setCredentials } from '../store/authSlice';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, ClipboardList, Bell, History, KeyRound, Wrench } from 'lucide-react';
import logo from '../assets/logo.png';

const BENEFITS = [
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: 'Track Your Repairs',
    desc: 'Get real-time updates on your device repair status from any device.',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: 'Ready Notifications',
    desc: "We'll let you know the moment your device is repaired and ready.",
  },
  {
    icon: <History className="w-5 h-5" />,
    title: 'Full Appointment History',
    desc: 'View and manage all your past repair appointments easily.',
  },
  {
    icon: <KeyRound className="w-5 h-5" />,
    title: 'Secure & Private',
    desc: 'Your data is safe with us. We never share your personal information.',
  },
];

const Field = ({ id, label, error, touched, children }) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</Label>
    {children}
    {touched && error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();

  const formik = useFormik({
    initialValues: {
      name: '',
      contactNumber: '',
      contactEmail: '',
      email: '',
      password: '',
      secretCode: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .required('Name is required'),
      contactNumber: Yup.string()
        .matches(/^[0-9]{10,15}$/, 'Please enter a valid contact number (10-15 digits)')
        .required('Contact number is required'),
      contactEmail: Yup.string()
        .email('Please enter a valid contact email')
        .required('Contact email is required'),
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      secretCode: Yup.string()
        .min(4, 'Secret code must be at least 4 characters')
        .max(20, 'Secret code cannot exceed 20 characters')
        .required('Secret code is required'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const result = await register(values).unwrap();
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
        }));
        navigate('/');
      } catch (err) {
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (['name', 'contactNumber', 'contactEmail', 'email', 'password', 'secretCode'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          const errorMessage = err?.data?.error || err?.error || 'Registration failed. Please try again.';
          if (errorMessage.toLowerCase().includes('email') && !errorMessage.toLowerCase().includes('contact')) {
            setFieldError('email', errorMessage);
          } else {
            setFieldError('email', errorMessage);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#EC4421]" />

        <Link to="/">
          <img src={logo} alt="PlusProtech" className="h-11 w-auto object-contain" />
        </Link>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#EC4421]" />
              <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">New Customer</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Create Your<br />
              <span className="text-[#EC4421]">Free Account</span>
            </h2>
            <p className="text-gray-400 text-sm font-light leading-relaxed max-w-sm">
              Join PlusProtech and get full visibility over your device repairs — from booking to pickup, all in one place.
            </p>
          </div>

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

        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
          <Wrench className="w-4 h-4 text-[#EC4421] shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            <span className="text-white font-medium">It&apos;s completely free.</span> No subscription, no hidden fees. Your account simply helps us serve you better.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-8">
          <img src={logo} alt="PlusProtech" className="h-10 w-auto object-contain" />
        </Link>

        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Heading */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-0.5 bg-[#EC4421]" />
              <span className="text-[#EC4421] text-xs font-semibold tracking-[0.2em] uppercase">Customer Register</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              Fill in your details below to get started with your free account.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="name" label="Full Name" error={formik.errors.name} touched={formik.touched.name}>
                <Input
                  id="name" name="name" type="text" placeholder="John Doe"
                  value={formik.values.name}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                  aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
                />
              </Field>

              <Field id="contactNumber" label="Contact Number" error={formik.errors.contactNumber} touched={formik.touched.contactNumber}>
                <Input
                  id="contactNumber" name="contactNumber" type="tel" placeholder="3097627500"
                  value={formik.values.contactNumber}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                  aria-invalid={formik.touched.contactNumber && formik.errors.contactNumber ? 'true' : 'false'}
                />
              </Field>
            </div>

            <Field id="contactEmail" label="Contact Email" error={formik.errors.contactEmail} touched={formik.touched.contactEmail}>
              <Input
                id="contactEmail" name="contactEmail" type="email" placeholder="contact@example.com"
                value={formik.values.contactEmail}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                aria-invalid={formik.touched.contactEmail && formik.errors.contactEmail ? 'true' : 'false'}
              />
            </Field>

            <Field id="email" label="Email (used for login)" error={formik.errors.email} touched={formik.touched.email}>
              <Input
                id="email" name="email" type="email" placeholder="you@example.com"
                value={formik.values.email}
                onChange={formik.handleChange} onBlur={formik.handleBlur}
                className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                aria-invalid={formik.touched.email && formik.errors.email ? 'true' : 'false'}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="password" label="Password" error={formik.errors.password} touched={formik.touched.password}>
                <PasswordInput
                  id="password" name="password" placeholder="Min. 6 characters"
                  value={formik.values.password}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                  aria-invalid={formik.touched.password && formik.errors.password ? 'true' : 'false'}
                />
              </Field>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="secretCode" className="text-sm font-medium text-gray-700">Secret Code</Label>
                <Input
                  id="secretCode" name="secretCode" type="text" placeholder="For password recovery"
                  value={formik.values.secretCode}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  className="focus-visible:ring-[#EC4421]/40 focus-visible:border-[#EC4421]"
                  aria-invalid={formik.touched.secretCode && formik.errors.secretCode ? 'true' : 'false'}
                />
                {formik.touched.secretCode && formik.errors.secretCode && (
                  <p className="text-xs text-destructive">{formik.errors.secretCode}</p>
                )}
                <p className="text-xs text-gray-400">⚠️ Remember this — needed to reset your password.</p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error?.data?.error || 'An error occurred. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className="w-full bg-[#EC4421] hover:bg-[#c93519] disabled:opacity-60 text-white py-3 rounded-full font-semibold text-sm tracking-tight transition-all shadow-lg shadow-[#EC4421]/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-1"
            >
              {formik.isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create My Account'
              )}
            </button>
          </form>

          <div className="text-center text-sm border-t border-gray-100 pt-5">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-semibold text-[#EC4421] hover:text-[#c93519] transition-colors">
              Sign in here
            </Link>
          </div>

          <div className="text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
              Continue browsing without an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
