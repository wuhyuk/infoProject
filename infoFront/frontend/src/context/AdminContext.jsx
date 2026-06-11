import { createContext, useContext, useState } from 'react';
import { isTokenValid } from '../utils/jwtUtils';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = sessionStorage.getItem('adminToken');
    const stored = sessionStorage.getItem('adminUser');
    if (!isTokenValid(token)) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      return null;
    }
    return stored ? JSON.parse(stored) : null;
  });

  const loginAdmin = (adminData, token) => {
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminUser', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminContext);
