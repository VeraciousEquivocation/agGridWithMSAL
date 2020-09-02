import React, { useState, useCallback } from "react";

export const GlobalContext = React.createContext();

function GlobalContextProvider(props) {
    const [curPage, setCurPage] = useState(null);
    const handleSetCurPage = useCallback((page) => setCurPage(page), []);
    const [tableUrl, setTableUrl] = useState('https://data.cdc.gov/api/views/bi63-dtpu/rows.json');
    const handleSetTableUrl = useCallback((url) => setTableUrl(url), []);

    const contextMemoData = React.useMemo(() => (
        {
            curPage,
            handleSetCurPage,
            tableUrl,
            handleSetTableUrl,
        }), 
        [
            curPage,
            handleSetCurPage,
            tableUrl,
            handleSetTableUrl,
        ]
    );

    return (
        <GlobalContext.Provider value={contextMemoData}>
            {props.children}
        </GlobalContext.Provider>
    )
}

export default React.memo(GlobalContextProvider);