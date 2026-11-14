'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../../src/lib/api';
import Icon from '../../../../src/components/Icon';
import styles from './detail.module.css';

function Detail({ icon, label, value }) {
  if (!value) return null;
  return <div className={styles.detailItem}><span className={styles.detailIcon}><Icon name={icon} size={17} /></span><span><small>{label}</small><strong>{value}</strong></span></div>;
}

export default function ContactDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => apiRequest(`/contactos/${id}`).then(setContact).catch((requestError) => setError(requestError.message)), [id]);

  useEffect(() => { load(); }, [load]);

  async function toggleFavorite() {
    setBusy(true);
    try { await apiRequest(`/contactos/${id}/favorito`, { method: 'PATCH' }); await load(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function removeContact() {
    if (!window.confirm(`¿Eliminar a ${contact.nombres} ${contact.apellidos} de tus contactos?`)) return;
    setBusy(true);
    try { await apiRequest(`/contactos/${id}`, { method: 'DELETE' }); router.push('/'); }
    catch (requestError) { setError(requestError.message); setBusy(false); }
  }

  if (error && !contact) return <div className={styles.error} role="alert">{error}<Link href="/" className={styles.return}>Regresar a la agenda</Link></div>;
  if (!contact) return <div className={styles.loading}>Cargando información…</div>;
  const fullName = `${contact.nombres} ${contact.apellidos}`;

  return (
    <section className={styles.page}>
      <Link href="/" className={styles.back}><Icon name="back" size={17} />Volver a mis contactos</Link>
      {error && <div className={styles.error} role="alert">{error}</div>}
      <article className={styles.profileCard}>
        <div className={styles.profileHead}>
          <span className={styles.portrait}>{`${contact.nombres.charAt(0)}${contact.apellidos.charAt(0)}`.toUpperCase()}</span>
          <div className={styles.profileName}><p className={styles.eyebrow}>DETALLE DE CONTACTO</p><h1>{fullName}</h1><span className={styles.relation}>{contact.relacion || 'Contacto'}</span></div>
          <div className={styles.actions}>
            <button type="button" className={`${styles.favorite} ${contact.favorito ? styles.isFavorite : ''}`} onClick={toggleFavorite} disabled={busy}><Icon name="heart" size={17} />{contact.favorito ? 'En favoritos' : 'Agregar a favoritos'}</button>
            <Link href={`/contactos/${id}/editar`} className={styles.edit}><Icon name="edit" size={16} />Editar</Link>
            <button type="button" className={styles.delete} onClick={removeContact} disabled={busy} aria-label="Eliminar contacto"><Icon name="trash" size={17} /></button>
          </div>
        </div>
        <div className={styles.rule} />
        <div className={styles.details}>
          <Detail icon="phone" label="Celular" value={contact.celular} />
          <Detail icon="phone" label="Teléfono fijo" value={contact.telefono_fijo} />
          <Detail icon="mail" label="Correo electrónico" value={contact.correo} />
          <Detail icon="calendar" label="Fecha de nacimiento" value={contact.fecha_nacimiento ? new Date(`${contact.fecha_nacimiento.slice(0, 10)}T00:00:00`).toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} />
          <Detail icon="contact" label="Género" value={contact.genero} />
          <Detail icon="pin" label="Dirección de casa" value={contact.direccion_casa} />
          <Detail icon="pin" label="Dirección de trabajo" value={contact.direccion_trabajo} />
        </div>
        {!contact.celular && !contact.telefono_fijo && !contact.correo && !contact.fecha_nacimiento && !contact.genero && !contact.direccion_casa && !contact.direccion_trabajo &&
          <p className={styles.noDetails}>Aún no hay más información guardada para este contacto.</p>}
      </article>
    </section>
  );
}
