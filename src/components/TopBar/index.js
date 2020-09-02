import React,{useContext} from 'react';
import clsx from 'clsx';
import scss from './TopBar.module.scss';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import InvertColors from '@material-ui/icons/InvertColors';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp';
import {AuthContext} from '../../auth/AuthContext';
import {AuthContextDispatches} from '../../auth/AuthContext';

import {ThemeContext} from '../../App';

const TopBar = (props) => {
    const {handleToggleTheme} = React.useContext(ThemeContext);

    
    const {
        onSignOut,
    } = useContext(AuthContextDispatches);
    const {
        account,
    } = useContext(AuthContext);
    return (
            <Toolbar className={scss.Toolbar}>
                <div className={scss.grow} />
                {account &&
                    <React.Fragment>
                    <div className={clsx(scss.invertBtn,scss.acct)} >
                        <p>{account.username.split('.')[0]}</p>
                        <div><AccountCircle fontSize='small' /></div>
                    </div>
                    <div className={scss.invertBtn} >
                        <IconButton size='small' onClick={onSignOut} aria-label="Logout">
                            <ExitToApp fontSize='small'/>
                        </IconButton>
                    </div>
                    </React.Fragment>
                }
                <div className={scss.invertBtn} >
                    <IconButton size='small' onClick={handleToggleTheme} aria-label="Switch Theme">
                        <InvertColors fontSize='small'/>
                    </IconButton>
                </div>
          </Toolbar>
    );
}

export default React.memo(TopBar);
