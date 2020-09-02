import React,{useContext} from 'react';
import scss from './Layout.module.scss';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import TopBar from '../TopBar';
import Body from '../Body';

import {AuthContext} from '../../auth/AuthContext';
import {AuthContextDispatches} from '../../auth/AuthContext';

function Layout() {
    
    const {
        onSignIn,
    } = useContext(AuthContextDispatches);
    const {
        account,
        error
    } = useContext(AuthContext);

  return (
	<>
    	<div className={scss.root}>
			<TopBar />
			{!account
			?
			<div className={scss.loginForm}>
				<Paper>
					<h4>Sign In to you Microsoft Account</h4>
					<Button variant="outlined" onClick={onSignIn}>Sign In</Button>
					{error && <div>{error}</div>}
				</Paper>
			</div>
			:
			<Body/>
			}
    	</div>
	</>
  );
}

export default Layout;
