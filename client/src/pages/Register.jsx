import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../services/authApi';
import { setCredentials } from '../store/authSlice';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Button } from '../components/ui/button';

/**
 * Register Page
 * Allows new users to create an account
 */
const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();

  // Formik form configuration
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
        
        // Dispatch action to store user and token
        dispatch(setCredentials({
          user: result.data.user,
          token: result.data.token,
        }));

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        // Handle validation errors from backend
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          // Map validation errors to their respective fields
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            // Map common field names
            if (['name', 'contactNumber', 'contactEmail', 'email', 'password', 'secretCode'].includes(fieldName)) {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          // Handle general API errors
          const errorMessage = err?.data?.error || err?.error || 'Registration failed. Please try again.';
          // Try to determine which field the error relates to
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Fill in your details to get started
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={formik.handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                className="w-full"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.name}</p>
              ) : null}
            </div>

            {/* Contact Number Field */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="1234567890"
                className="w-full"
                value={formik.values.contactNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.contactNumber && formik.errors.contactNumber ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.contactNumber}</p>
              ) : null}
            </div>

            {/* Contact Email Field */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="contact@example.com"
                className="w-full"
                value={formik.values.contactEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.contactEmail && formik.errors.contactEmail ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.contactEmail}</p>
              ) : null}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (for login) <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                className="w-full"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.email}</p>
              ) : null}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Enter password (min 6 characters)"
                className="w-full"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.password}</p>
              ) : null}
            </div>

            {/* Secret Code Field */}
            <div>
              <label htmlFor="secretCode" className="block text-sm font-medium text-gray-700 mb-2">
                Secret Code (for password recovery) <span className="text-red-500">*</span>
              </label>
              <Input
                id="secretCode"
                name="secretCode"
                type="text"
                placeholder="Your secret code (min 4 characters)"
                className="w-full"
                value={formik.values.secretCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.secretCode && formik.errors.secretCode ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.secretCode}</p>
              ) : null}
              <p className="mt-1.5 text-xs text-gray-500">
                ⚠️ Remember this code! You'll need it to reset your password.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">
                  {error?.data?.error || 'An error occurred. Please try again.'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={formik.isSubmitting || isLoading}
              className="w-full"
              size="lg"
            >
              {formik.isSubmitting || isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
