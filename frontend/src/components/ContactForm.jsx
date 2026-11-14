'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';
import Icon from './Icon';
import styles from './ContactForm.module.css';

const fields = [
  { name: 'nombres', label: 'Nombres', required: true, placeholder: 'Ej. Ana María', autocomplete: 'given-name' },
  { name: 'apellidos', label: 'Apellidos', required: true, placeholder: 'Ej. López Rivera', autocomplete: 'family-name' },
  { name: 'celular', label: 'Celular', placeholder: '+503 7000 0000', autocomplete: 'tel' },
  { name: 'telefono_fijo', label: 'Teléfono fijo', placeholder: 'Número de casa' },
  { name: 'correo', label: 'Correo electrónico', type: 'email', placeholder: 'persona@correo.com', autocomplete: 'email' },
  { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
  { name: 'direccion_casa', label: 'Dirección de casa', placeholder: 'Calle, colonia, ciudad', wide: true },
  { name: 'direccion_trabajo', label: 'Dirección de trabajo', placeholder: 'Lugar de trabajo', wide: true }
];

export default function ContactForm({ initialData = {}, contactId, heading, description }) {
  const router = useRouter();
  const [values, setValues] = useState(() => Object.fromEntries([
    ...fields.map(({ name }) => [name, initialData[name] || '']),
    ['genero', initialData.genero || ''],
    ['relacion', initialData.relacion || '']
  ]));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiRequest(contactId ? `/contactos/${contactId}` : '/contactos', {
        method: contactId ? 'PUT' : 'POST',
        body: JSON.stringify(values)
      });
      router.push(contactId ? `/contactos/${contactId}` : '/');
      router.refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formIntro}>
        <span className={styles.formIcon}><Icon name="contact" size={21} /></span>
        <div><h2>{heading}</h2><p>{description}</p></div>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}
      <div className={styles.fields}>
        {fields.map((field) => (
          <label key={field.name} className={`${styles.field} ${field.wide ? styles.wide : ''}`}>
            <span>{field.label}{field.required && <b> *</b>}</span>
            <input name={field.name} type={field.type || 'text'} placeholder={field.placeholder} autoComplete={field.autocomplete} value={values[field.name]} onChange={change} required={field.required} maxLength={field.name === 'correo' ? 120 : ['celular', 'telefono_fijo'].includes(field.name) ? 30 : ['nombres', 'apellidos'].includes(field.name) ? 100 : undefined} />
          </label>
        ))}
        <label className={styles.field}>
          <span>Género</span>
          <select name="genero" value={values.genero} onChange={change}>
            <option value="">Selecciona una opción</option><option>Masculino</option><option>Femenino</option><option>Otro</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>Relación personal</span>
          <select name="relacion" value={values.relacion} onChange={change}>
            <option value="">Selecciona una opción</option><option>Familia</option><option>Amigo</option><option>Trabajo</option><option>Otro</option>
          </select>
        </label>
      </div>
      <p className={styles.requiredNote}>* Campos obligatorios</p>
      <div className={styles.actions}>
        <button className={styles.cancel} type="button" onClick={() => router.back()}>Cancelar</button>
        <button className={styles.submit} type="submit" disabled={saving}>{saving ? 'Guardando…' : contactId ? 'Guardar cambios' : 'Guardar contacto'}</button>
      </div>
    </form>
  );
}
