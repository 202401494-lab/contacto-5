'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';
import { apiRequest } from '../../../src/lib/api';
import Icon from '../../../src/components/Icon';
import styles from './admin.module.css';

const emptyForm = { nombre: '', email: '', password: '', rol_id: '' };

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRows, roleRows] = await Promise.all([apiRequest('/usuarios'), apiRequest('/usuarios/roles')]);
      setUsers(userRows);
      setRoles(roleRows);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.rol !== 'Administrador') router.replace('/');
  }, [user, router]);
  useEffect(() => { if (user?.rol === 'Administrador') load(); }, [user, load]);

  async function createUser(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await apiRequest('/usuarios', { method: 'POST', body: JSON.stringify({ ...form, rol_id: Number(form.rol_id) }) });
      setForm(emptyForm);
      setShowPassword(false);
      setNotice('El usuario se creó correctamente.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateRole(target, rolId) {
    if (String(target.rol_id) === String(rolId)) return;
    setError('');
    setNotice('');
    try {
      await apiRequest(`/usuarios/${target.id}`, { method: 'PUT', body: JSON.stringify({ rol_id: Number(rolId) }) });
      setNotice(`Se actualizó el rol de ${target.nombre}.`);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deactivate(target) {
    if (!window.confirm(`¿Dar de baja a ${target.nombre}?`)) return;
    setError('');
    setNotice('');
    try {
      await apiRequest(`/usuarios/${target.id}`, { method: 'DELETE' });
      setNotice(`Se dio de baja a ${target.nombre}.`);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (!user || user.rol !== 'Administrador') return null;

  return (
    <section>
      <div className={styles.heading}>
        <div><p className={styles.eyebrow}>PANEL DE CONTROL</p><h1>Administración</h1><p>Gestiona las cuentas y sus permisos de acceso.</p></div>
        <span className={styles.headingIcon}><Icon name="users" size={25} /></span>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}
      {notice && <div className={styles.notice} role="status"><Icon name="check" size={16} />{notice}</div>}

      <div className={styles.layout}>
        <form className={styles.createCard} onSubmit={createUser}>
          <div className={styles.cardHeading}><span><Icon name="plus" size={17} /></span><div><h2>Crear usuario</h2><p>Agrega una cuenta al sistema.</p></div></div>
          <label className={styles.field}><span>Nombre completo</span><input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} maxLength={100} placeholder="Nombre y apellido" required /></label>
          <label className={styles.field}><span>Correo electrónico</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={120} placeholder="persona@correo.com" required /></label>
          <div className={styles.field}><label htmlFor="new-user-password">Contraseña inicial</label><div className={styles.passwordWrap}><input id="new-user-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" placeholder="Define una contraseña" required /><button className={styles.visibilityToggle} type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls="new-user-password" onClick={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'eyeOff' : 'eye'} size={17} /></button></div></div>
          <label className={styles.field}><span>Rol del sistema</span><select value={form.rol_id} onChange={(event) => setForm({ ...form, rol_id: event.target.value })} required><option value="">Selecciona un rol</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}</select></label>
          <button className={styles.createButton} type="submit" disabled={saving || !roles.length}>{saving ? 'Creando usuario…' : 'Crear cuenta'}<Icon name="arrow" size={16} /></button>
        </form>

        <div className={styles.usersCard}>
          <div className={styles.cardHeading}><span><Icon name="users" size={18} /></span><div><h2>Usuarios del sistema</h2><p>{users.length} cuentas registradas</p></div></div>
          {loading ? <div className={styles.loading}>Cargando usuarios…</div> : users.length ? (
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th aria-label="Acciones" /></tr></thead>
                <tbody>{users.map((person) => (
                  <tr key={person.id}>
                    <td><div className={styles.userCell}><span className={styles.avatar}>{person.nombre.charAt(0).toUpperCase()}</span><span><strong>{person.nombre}</strong><small>{person.email}</small></span></div></td>
                    <td><select className={styles.roleSelect} aria-label={`Rol para ${person.nombre}`} value={person.rol_id} onChange={(event) => updateRole(person, event.target.value)} disabled={!person.activo}><option value="">Sin rol</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}</select></td>
                    <td><span className={`${styles.status} ${person.activo ? styles.active : styles.inactive}`}><i />{person.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>{person.activo && person.id !== user.id && <button type="button" className={styles.deactivate} onClick={() => deactivate(person)} title={`Dar de baja a ${person.nombre}`} aria-label={`Dar de baja a ${person.nombre}`}><Icon name="trash" size={16} /></button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className={styles.empty}>No hay usuarios registrados.</div>}
        </div>
      </div>
      <p className={styles.privacy}><Icon name="lock" size={14} />La administración de usuarios está restringida al rol Administrador.</p>
    </section>
  );
}
