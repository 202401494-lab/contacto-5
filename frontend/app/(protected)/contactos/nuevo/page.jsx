import Link from 'next/link';
import Icon from '../../../../src/components/Icon';
import ContactForm from '../../../../src/components/ContactForm';
import styles from '../../form-page.module.css';

export default function NewContactPage() {
  return (
    <section>
      <Link href="/" className={styles.back}><Icon name="back" size={17} />Volver a mis contactos</Link>
      <div className={styles.heading}><p className={styles.eyebrow}>UN NUEVO CAPÍTULO</p><h1>Agregar contacto</h1><p>Guarda los datos de alguien importante para ti.</p></div>
      <ContactForm heading="Información de contacto" description="Los campos con * son necesarios para guardar." />
    </section>
  );
}
