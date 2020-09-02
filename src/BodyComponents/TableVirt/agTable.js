import React, {useContext,useState, useEffect, useMemo, useCallback, useRef} from 'react';
// import axios from 'axios';
// import { List } from 'immutable';
import clsx from 'clsx';
import scss from './TableVirt.module.scss';

import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
// import 'ag-grid-community/dist/styles/ag-theme-balham.css';
// import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';
import TableTheme from './agTableTheme';
import 'ag-grid-enterprise';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {UserTableContextData} from './TableContext';
import FilterList from '@material-ui/icons/FilterList';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import { useTheme } from '@material-ui/styles';
import { makeStyles } from '@material-ui/core/styles';
import {MatchTableButtons} from './TableButtons';
import Confirm from './TableButtons/ConfirmationAlert';

////////////////////////////////

// api.refreshCells() <- To manually run value change detection to refresh all visible cells call

////////////////////////////////

const useStyles = makeStyles(theme => ({
    rowNew: {
        backgroundColor: theme.palette.success.light+'!important',
    },
    rowHasChange: {
        backgroundColor: theme.palette.warning.light+'!important',
    },
    rowDeleted: {
        backgroundColor: theme.palette.error.light+'!important',
      color: '#fff!important',
      textDecoration: 'line-through!important'
    },
    inheritDecoration: {
        textDecoration: 'inherit'
    },
    newDigitColor:{
        color: theme.palette.success.light+'!important',
    },
    editedDigitColor:{
        color: theme.palette.warning.light+'!important',

    },
    deletedDigitColor:{
        color: theme.palette.error.light+'!important',

    },
    newButtonColor:{
        backgroundColor: theme.palette.success.light+'!important',
    },
    editedButtonColor:{
        backgroundColor: theme.palette.warning.light+'!important',
    },
    deletedButtonColor:{
        backgroundColor: theme.palette.error.light+'!important',
        color: '#fff'
    },
    filterButtons: {
        padding: '20px 50px'
    }
    
  }));

