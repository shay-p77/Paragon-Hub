import React, { useEffect, useRef } from 'react';

interface LoginProps {
  onLogin: (user: GoogleUser) => void;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
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

// Decode JWT token from Google
function decodeJwt(token: string): any {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

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

  const handleCredentialResponse = (response: { credential: string }) => {
    const decoded = decodeJwt(response.credential);

    const user: GoogleUser = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };

    // Store in localStorage for persistence
    localStorage.setItem('paragon_user', JSON.stringify(user));

    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-paragon-dark flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <svg className="w-10 h-10 text-paragon-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="font-cinzel text-4xl font-bold text-white tracking-wider mb-2">PARAGON</h1>
          <p className="text-paragon-gold text-sm font-semibold tracking-[0.3em] uppercase">Enterprise Concierge OS</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-300 text-sm">Sign in to access your command center</p>
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
    </div>
  );
};

export default Login;
