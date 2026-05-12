import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

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