const AgTable = () => {
    const [gridApi, setGridApi] = useState(null);
    const [colApi, setColApi] = useState(null);
    const [initialData, setInitialData] = useState([])
    const [filter,setFilter] = useState(null);
    const forceUpdate = useState(false)[1]
    const [countersTracker, setCountersTracker] = useState({
        new: 0,
        edited: 0,
        deleted: 0,
    })
    const [openAlert, toggleAlert] = useState(false);
    const [rowsSelectedBool, setRowsSelectedBool] = useState(false);
    const [rangeSelectedBool, setRangeSelectedBool] = useState(false);
    const resetConfirm = useState({
        open:false,
        title:'',
        message:'',
        callBack:null,
    })[0]
    const [confirmState, setConfirmState] = useState(resetConfirm)

    const triFilter = useRef([]);
    const rightClickRevertNode = useRef(null);
    const gridApiRef = useRef(null);

    const handleCountersTracker = useCallback((refresh = false) => {
        let countNewRows = gridApiRef.current.getModel().rowsToDisplay.filter(node=>node.data.new === true).length
        let countEditedRows = gridApiRef.current.getModel().rowsToDisplay.filter(node=>node.data.edited === true && node.data.deleted === false && node.data.new === false).length
        let countDeletedRows = gridApiRef.current.getModel().rowsToDisplay.filter(node=>node.data.deleted === true).length
    
        if(refresh) {
            setCountersTracker({
                new:0,
                edited:0,
                deleted:0,
            })
        } else {
            setCountersTracker({
                new:countNewRows,
                edited:countEditedRows,
                deleted:countDeletedRows,
            })
        }
    },[gridApi])

    const context = useContext(UserTableContextData);
        const {
            agHeaders,
            data,
            isLoading
        } = context;

    const classes = useStyles();

    const theme = useTheme();

    useEffect(()=>{
        let unreferencedDataBuilder = data.map(row=>{
            return {...row}
        })
        setInitialData(unreferencedDataBuilder);
    },[]) // Do Once on Load

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        toggleAlert(false);
    };

    const externalFilterChanged = newValue => {
        let updatedTriFilter = [...triFilter.current]
        if(updatedTriFilter.includes(newValue)) {
            updatedTriFilter = updatedTriFilter.filter(str => str !== newValue)
            triFilter.current = updatedTriFilter
        } else {
            updatedTriFilter.push(newValue)
            triFilter.current = updatedTriFilter
        }
        
        gridApi.onFilterChanged();
        forceUpdate(prev=>!prev)
      };
    
    const isExternalFilterPresent = () => {
        return triFilter.current.length > 0;
      };
    
    const doesExternalFilterPass = node => {
        let strArr = [...triFilter.current]
        let strBuilder = `${strArr.includes('new') ? 'new' : ''}${strArr.includes('edited') ? 'edited' : ''}${strArr.includes('deleted') ? 'deleted' : ''}`

        switch (strBuilder) {
          case 'new':
            return node.data.new === true;
          case 'newedited':
            return node.data.new === true || (node.data.edited === true && node.data.deleted === false);
          case 'newdeleted':
            return node.data.new === true || node.data.deleted === true;
          case 'newediteddeleted':
            return node.data.new === true || node.data.edited === true || node.data.deleted === true;
          case 'edited':
            return node.data.edited === true;
          case 'editeddeleted':
            return node.data.edited === true || node.data.deleted === true;
          case 'deleted':
            return node.data.deleted === true;
          default:
            return true;
        }
      };
    const rightClickFilter = (params,filters) => {
        if(params.api.columnController.gridApi.filterManager.quickFilter) {  
            setFilter(params.api.columnController.gridApi.filterManager.quickFilter + " , " + params.value);
            params.api.deselectAll();
            params.api.setQuickFilter(params.api.columnController.gridApi.filterManager.quickFilter + " , " + params.value);
            toggleAlert(true);
        } else {
            setFilter(params.value);
            params.api.deselectAll();
            params.api.setQuickFilter(params.value);
            toggleAlert(true);
        }
    };

    let getContextMenuItems = (params) => {
        var result = [
          {
            name: "Quick Filter " + params.value,
            action: () => rightClickFilter(params,filter)
          },
          {
            name: "Revert Row " + params.node.rowIndex,
            action: ()=>{rightClickRevertNode.current=params.node; onRevertRow()}
          },
          "separator",
          "copy",
          "copyWithHeaders",
          "paste",
          "separator",
          "export"
        ];
        return result;
    };
    let onCellValueChanged = (params) => {
        let rowNode = gridApi.getRowNode(params.node.id)
        let updatedData = {...params.data} //this is flat data (not nested), should be okay to clone
        updatedData.edited = true;
        rowNode.setData(updatedData)
        handleCountersTracker()
    }
    let defaultColDef = useMemo(()=>{ return{
        editable: params => params.data.deleted === false,
        cellClass: classes.inheritDecoration
    }})
    let statusBar = useMemo(()=>{ return{
        statusPanels: [
          {
            statusPanel: 'agTotalRowCountComponent',
            align: 'center',
          }
        ],
    }})
    let rowClassRules = {
        [classes.rowHasChange]: function(params) {
            return params.data.edited && !params.data.new
        },
        [classes.rowDeleted]: function(params) {
            return params.data.deleted === true
        },
        [classes.rowNew]: function(params) {
            return params.data.new === true
        },
    }
    let refresh = () => {
        let unreferencedDataBuilder = initialData.map(row=>{
            return {...row}
        })
        gridApi.setRowData(unreferencedDataBuilder)
        handleConfirmClose()
        handleCountersTracker(true)
    }
    let onRefresh = () => {
        setConfirmState({
            open:true,
            title:'Confirm Refresh',
            message: 'This will undo all changes and revert to initial data.\n\nAre you sure you want to continue?',
            callBack:refresh
        })
    }
    let onAddRow = (ttlNum = 0) => {
        let newRowObj = {}
        agHeaders.filter(obj=>{
            return typeof(obj.hide) === 'undefined' || obj.hide === false
        }).forEach(col=>{
            newRowObj = ({...newRowObj,[col.field]:null});
        })
        newRowObj.deleted = false
        newRowObj.edited = false
        newRowObj.new = true

        let newRowArr = []
        if(typeof(ttlNum) === 'number' && ttlNum > 0) {
            for(let i = ttlNum; i--; i>0) {
                newRowArr.push({...newRowObj})
            }
        } else {
            newRowArr.push(newRowObj)
        }
        gridApi.applyTransaction({ add: newRowArr })
        handleCountersTracker()
    }
    let onDeleteRow = () => {
        let selectedNodes = gridApi.getSelectedNodes()
        if(selectedNodes.length === 0) return;
        let newRowsToDelete = [];
        selectedNodes.forEach(node => {
            let updatedData = {...node.data}
            if(updatedData.new) {
                // if we supply IDs, we can then use {id:node.id}
                // autogeneration doesn't provide the data with an ID to match, would have to create on Add Row
                newRowsToDelete.push(node.data);
            } else {
                updatedData.deleted = true;
                node.setData(updatedData);
            }
        })
        if(newRowsToDelete.length > 0) {
            gridApi.applyTransaction({remove:newRowsToDelete})
        }
        handleCountersTracker()
    }
    let onRevertRow = () => {
        // WHY DOES THIS BREAK GRIDAPI, rightclick nulls it????
        // let selectedNodes = passedInNode ? [gridApi.getRowNode(passedInNode.id)] : gridApi.getSelectedNodes()

        let selectedNodes; 
        if(rightClickRevertNode.current){
            setGridApi(rightClickRevertNode.current.gridApi)
            selectedNodes = [rightClickRevertNode.current]
        } else 
            selectedNodes =gridApi.getSelectedNodes()
        
        if(selectedNodes.length === 0) return;
        selectedNodes.forEach(node => {
            if(node.data.new) return; // there is no original data to revert to
            //clone orig data

            let originalData = initialData.find((originalDataNode)=>{
                return originalDataNode.id === node.data.id
            })
            node.setData({...originalData})
        })
        handleCountersTracker()
        rightClickRevertNode.current = null
    }
    let onUndeleteRow = () => {
        let selectedNodes = gridApi.getSelectedNodes()
        if(selectedNodes.length === 0) return;
        selectedNodes.forEach(node => {
            let updatedData = {...node.data}
            updatedData.deleted = false;
            node.setData({...updatedData})
        })
        handleCountersTracker()
    }
    let handleConfirmClose = () => {
        setConfirmState(resetConfirm)
    }
    let onGridReadyFunc = params => {
        setGridApi(params.api);
        gridApiRef.current = params.api
        setColApi(params.columnApi)
    };
    let onSelectionChanged = () => {
        if(gridApi.getCellRanges().length > 0) gridApi.clearRangeSelection()
        if(gridApi.getSelectedNodes().length > 0 && !rowsSelectedBool) {
            setRowsSelectedBool(true)
        } else if(gridApi.getSelectedNodes().length <= 0) {
            setRowsSelectedBool(false)
        }
    }
    let onRangeSelectionChanged = (params) => {
        if(gridApi.getSelectedNodes().length > 0) gridApi.deselectAll()
        if(gridApi.getCellRanges().length > 0) {
            if(gridApi.getCellRanges()[0].columns.length === params.columnApi.getAllGridColumns().length && !rangeSelectedBool) {
                setRangeSelectedBool(true)
            } else if(gridApi.getCellRanges()[0].columns.length < params.columnApi.getAllGridColumns().length && rangeSelectedBool) {
                setRangeSelectedBool(false)
            }
        }
    }
    let onAddAndPaste = () => {
        let startIdx = 0;
        let deduct = 0;
        if(rangeSelectedBool) {
            //handle range
            let cellRanges = gridApi.getCellRanges()
            startIdx = cellRanges[0].startRow.rowIndex
            let rowIdxArr = []
            for(let i = startIdx; i <= cellRanges[0].endRow.rowIndex; i++ ) {
                rowIdxArr.push(i)
            }

            let nodeDataToCopy = gridApi.getModel().rowsToDisplay.filter(node=>{
                return rowIdxArr.includes(node.rowIndex)
            })
            nodeDataToCopy = nodeDataToCopy.map(n => {
                let updatedData = {...n.data}
                updatedData.deleted = false
                updatedData.edited = false
                updatedData.new = true
                return updatedData
            })
            deduct = nodeDataToCopy.length

            gridApi.applyTransaction({ add: nodeDataToCopy })
            handleCountersTracker()
        } else if(gridApi.getSelectedNodes().length > 0) {
            
            let nodeDataToCopy = gridApi.getSelectedNodes().map(n => {
                let updatedData = {...n.data}
                updatedData.deleted = false
                updatedData.edited = false
                updatedData.new = true
                return updatedData
            })
            
            deduct = nodeDataToCopy.length

            gridApi.applyTransaction({ add: nodeDataToCopy })
            handleCountersTracker()
        } else {
            return;
        }
        // scrolls to the first column, or first editable column. you can pass in the correct index
        var firstCol = colApi.getAllDisplayedColumns()[0];
        gridApi.ensureColumnVisible(firstCol);
        gridApi.ensureIndexVisible(gridApi.getDisplayedRowCount()-deduct, 'top');
        return;
    }
    let onFirstDataRendered = params => {
        params.api.sizeColumnsToFit();
      };
    return (
        isLoading ? <div>LOADING</div>
		:<>
        <Confirm 
            open={confirmState.open}
            title={confirmState.title}
            message={confirmState.message}
            confirmCallBack={confirmState.callBack}
            handleClose={handleConfirmClose}
        />
        <MatchTableButtons 
            rowsSelected={rowsSelectedBool} 
            rangeSelected={rangeSelectedBool} 
            onAddAndPaste={onAddAndPaste} 
            onAddRow={onAddRow} 
            onRevertRow={onRevertRow} 
            onDeleteRow={onDeleteRow} 
            onRefresh={onRefresh} 
            onUndeleteRow={onUndeleteRow} 
        />
        {
            filter !== null &&
            <div className={scss.filterChips}>
                <Chip
                    size="small"
                    icon={<FilterList />}
                    label={filter}
                    onDelete={()=>{setFilter(null);gridApi.setQuickFilter(null);}}
                    color={'primary'}
                  />
            </div>
        }
        <div id='AGTABLEDIV' style={{ height: 'calc(100% - 100px)', width: '100%' }} className={theme.palette.type === 'dark' ? "ag-theme-alpine-dark" : "ag-theme-alpine"}>
            <TableTheme />
            <Snackbar
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                open={openAlert}
                autoHideDuration={2000}
                onClose={handleClose}
                ContentProps={{
                  'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">Rows have been Deselected</span>}
                action={[
                  <IconButton
                    key="close"
                    aria-label="close"
                    color="inherit"
                    onClick={handleClose}
                  >
                    <CloseIcon />
                  </IconButton>,
                ]}
            />
            <AgGridReact
                onFirstDataRendered={onFirstDataRendered}
                onGridReady={ onGridReadyFunc }
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                onRangeSelectionChanged={onRangeSelectionChanged}
                suppressRowClickSelection={true}
                enableRangeSelection={true}
                suppressMultiRangeSelection={true}
                columnDefs={agHeaders}
                defaultColDef={defaultColDef}
                rowData={data}
                statusBar={statusBar}
                cacheQuickFilter={true}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
                getContextMenuItems={w=>getContextMenuItems(w)}
                rowClassRules={rowClassRules}
                onCellValueChanged={onCellValueChanged}
                animateRows={true}
            >
            </AgGridReact>
        </div>
        <Grid 
          container
          direction="row"
          justify="flex-end"
          alignItems="center"
          className={classes.filterButtons}
        >
            <Grid 
                item
                container
                direction="row"
                justify="flex-end"
                alignItems="center" 
            >
                <Typography className={scss.filterButtons}>Filter By : </Typography>
                <Button 
                    variant={'outlined'}
                    className={clsx(scss.filterButtons,[triFilter.current.includes('new') && classes.newButtonColor])}
                    onClick={() => externalFilterChanged('new')}
                >Inserts: <span className={clsx(scss.filterDigit, [!triFilter.current.includes('new') && classes.newDigitColor])}>
                    {countersTracker.new}
                    </span>
                </Button>
                <Button 
                    variant={'outlined'}
                    className={clsx(scss.filterButtons,[triFilter.current.includes('edited') && classes.editedButtonColor])}
                    onClick={() => externalFilterChanged('edited')}
                >Updates: <span className={clsx(scss.filterDigit, [!triFilter.current.includes('edited') && classes.editedDigitColor])}>
                    {countersTracker.edited}
                    </span>
                </Button>
                <Button 
                    variant={'outlined'}
                    className={clsx(scss.filterButtons,[triFilter.current.includes('deleted') && classes.deletedButtonColor])}
                    onClick={() => externalFilterChanged('deleted')}
                >Deletes: <span className={clsx(scss.filterDigit, [!triFilter.current.includes('deleted') && classes.deletedDigitColor])}>
                    {'\n\n'+countersTracker.deleted}
                    </span>
                </Button>
            </Grid>
        </Grid>
        </>
    )
};

export default React.memo(AgTable);
