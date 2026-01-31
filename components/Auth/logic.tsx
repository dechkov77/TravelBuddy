import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address').max(255);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(100);
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);

export const useAuthLogic = () => {
  const { signUp, signIn, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSignUp = async () => {
    setLoading(true);

    try {
      nameSchema.parse(signUpData.name);
      emailSchema.parse(signUpData.email);
      passwordSchema.parse(signUpData.password);

      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.name);

      if (error) {
        return {
          success: false,
          error: error.message || 'Sign up failed',
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0].message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);

    try {
      emailSchema.parse(signInData.email);
      passwordSchema.parse(signInData.password);

      const { error } = await signIn(signInData.email, signInData.password);

      if (error) {
        return {
          success: false,
          error: 'Invalid email or password. Please try again.',
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0].message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    activeTab,
    setActiveTab,
    signUpData,
    setSignUpData,
    signInData,
    setSignInData,
    handleSignUp,
    handleSignIn,
  };
};
