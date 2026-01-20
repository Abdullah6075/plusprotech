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
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.name && formik.errors.name ? 'true' : 'false'}
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="text-sm text-destructive">{formik.errors.name}</p>
                ) : null}
              </div>

              {/* Contact Number Field */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber">
                  Contact Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  placeholder="1234567890"
                  value={formik.values.contactNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.contactNumber && formik.errors.contactNumber ? 'true' : 'false'}
                />
                {formik.touched.contactNumber && formik.errors.contactNumber ? (
                  <p className="text-sm text-destructive">{formik.errors.contactNumber}</p>
                ) : null}
              </div>

              {/* Contact Email Field */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Contact Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={formik.values.contactEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.contactEmail && formik.errors.contactEmail ? 'true' : 'false'}
                />
                {formik.touched.contactEmail && formik.errors.contactEmail ? (
                  <p className="text-sm text-destructive">{formik.errors.contactEmail}</p>
                ) : null}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email (for login) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.email && formik.errors.email ? 'true' : 'false'}
                />
                {formik.touched.email && formik.errors.email ? (
                  <p className="text-sm text-destructive">{formik.errors.email}</p>
                ) : null}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Enter password (min 6 characters)"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.password && formik.errors.password ? 'true' : 'false'}
                />
                {formik.touched.password && formik.errors.password ? (
                  <p className="text-sm text-destructive">{formik.errors.password}</p>
                ) : null}
              </div>

              {/* Secret Code Field */}
              <div className="space-y-2">
                <Label htmlFor="secretCode">
                  Secret Code (for password recovery) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="secretCode"
                  name="secretCode"
                  type="text"
                  placeholder="Your secret code (min 4 characters)"
                  value={formik.values.secretCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={formik.touched.secretCode && formik.errors.secretCode ? 'true' : 'false'}
                />
                {formik.touched.secretCode && formik.errors.secretCode ? (
                  <p className="text-sm text-destructive">{formik.errors.secretCode}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  ⚠️ Remember this code! You'll need it to reset your password.
                </p>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm pt-4 border-t">
              <span className="text-muted-foreground">Already have an account? </span>
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

export default Register;
