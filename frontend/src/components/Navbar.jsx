'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.rol === 'Administrador';

  function signOut() {
    logout();
    router.replace('/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Contactos, inicio">
          <span className={styles.brandMark}><Icon name="contact" size={19} /></span>
          <span>contactos<span className={styles.brandDot}>.</span></span>
        </Link>
        <button className={styles.menuButton} onClick={() => setOpen(!open)} aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`} aria-label="Navegación principal">
          <Link className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`} href="/" onClick={() => setOpen(false)}>Mis contactos</Link>
          {isAdmin && <Link className={`${styles.navLink} ${pathname.startsWith('/admin') ? styles.active : ''}`} href="/admin" onClick={() => setOpen(false)}>Administración</Link>}
          <div className={styles.profile}>
            <span className={styles.avatar}>{user?.nombre?.trim().charAt(0).toUpperCase() || 'U'}</span>
            <span className={styles.profileName}>{user?.nombre}</span>
            <span className={styles.role}>{user?.rol === 'Administrador' ? 'Admin' : 'Estándar'}</span>
          </div>
          <button className={styles.logout} onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión">
            <Icon name="logout" size={18} /><span className={styles.logoutText}>Salir</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
