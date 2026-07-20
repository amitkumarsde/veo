import { useState } from 'react';

import { SearchContext } from '@/context/SearchContext';

export const SearchProvider = ({ children }) => {
    const [searchText, setSearchText] = useState('');

    return (
        <SearchContext.Provider value={{ searchText, setSearchText }}>
            {children}
        </SearchContext.Provider>
    );
};
