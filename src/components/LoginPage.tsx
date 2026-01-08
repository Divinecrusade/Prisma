import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Input } from '@untitledui/base/input/input';
import { Button } from '@untitledui/base/buttons/button';
import { Mail01, Lock01, AlertCircle } from '@untitledui/icons';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  
  // Get redirect path from location state or default to /admin
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        setLoginError(result.message || 'Invalid email or password. Please check your credentials and try again.');
      }
      // If successful, the auth context will update and trigger redirect
    } catch {
      setLoginError('An error occurred during login. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary">
            <Lock01 className="h-6 w-6 text-fg-brand-primary" />
          </div>
          <h2 className="mt-6 text-display-sm font-semibold text-primary">
            Admin Access
          </h2>
          <p className="mt-2 text-md text-tertiary">
            Sign in to access the UX Research administration panel
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-primary py-8 px-4 shadow-lg rounded-xl sm:px-10 ring-1 ring-primary ring-inset">
          <div className="space-y-6" onKeyDown={handleKeyPress}>
            {/* Email Field */}
            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              isRequired
              isInvalid={!!errors.email}
              icon={Mail01}
              hint={errors.email}
            />

            {/* Password Field */}
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              isRequired
              isInvalid={!!errors.password}
              icon={Lock01}
              hint={errors.password}
            />

            {/* Error Message */}
            {loginError && (
              <div className="rounded-lg bg-error-secondary p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-fg-error-secondary flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-error-primary">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onPress={handleSubmit}
              isDisabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          {/* Development Helper */}
          <div className="mt-6 pt-6 border-t border-secondary">
            <div className="text-center">
              <p className="text-xs text-tertiary mb-2">Development credentials:</p>
              <code className="text-xs bg-secondary px-2 py-1 rounded text-secondary">
                admin@example.com / admin123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
