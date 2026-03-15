import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../services/authApi';
import { Input } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
                <CardDescription>
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                size="lg"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email and secret code to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.email && formik.errors.email ? 'true' : 'false'}
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-sm text-destructive">{formik.errors.email}</p>
                ) : null}
              </div>

              {/* Secret Code Field */}
              <div className="space-y-2">
                <Label htmlFor="secretCode">
                  Secret Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="secretCode"
                  name="secretCode"
                  type="text"
                  placeholder="Enter your secret code"
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
                  aria-invalid={formik.touched.secretCode && formik.errors.secretCode ? 'true' : 'false'}
                />
                {formik.touched.secretCode && formik.errors.secretCode ? (
                  <p className="text-sm text-destructive">{formik.errors.secretCode}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Enter the secret code you provided during registration.
                </p>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter new password (min 6 characters)"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.newPassword && formik.errors.newPassword ? 'true' : 'false'}
                />
                {formik.touched.newPassword && formik.errors.newPassword ? (
                  <p className="text-sm text-destructive">{formik.errors.newPassword}</p>
                ) : null}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'true' : 'false'}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <p className="text-sm text-destructive">{formik.errors.confirmPassword}</p>
                ) : null}
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error?.data?.error || 'An error occurred. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={formik.isSubmitting || isLoading}
                className="w-full"
                size="lg"
              >
                {formik.isSubmitting || isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm pt-4 border-t">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

