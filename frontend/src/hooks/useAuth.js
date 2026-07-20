import { useContext } from 'react';

import { AuthContext } from '@/context/AuthContext';

// Access the authenticated user and its setter.
export const useAuth = () => useContext(AuthContext);
