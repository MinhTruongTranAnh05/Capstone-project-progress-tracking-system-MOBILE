import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import type { GoogleSignInButtonProps } from './GoogleSignInButton';

interface GoogleIdentity {
  initialize: (options: { client_id: string; callback: (result: { credential: string }) => void; auto_select: boolean }) => void;
  renderButton: (element: HTMLElement, options: { type: string; theme: string; size: string; text: string; locale: string }) => void;
}

let scriptPromise: Promise<GoogleIdentity> | undefined;
function loadGoogle(): Promise<GoogleIdentity> {
  if (!scriptPromise) {
    scriptPromise = new Promise<GoogleIdentity>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        const google = (window as Window & { google?: { accounts: { id: GoogleIdentity } } }).google;
        if (google) resolve(google.accounts.id);
        else reject(new Error('Không thể khởi tạo đăng nhập Google.'));
      };
      script.onerror = () => { script.remove(); reject(new Error('Không thể tải Google. Vui lòng kiểm tra kết nối và tải lại trang.')); };
      document.head.appendChild(script);
    }).catch((error) => { scriptPromise = undefined; throw error; });
  }
  return scriptPromise;
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const container = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  current.current = props;
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let pending = false;
    loadGoogle().then((google) => {
      if (!active || !container.current) return;
      google.initialize({
        client_id: props.clientId,
        auto_select: false,
        callback: async ({ credential }) => {
          if (!active || pending || current.current.disabled) return;
          pending = true;
          current.current.onBusyChange(true);
          try { await current.current.onCredential(credential); }
          catch (error) { current.current.onError(error); }
          finally { pending = false; if (active) current.current.onBusyChange(false); }
        },
      });
      google.renderButton(container.current, { type: 'standard', theme: 'outline', size: 'large', text: 'signin_with', locale: 'vi' });
    }).catch((error: Error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [props.clientId]);

  return <>
    <div ref={container} inert={props.disabled} aria-disabled={props.disabled}
      style={{ display: 'flex', justifyContent: 'center', minHeight: 44, opacity: props.disabled ? 0.5 : 1 }} />
    {!!error && <Text accessibilityRole="alert" style={{ color: '#DC2626', fontSize: 12 }}>{error}</Text>}
  </>;
}
