'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Icon from '../../../../../src/components/Icon';
import ContactForm from '../../../../../src/components/ContactForm';
import { apiRequest } from '../../../../../src/lib/api';
import styles from '../../../form-page.module.css';

export default function EditContactPage() {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest(`/contactos/${id}`).then(setContact).catch((requestError) => setError(requestError.message));
  }, [id]);

  return (
    <section>
      <Link href={`/contactos/${id}`} className={styles.back}><Icon name="back" size={17} />Volver al detalle</Link>
      <div className={styles.heading}><p className={styles.eyebrow}>ACTUALIZA SU INFORMACIÓN</p><h1>Editar contacto</h1><p>Mantén los datos de tu agenda al día.</p></div>
      {error ? <div className={styles.error} role="alert">{error}</div> : contact ? <ContactForm initialData={contact} contactId={id} heading="Información de contacto" description="Modifica los datos que quieras actualizar." /> : <div className={styles.loading}>Cargando contacto…</div>}
    </section>
  );
}
