'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../src/lib/api';
import Icon from '../../src/components/Icon';
import styles from './contacts.module.css';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (favoritesOnly) params.set('favoritos', 'true');
      const suffix = params.toString() ? `?${params.toString()}` : '';
      setContacts(await apiRequest(`/contactos${suffix}`));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [query, favoritesOnly]);

  useEffect(() => {
    const timer = window.setTimeout(loadContacts, 220);
    return () => window.clearTimeout(timer);
  }, [loadContacts]);

  async function toggleFavorite(id) {
    try {
      await apiRequest(`/contactos/${id}/favorito`, { method: 'PATCH' });
      await loadContacts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeContact(contact) {
    if (!window.confirm(`¿Eliminar a ${contact.nombres} ${contact.apellidos} de tus contactos?`)) return;
    try {
      await apiRequest(`/contactos/${contact.id}`, { method: 'DELETE' });
      await loadContacts();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const totalLabel = contacts.length === 1 ? 'contacto' : 'contactos';
  return (
    <section>
      <div className={styles.welcome}>
        <div>
          <p className={styles.eyebrow}>TU ESPACIO PERSONAL</p>
          <h1>Las personas que <em>hacen tu mundo.</em></h1>
          <p className={styles.intro}>Tu agenda, en un solo lugar. Guarda cada historia importante.</p>
        </div>
        <div className={styles.welcomeArt} aria-hidden="true">
          <span className={styles.orbit} />
          <span className={styles.artCircle}><Icon name="contact" size={46} /></span>
          <span className={styles.artDotOne} />
          <span className={styles.artDotTwo} />
        </div>
      </div>

      <div className={styles.listHeading}>
        <div>
          <h2>Tu agenda</h2>
          <p>{loading ? 'Actualizando…' : `${contacts.length} ${totalLabel} guardados`}</p>
        </div>
        <Link href="/contactos/nuevo" className={styles.addButton}><Icon name="plus" size={18} />Nuevo contacto</Link>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Icon name="search" size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo o teléfono" aria-label="Buscar contactos" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpiar búsqueda"><Icon name="close" size={17} /></button>}
        </label>
        <button type="button" className={`${styles.filter} ${favoritesOnly ? styles.filterActive : ''}`} onClick={() => setFavoritesOnly(!favoritesOnly)}>
          <Icon name="heart" size={17} /> Favoritos
        </button>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {loading ? (
        <div className={styles.loading}><span />Cargando contactos</div>
      ) : contacts.length ? (
        <div className={styles.grid}>
          {contacts.map((contact, index) => (
            <article key={contact.id} className={styles.card} style={{ '--delay': `${Math.min(index, 8) * 45}ms` }}>
              <div className={styles.cardTop}>
                <Link href={`/contactos/${contact.id}`} className={styles.person} aria-label={`Ver a ${contact.nombres} ${contact.apellidos}`}>
                  <span className={styles.initials}>{`${contact.nombres?.charAt(0) || ''}${contact.apellidos?.charAt(0) || ''}`.toUpperCase()}</span>
                  <span className={styles.personCopy}><strong>{contact.nombres} {contact.apellidos}</strong><small>{contact.relacion || 'Contacto'}</small></span>
                </Link>
                <button className={`${styles.heart} ${contact.favorito ? styles.heartActive : ''}`} onClick={() => toggleFavorite(contact.id)} aria-label={contact.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'} title={contact.favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                  <Icon name="heart" size={18} />
                </button>
              </div>
              <div className={styles.cardInfo}>
                {contact.correo && <p><Icon name="mail" size={15} /><span>{contact.correo}</span></p>}
                {(contact.celular || contact.telefono_fijo) && <p><Icon name="phone" size={15} /><span>{contact.celular || contact.telefono_fijo}</span></p>}
              </div>
              <div className={styles.cardActions}>
                <Link href={`/contactos/${contact.id}`} className={styles.detailLink}>Ver detalle <Icon name="arrow" size={15} /></Link>
                <div>
                  <Link href={`/contactos/${contact.id}/editar`} className={styles.iconButton} aria-label="Editar contacto"><Icon name="edit" size={16} /></Link>
                  <button className={`${styles.iconButton} ${styles.deleteButton}`} onClick={() => removeContact(contact)} aria-label="Eliminar contacto"><Icon name="trash" size={16} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}><Icon name={favoritesOnly ? 'heart' : 'contact'} size={25} /></span>
          <h3>{favoritesOnly ? 'Todavía no tienes favoritos' : query ? 'No encontramos coincidencias' : 'Tu agenda empieza aquí'}</h3>
          <p>{favoritesOnly ? 'Marca con el corazón a las personas que quieres tener siempre cerca.' : query ? 'Prueba con otro nombre, correo o número de teléfono.' : 'Agrega tu primer contacto y mantén su información a mano.'}</p>
          {!query && !favoritesOnly && <Link href="/contactos/nuevo" className={styles.addButton}><Icon name="plus" size={18} />Agregar primer contacto</Link>}
        </div>
      )}
    </section>
  );
}
