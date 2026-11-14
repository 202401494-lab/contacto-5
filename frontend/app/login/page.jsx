'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';
import Icon from '../../src/components/Icon';
import styles from './login.module.css';

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace('/');
  }, [ready, user, router]);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || user) return <main className={styles.loading}><span />Preparando tu espacio</main>;

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <Link href="/login" className={styles.brand}><span className={styles.brandMark}><Icon name="contact" size={19} /></span>contactos<span className={styles.dot}>.</span></Link>
        <div className={styles.storyCopy}>
          <span className={styles.storyLabel}><Icon name="spark" size={15} />TU AGENDA PERSONAL</span>
          <h1>Las personas que importan, <em>siempre cerca.</em></h1>
          <p>Un espacio para guardar nombres, historias y esos pequeños detalles que hacen especial cada conexión.</p>
          <div className={styles.quote}><span className={styles.quoteLine} /><span>Hay personas que convierten cualquier lugar en hogar.</span></div>
        </div>
        <div className={styles.art} aria-hidden="true">
          <span className={styles.artRing} />
          <span className={`${styles.avatar} ${styles.avatarOne}`}>A</span>
          <span className={`${styles.avatar} ${styles.avatarTwo}`}>M</span>
          <span className={`${styles.avatar} ${styles.avatarThree}`}>L</span>
          <span className={styles.artCore}><Icon name="heart" size={35} /></span>
          <span className={styles.artDot} />
        </div>
        <small className={styles.footer}>UN LUGAR PARA TUS PERSONAS FAVORITAS</small>
      </section>
      <section className={styles.formSide}>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.mobileBrand}><span className={styles.brandMark}><Icon name="contact" size={19} /></span>contactos<span className={styles.dot}>.</span></div>
          <p className={styles.formEyebrow}>QUÉ BUENO TENERTE DE VUELTA</p>
          <h2>Inicia sesión</h2>
          <p className={styles.formIntro}>Ingresa tus datos para volver a tu agenda.</p>
          {error && <div className={styles.error} role="alert">{error}</div>}
          <label className={styles.field}><span>Correo electrónico</span><span className={styles.inputWrap}><Icon name="mail" size={17} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" required /></span></label>
          <label className={styles.field}><span>Contraseña</span><span className={styles.inputWrap}><Icon name="lock" size={17} /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" required /><button className={styles.visibilityToggle} type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls="login-password" onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} /></button></span></label>
          <button className={styles.submit} disabled={submitting}>{submitting ? 'Ingresando…' : 'Entrar a mi agenda'}<Icon name="arrow" size={17} /></button>
          <p className={styles.privacy}><Icon name="lock" size={14} />Tu espacio es privado y personal.</p>
        </form>
        <span className={styles.copyright}>CONTACTOS · TU AGENDA, A TU MANERA</span>
      </section>
    </main>
  );
}
