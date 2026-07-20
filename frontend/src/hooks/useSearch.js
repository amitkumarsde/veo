import { useContext } from 'react';

import { SearchContext } from '@/context/SearchContext';

// Access the shared search query and its setter.
export const useSearch = () => useContext(SearchContext);
