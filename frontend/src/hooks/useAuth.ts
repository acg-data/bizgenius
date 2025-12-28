import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_image_url?: string | null;
  is_authenticated: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setState({
            user: data,
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null
          });
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null
        });
      }
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: 'Failed to fetch user'
      });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = '/api/auth/login';
  }, []);

  const logout = useCallback(() => {
    window.location.href = '/api/auth/logout';
  }, []);

  return {
    ...state,
    login,
    logout,
    refetch: fetchUser
  };
}

export default useAuth;
