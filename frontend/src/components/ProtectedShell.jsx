'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import styles from './ProtectedShell.module.css';

export default function ProtectedShell({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return <main className={styles.loading}><span className={styles.loader} />Cargando tu agenda</main>;
  }

  return <><Navbar /><main className={styles.main}>{children}</main></>;
}
