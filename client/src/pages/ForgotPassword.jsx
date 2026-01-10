import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Button } from '../components/ui/button';

/**
 * Forgot Password Page
 * Allows users to reset their password using email and secret code
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading, error, isSuccess }] = useForgotPasswordMutation();
  const [showSuccess, setShowSuccess] = useState(false);

  // Formik form configuration
  const formik = useFormik({
    initialValues: {
      email: '',
      secretCode: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
      secretCode: Yup.string()
        .required('Secret code is required')
        .transform((value) => value ? value.trim() : value)
        .min(4, 'Secret code must be at least 4 characters')
        .max(20, 'Secret code cannot exceed 20 characters'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        // Ensure secret code is trimmed and validate length before sending
        const trimmedSecretCode = values.secretCode.trim();
        
        if (trimmedSecretCode.length > 20) {
          setFieldError('secretCode', 'Secret code cannot exceed 20 characters');
          setSubmitting(false);
          return;
        }
        
        await forgotPassword({
          email: values.email.trim().toLowerCase(),
          secretCode: trimmedSecretCode,
          newPassword: values.newPassword,
        }).unwrap();
        
        setShowSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        // Handle validation errors from backend
        if (err?.data?.errors && Array.isArray(err.data.errors)) {
          // Map validation errors to their respective fields
          err.data.errors.forEach((validationError) => {
            const fieldName = validationError.field;
            if (fieldName === 'secretCode' || fieldName === 'email' || fieldName === 'newPassword') {
              setFieldError(fieldName, validationError.message);
            }
          });
        } else {
          // Handle general API errors
          const errorMessage = err?.data?.error || err?.error || 'Password reset failed. Please try again.';
          // Try to determine which field the error relates to
          if (errorMessage.toLowerCase().includes('email')) {
            setFieldError('email', errorMessage);
          } else if (errorMessage.toLowerCase().includes('secret') || errorMessage.toLowerCase().includes('code')) {
            setFieldError('secretCode', errorMessage);
          } else if (errorMessage.toLowerCase().includes('password')) {
            setFieldError('newPassword', errorMessage);
          } else {
            // Default to showing error in a general way
            setFieldError('newPassword', errorMessage);
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (showSuccess || isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been reset successfully. You will be redirected to the login page shortly.
              </p>
            </div>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and secret code to reset your password
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.email}</p>
              ) : null}
            </div>

            {/* Secret Code Field */}
            <div>
              <label htmlFor="secretCode" className="block text-sm font-medium text-gray-700 mb-2">
                Secret Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="secretCode"
                name="secretCode"
                type="text"
                placeholder="Enter your secret code"
                className="w-full"
                maxLength={20}
                value={formik.values.secretCode}
                onChange={(e) => {
                  // Trim whitespace and limit to 20 characters
                  const trimmedValue = e.target.value.trim();
                  if (trimmedValue.length <= 20) {
                    formik.setFieldValue('secretCode', trimmedValue);
                  }
                }}
                onBlur={formik.handleBlur}
              />
              {formik.touched.secretCode && formik.errors.secretCode ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.secretCode}</p>
              ) : null}
              <p className="mt-1.5 text-xs text-gray-500">
                Enter the secret code you provided during registration.
              </p>
            </div>

            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password (min 6 characters)"
                className="w-full"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.newPassword && formik.errors.newPassword ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.newPassword}</p>
              ) : null}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your new password"
                className="w-full"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                <p className="mt-1.5 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              ) : null}
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
                  Resetting password...
                </span>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
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

export default ForgotPassword;

