import { createContext, useContext, useState } from 'react';
import { isTokenValid } from '../utils/jwtUtils';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('adminToken');
    const stored = localStorage.getItem('adminUser');
    if (!isTokenValid(token)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return null;
    }
    return stored ? JSON.parse(stored) : null;
  });

  const loginAdmin = (adminData, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminContext);
