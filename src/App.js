import React, {useState, useCallback} from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import Layout from './components/Layout';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme  } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import AuthContextProvider from './auth/AuthContext';

import GlobalContextProv from './GlobalContext';

export const ThemeContext = React.createContext();

function App() {
    
    const [theme, setTheme] = useState({
        palette: {
          type: "light"
        }
    });

    const handleToggleTheme = useCallback(() => {
        let newPaletteType = theme.palette.type === "light" ? "dark" : "light";
        let themeBuilder = {
            palette: {
              type: newPaletteType
            }
        };
        if(newPaletteType === "dark") {
            themeBuilder.palette = {
                primary: {
                  main: blue[200],
                },
                secondary: {
                  main: red[200],
                },
                type: newPaletteType
            };
        } else {
            themeBuilder.palette = {
                type: newPaletteType
            };
        }
        setTheme(themeBuilder);
    },[theme]);

    const themeContextMemo = React.useMemo(() => (
        {
            handleToggleTheme,
        }), 
        [
            handleToggleTheme,
        ]
    );

	const muiTheme = createMuiTheme(theme);
  return (
	<>
        <ThemeContext.Provider value={themeContextMemo}>
	    	<ThemeProvider theme={muiTheme}>
                <AuthContextProvider>
                    <GlobalContextProv>
	    	        <CssBaseline />
        	        <Layout />
                    </GlobalContextProv>
                </AuthContextProvider>
	    	</ThemeProvider>
        </ThemeContext.Provider>
	</>
  );
}

export default App;
