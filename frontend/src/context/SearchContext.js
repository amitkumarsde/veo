import { createContext } from 'react';

// Holds the current search query, shared between the header input and the feed.
export const SearchContext = createContext({
    searchText: '',
    setSearchText: () => {},
});
