import ProtectedShell from '../../src/components/ProtectedShell';

export default function PrivateLayout({ children }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
