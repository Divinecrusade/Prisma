import React, { useState } from 'react';
import { Navigate } from 'react-router';
import { Input } from '@untitledui/base/input/input';
import { Button } from '@untitledui/base/buttons/button';
import { Checkbox } from 'react-aria-components';
import { Mail01, Lock01, AlertCircle } from '@untitledui/icons';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginPageProps {
  onLoginSuccess?: () => void;
  redirectTo?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  redirectTo = '/admin' 
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (formData.email === 'admin@example.com' && formData.password === 'password123') {
        localStorage.setItem('adminAuth', 'authenticated');
        if (formData.rememberMe) {
          localStorage.setItem('adminRememberMe', 'true');
        }
        
        setIsAuthenticated(true);
        onLoginSuccess?.();
      } else {
        setLoginError('Invalid email or password. Please check your credentials and try again.');
      }
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

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox
                isSelected={formData.rememberMe}
                onChange={(isSelected) => handleInputChange('rememberMe', isSelected)}
                className="group flex items-center gap-2 text-sm cursor-pointer"
              >
                <div className="flex h-4 w-4 items-center justify-center rounded border border-primary bg-primary transition group-data-[selected]:border-brand-solid group-data-[selected]:bg-brand-solid">
                  <svg
                    className="h-3 w-3 text-white opacity-0 group-data-[selected]:opacity-100"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-secondary">Remember me</span>
              </Checkbox>

              <Button color="link-color" size="sm">
                Forgot your password?
              </Button>
            </div>

            {/* Login Error Message */}
            {loginError && (
              <div className="rounded-lg bg-error-primary p-4 ring-1 ring-error_subtle ring-inset">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-fg-error-secondary shrink-0" />
                  <p className="text-sm text-error-primary">
                    {loginError}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              color="primary"
              size="lg"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          {/* Development Helper */}
          <div className="mt-6 pt-6 border-t border-secondary">
            <div className="text-center">
              <p className="text-xs text-tertiary mb-2">Development credentials:</p>
              <code className="text-xs bg-secondary px-2 py-1 rounded text-secondary">
                admin@example.com / password123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
