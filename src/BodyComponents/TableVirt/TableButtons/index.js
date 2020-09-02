import React,{useContext} from 'react';
import scss from './TableButtons.module.scss';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { Divider } from '@material-ui/core';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import InputBase from '@material-ui/core/InputBase';

import MenuList from '@material-ui/core/MenuItem';
import MenuItem from '@material-ui/core/MenuItem';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faPaste } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faRecycle } from '@fortawesome/free-solid-svg-icons'
import { faUndo } from '@fortawesome/free-solid-svg-icons'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import { Typography } from '@material-ui/core';

import Rabbit from '../../Rabbit';

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif!important`,
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 250,
    fontSize: 14,
    border: '1px solid #dadde9',
    padding: 18,
  },
}))(Tooltip);

const AddToolTip = (props) => {
  return (
    <HtmlTooltip
      title={
        <React.Fragment>
          <Typography color="inherit">Copy and Paste New Rows</Typography>
          <Divider />
          <div className={scss.customTooltip}>
            {"Select Rows with check box OR select entire range of rows, then click this button."}
            {`  New rows will be added to the bottom of the grid, and the selected data copied into it`}
          </div>
        </React.Fragment>
      }
      enterDelay={600}
    >
      {props.children}
    </HtmlTooltip>
  )
}

export const MatchTableButtons = (props) => {
    const [open, setOpen] = React.useState(false);
    const [openLoading, setOpenLoading] = React.useState(false);
    const [openExport, setOpenExport] = React.useState(false);
    const [addRowNumber, setAddRowNumber] = React.useState(0);
    const anchorRef = React.useRef(null);
    const anchorRefExport = React.useRef(null);

    const handleCloseLoading = () => {
      setOpenLoading(false);
    }

    const handleAddRowChange = (event) => {
        let num=parseInt(event.target.value)
        if(Number.isNaN(num)) {
            return;
        }
        setAddRowNumber(num);
    };
    const handleExportDataClick = (event, index) => {
        setOpenExport(false)
    };
  
    const handleToggle = (add) => {
        if(add===true) {
            setOpen((prevOpen) => !prevOpen);
        } else {
            setOpenExport((prevOpen) => !prevOpen);
        }
    };
  
    const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
        setOpen(false);
    };
    const handleCloseExport = (event) => {
      if (anchorRefExport.current && anchorRefExport.current.contains(event.target)) {
        return;
      }
        setOpenExport(false);
    };
    const handleAddMultiple = () => {
      setOpen(false)
      props.onAddRow(addRowNumber)
      setAddRowNumber(0)
    }

    return (
      <>
        <Grid className={scss.topBtnRow} container direction="row" alignItems="flex-start">
            <Grid item className={scss.topBtnSpacing}>
                <Button onClick={props.onRefresh} variant="contained" color="default">
				            <FontAwesomeIcon icon={faSync} className={scss.leftIcon} />
                    Refresh
                </Button>
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
              <ButtonGroup className={scss.btnGrpVertAlgnSync} variant="contained" color="primary" ref={anchorRef} aria-label="split button">
                <Button onClick={props.onAddRow}>
				          <FontAwesomeIcon icon={faPlus} size='lg' className={scss.leftIcon} />
                    Add
                </Button>
                <Button
                  color="primary"
                  size="small"
                  aria-controls={open ? 'split-button-add' : undefined}
                  aria-expanded={open ? 'true' : undefined}
                  aria-label="Add Row(s)"
                  aria-haspopup="menu"
                  onClick={()=>handleToggle(true)}
                >
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
              <Popper placement={'bottom-start'} className={scss.popperZIndex} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom-start' ? 'center top' : 'center bottom',
                    }}
                  >
                    <Paper elevation={2}>
                      <ClickAwayListener onClickAway={handleClose}>
                          <Grid container direction="row" alignItems="flex-start">
                              <Grid item xs={4}>
                                  <Typography variant={'button'} >Rows: </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                  <InputBase
                                    value={addRowNumber}
                                    onChange={handleAddRowChange}
                                    placeholder="Number"
                                    inputProps={{ 'aria-label': 'Number of Rows to Add' }}
                                  />
                              </Grid>
                              <Grid item xs={4}>
                                  <Button onClick={handleAddMultiple} variant="outlined" color="primary">
                                    GO
                                  </Button>
                              </Grid>

                          </Grid>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
                {
                  !props.rangeSelected && !props.rowsSelected
                  ? <Button disabled={!props.rangeSelected && !props.rowsSelected} onClick={props.onAddAndPaste} variant="contained" color="default">
				                <FontAwesomeIcon icon={faPaste} className={scss.leftIcon} />
                        Paste New Row(s)
                    </Button>
                  : <AddToolTip>
                      <Button disabled={!props.rangeSelected && !props.rowsSelected} onClick={props.onAddAndPaste} variant="contained" color="default">
				                  <FontAwesomeIcon icon={faPaste} className={scss.leftIcon} />
                          Paste New Row(s)
                      </Button>
                    </AddToolTip>
                }
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
                <Button disabled={!props.rowsSelected} variant="contained" color="default" onClick={props.onDeleteRow}>
				    <FontAwesomeIcon icon={faTrash} className={scss.leftIcon} />
                    Delete Row(s)
                </Button>
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
                <Button disabled={!props.rowsSelected} variant="contained" color="default" onClick={props.onRevertRow}>
				            <FontAwesomeIcon icon={faUndo} className={scss.leftIcon} />
                    Revert Row(s)
                </Button>
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
                <Button disabled={!props.rowsSelected} onClick={props.onUndeleteRow} variant="contained" color="default">
                    <span className="fa-layers fa-fw">
                        <FontAwesomeIcon icon={faRecycle} color="green"/>
                    </span>
                    Undelete Row(s)
                </Button>
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
              <ButtonGroup className={scss.btnGrpVertAlgnSync} variant="contained" color="primary" ref={anchorRefExport} aria-label="split button">
                <Button onClick={null}>
				          <FontAwesomeIcon icon={faDownload} className={scss.leftIcon} />
                    Export
                </Button>
                <Button
                  color="primary"
                  size="small"
                  aria-controls={openExport ? 'split-button-export' : undefined}
                  aria-expanded={openExport ? 'true' : undefined}
                  aria-label="Export"
                  aria-haspopup="menu"
                  onClick={handleToggle}
                >
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
              <Popper placement={'bottom-start'} className={scss.popperZIndex} open={openExport} anchorEl={anchorRefExport.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom-start' ? 'center top' : 'center bottom',
                    }}
                  >
                    <Paper elevation={2}>
                      <ClickAwayListener onClickAway={handleCloseExport}>
                          <Grid container direction="row" alignItems="flex-start">
                            <MenuList id="split-button-export" disableGutters={true} >
                                <MenuItem
                                  key={'exportItemOne'}
                                  onClick={(event) => handleExportDataClick(event)}
                                >
                                  <Typography variant={'h5'}>Export Data</Typography>
                                </MenuItem>
                            </MenuList>
                          </Grid>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Grid>
            <Grid item className={scss.topBtnSpacing}>
                <Button onClick={() => setOpenLoading(oldV => !oldV)} variant="contained" color="default">
				            <FontAwesomeIcon icon={faSave} className={scss.leftIcon} />
                    Save
                </Button>
            </Grid>
        </Grid>
        <Rabbit handleClose={handleCloseLoading} open={openLoading} />
      </>
    )
}