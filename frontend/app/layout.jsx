import './globals.css';
import { AuthProvider } from '../src/context/AuthContext';

export const metadata = {
  title: 'Contactos | Tu agenda personal',
  description: 'Una forma cálida y sencilla de mantener cerca a las personas importantes.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
