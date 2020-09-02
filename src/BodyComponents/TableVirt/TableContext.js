import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { List } from 'immutable';

import  {GlobalContext} from '../../GlobalContext';
import {ThemeContext} from '../../App';

export const UserTableContextData = React.createContext();
export const UserTableDispatches = React.createContext();


function UserTableContextProvider(props) {

    const GC = React.useContext(GlobalContext);
    const {tableUrl} = GC ? GC : {tableUrl:null};
    
    const [data, updateData] = useState([]);
    const [selectedRows, updateSelectedRows] = useState([]);
    const handleUpdateSelectedRows = useCallback((array) => updateSelectedRows(array), []);

    const [agHeaders, setAgHeaders] = useState([]);
    const [headers, updateHeaders] = useState([]);
    const handleUpdateHeaders = useCallback((array) => updateHeaders(array), []);

    const [firstRender, setFirstRender] = useState(true);
    const toggleFirstRender = useCallback((val) => setFirstRender(oldBool => !oldBool), []);

    const [isError, setIsError] = useState(false);
    const toggleIsError = useCallback((val) => setIsError(oldBool => !oldBool), []);

    const [axiosErrMsg, setAxiosErrMsg] = useState(null);
    const handleSetAxiosErrMsg = useCallback((val) => setAxiosErrMsg(val), []);

    const [isLoading, setIsLoading] = useState(true);
    const toggleIsLoading = useCallback(() => setIsLoading(oldBool => !oldBool), []);

    useEffect(()=> {
        const fetchData = async () => {
            try {
                const result = await axios(tableUrl);
                let colNames = [];
                result.data.meta.view.columns.forEach(col => {
                    if(col.flags){
                        if(col.flags[0]==='hidden')
                            return;
                    }
                    colNames.push({name:col.name,fieldName:col.fieldName,id:col.id, width:240});
                        
                });
                let structuredData = result.data.data.map((row,idx) => {
                    let tempobj = {};
                    for(let i=colNames.length; i>0; i--) {
                        tempobj[colNames[i-1].fieldName] = row.pop();
                    }
                    tempobj.id = idx;
                    tempobj.index = idx;
                    tempobj.edited = false;
                    tempobj.deleted = false;
                    tempobj.new = false;
                    return tempobj;
                });

                // @@ FORMAT FOR AG TABLE END @@ //

                let buildAgHeaders = [];
                colNames.forEach((obj, i) => {
                    // setup first column and checkbox select column
                    if(i===0) {
                        // buildAgHeaders.push({headerName:'ID',field:'id',
                        // // suppressToolPanel: true, REPLACED WITH BELOW ???
                        // suppressColumnsToolPanel : true,
                        // suppressFiltersToolPanel : true,
                        // hide:true,
                        // width:120});
                        buildAgHeaders.push({
                            checkboxSelection: true,
                            headerCheckboxSelection: true,
                            headerCheckboxSelectionFilteredOnly: true,
                            headerName:obj.name,field:obj.fieldName,sortable:true,filter:true,resizable:true
                        });
                    }
                    else
                        buildAgHeaders.push({headerName:obj.name,field:obj.fieldName,sortable:true,filter:true,resizable:true});
                });

                setAgHeaders(buildAgHeaders)
                if(isError)toggleIsError();
                toggleFirstRender();
                updateData(structuredData);
                handleUpdateHeaders(colNames);
            
            } catch (error) {
                console.log('Table data fetch error', error);
                if(firstRender)
                    toggleFirstRender();
                toggleIsError();
                handleSetAxiosErrMsg(error);
            }
            toggleIsLoading();
        }
        if(!isLoading) toggleIsLoading();
        if(selectedRows.length > 0 ) updateSelectedRows([]);
        fetchData();
    }, [tableUrl]);


    // @@ FORMAT FOR AG TABLE @@ //

    // const [colDefs, updateColDefs] = useState([{
    //     headerName: "Make", field: "make", sortable: true, filter: true,
    //     checkboxSelection: true
    //   }, {
    //     headerName: "Model", field: "model", sortable: true, filter: true
    //   },{
    //     headerName: "Price", field: "price", sortable: true, filter: true
    // }]);
    // const [rowData, updateRowData] = useState([{
    //     make: "Toyota", model: "Celica", price: 35000
    //   },{
    //     make: "Ford", model: "Mondeo", price: 32000
    //   },{
    //     make: "Porsche", model: "Boxter", price: 72000
    // }]);

    // immutableList appears to allow me to set initial data, and reference it when reverting rows.
    // even though I do not pull this from the context itself from within agTable.js 
    // I actually set the inital data to data itself, pulled from the context
    const immutableList = List(data);

    const contextMemoData = React.useMemo(() => (
        {
            agHeaders,
            data,
            selectedRows,
            headers,
            isError,
            axiosErrMsg,
            isLoading
        }), 
        [
            agHeaders,
            data,
            selectedRows,
            headers,
            isError,
            axiosErrMsg,
            isLoading
        ]
    );
    const contextMemoDispatches = React.useMemo(() => (
        {
            handleUpdateSelectedRows,
            handleUpdateHeaders
        }), 
        [
            handleUpdateSelectedRows,
            handleUpdateHeaders
        ]
    );

    // if(data.length <= 0 && firstRender) return (<div>Fetching...</div>);
    
    
    if((immutableList.size <=0 || headers.length <= 0) && !isError) return (<div>Setting up data...</div>);

    return (
        <UserTableContextData.Provider value={contextMemoData}>
            <UserTableDispatches.Provider value={contextMemoDispatches}>
                {props.children}
            </UserTableDispatches.Provider>
        </UserTableContextData.Provider>
    )
}

export default React.memo(UserTableContextProvider);