import React from 'react';
// import clsx from 'clsx';
// import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import scss from './Rabbit.module.scss';

const Rabbit = (props) => {

    return (
        <Dialog onClose={props.handleClose} aria-labelledby="simple-dialog-title" open={props.open}>
          <div className={scss.container}>
            <div className={scss.sky}></div>
            <div className={scss.clouds} ></div>
            <div className={scss.ground} ></div>
            <div className={scss.rabbit} ></div>
          </div>
        </Dialog>
    );
}

export default React.memo(Rabbit);
