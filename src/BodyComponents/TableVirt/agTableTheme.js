// import css1 from 'ag-grid-community/dist/styles/ag-theme-balham.css';
// import css2 from 'ag-grid-community/dist/styles/ag-theme-balham-dark.css';

import { useTheme } from '@material-ui/styles';

///////////////////////////////////////////////////////////////////////////////////
///                                                                             ///
///  This Component is for Conditional importing of css files for Table theme   ///
///                                                                             /// 
///////////////////////////////////////////////////////////////////////////////////

export default function NullComponent() {
    const theme = useTheme();
    if(theme.palette.type === 'dark') {
        // require('ag-grid-community/dist/styles/ag-theme-balham-dark.css');
        require('ag-grid-community/dist/styles/ag-theme-alpine-dark.css');
    } else {
        // require('ag-grid-community/dist/styles/ag-theme-balham.css');
        require('ag-grid-community/dist/styles/ag-theme-alpine.css');
    }
    return null;
}

