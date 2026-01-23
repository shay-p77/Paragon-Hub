import React, { useEffect, useRef } from 'react';
import { API_URL } from '../config';

interface LoginProps {
  onLogin: (user: GoogleUser) => void;
}

export interface GoogleUser {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture: string;
  avatarColor: string;
  role: string;
  status: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '375584053864-58t5khqj1js8uqnp2rqsl4svp6l2hha9.apps.googleusercontent.com';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
          shape: 'rectangular',
        });
      }
    };

    // Check if Google script is loaded
    if (window.google) {
      initializeGoogle();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogle();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      // Send token to backend for verification and user creation/lookup
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const user: GoogleUser = await res.json();

      // Store in localStorage for persistence
      localStorage.setItem('paragon_user', JSON.stringify(user));

      onLogin(user);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
      {/* Background pattern image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("/paragon-hub-pattern.svg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-6 sm:mb-8">
          <img
            src="/paragon-login-page-logo.svg"
            alt="Paragon Logo"
            className="w-36 h-36 sm:w-48 sm:h-48 mb-4 mx-auto"
          />
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-wider mb-2">PARAGON</h1>
          <p className="text-paragon-gold text-xs sm:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase">Enterprise Concierge OS</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700 p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-slate-400 text-sm">Sign in to access your command center</p>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center mb-6">
            <div ref={googleButtonRef} className="google-signin-button"></div>
          </div>

          {/* Info text */}
          <div className="text-center my-6">
            <p className="text-xs text-slate-400">Secure authentication via Google</p>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              By signing in, you agree to Paragon's terms of service and privacy policy.
              Your session will be securely managed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Paragon Concierge Services. All rights reserved.
          </p>
        </div>
      </div>

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-paragon/5 via-transparent to-slate-900/50 pointer-events-none" />
    </div>
  );
};

export default Login;
