import React, { useState, useCallback, useEffect } from "react";
// import axios from 'axios';
import {
    myMSALObj,
    requiresInteraction,
    fetchMsGraph,
    isIE,
    GRAPH_ENDPOINTS,
    GRAPH_SCOPES,
    GRAPH_REQUESTS
} from "./auth-utils";

export const AuthContext = React.createContext();
export const AuthContextDispatches = React.createContext();

function AuthContextProvider(props) {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);
    const [graphProfile, setGraphProfile] = useState(null);
    const [emailMessages, setEmailMessages] = useState(null);

    const acquireToken = async (request, redirect)=>{
        return myMSALObj.acquireTokenSilent(request).catch(error => {
            // Call acquireTokenPopup (popup window) in case of acquireTokenSilent failure
            // due to consent or interaction required ONLY
            if (requiresInteraction(error.errorCode)) {
                return redirect
                    ? myMSALObj.acquireTokenRedirect(request)
                    : myMSALObj.acquireTokenPopup(request);
            } else {
                console.error('Non-interactive error:', error.errorCode)
            }
        });
    };

    const readMail = useCallback( async (accessToken) => {
        const emailMsgs = await fetchMsGraph(
            GRAPH_ENDPOINTS.MAIL,
            accessToken
        ).catch(() => {
            setError("Unable to fetch email messages.");
        });

        if (emailMsgs) {
            setEmailMessages(emailMsgs);
            if(error != null) setError(null);
        }
    },[error]);

    const onSignIn = useCallback(async (redirect) => {
        if (redirect) {
            return myMSALObj.loginRedirect(GRAPH_REQUESTS.LOGIN);
        }

        const loginResponse = await myMSALObj
            .loginPopup(GRAPH_REQUESTS.LOGIN)
            .catch(err => {
                setError(err.message);
            });

        if (loginResponse) {
            setAccount(loginResponse.account);
            if(error !== null) setError(null);

            const tokenResponse = await acquireToken(
                GRAPH_REQUESTS.LOGIN
            ).catch(err => {
                setError(err.message);
            });

            if (tokenResponse) {
                const gProfile = await fetchMsGraph(
                    GRAPH_ENDPOINTS.ME,
                    tokenResponse.accessToken
                ).catch(() => {
                    setError("Unable to fetch Graph profile.");
                });

                if (gProfile) {
                    setGraphProfile(gProfile);
                }

                if (tokenResponse.scopes.indexOf(GRAPH_SCOPES.MAIL_READ) > 0) {
                    return readMail(tokenResponse.accessToken);
                }
            }
        }
    },[error,readMail]);

    const onSignOut = useCallback(()=>{
        myMSALObj.logout();
    },[]);

    const onRequestEmailToken = useCallback(async () => {
        const tokenResponse = await acquireToken(
            GRAPH_REQUESTS.EMAIL,
        ).catch(e => {
            setError("Unable to acquire access token for reading email.");
        });

        if (tokenResponse) {
            return readMail(tokenResponse.accessToken);
        }
    },[]);

    useEffect(() => {
        const compDidMount = async () => {
            // Handle the redirect flows
            let accountObj = null;
            myMSALObj.handleRedirectPromise().then((tokenResponse) => {
                // Handle redirect response
                if (tokenResponse !== null) {
                    accountObj = tokenResponse.account;
                    setAccount(accountObj);
                    const id_token = tokenResponse.idToken;
                    const access_token = tokenResponse.accessToken;
                } else {
                    const currentAccounts = myMSALObj.getAllAccounts();
                    if (currentAccounts === null) {
                        // No user signed in
                        return;
                    } else if (currentAccounts.length > 1) {
                        // More than one user signed in, find desired user with getAccountByUsername(username)
                    } else {
                        accountObj = currentAccounts[0];
                        setAccount(accountObj);
                    }
                }

                // const username = accountObj.username;
            }).catch((error) => {
                // Handle redirect error
                if (error) {
                    const errorMessage = error.errorMessage ? error.errorMessage : "Unable to acquire access token.";
                    // setState works as long as navigateToLoginRequestUrl: false
                    setError(errorMessage);
                }
            });

            if (accountObj) {
                const tokenResponse = await acquireToken(
                    GRAPH_REQUESTS.LOGIN
                );

                if (tokenResponse) {
                    const gProfile = await fetchMsGraph(
                        GRAPH_ENDPOINTS.ME,
                        tokenResponse.accessToken
                    ).catch(() => {
                        setError("Unable to fetch Graph profile.");
                    });

                    if (gProfile) {
                        setGraphProfile(gProfile);
                    }

                    if (tokenResponse.scopes.indexOf(GRAPH_SCOPES.MAIL_READ) > 0) {
                        return readMail(tokenResponse.accessToken);
                    }
                }
            }
        };
        compDidMount();
    },[]);

    const contextMemoData = React.useMemo(() => (
        {
            account,
            error,
            graphProfile,
        }), 
        [
            account,
            error,
            graphProfile,
        ]
    );

    const contextMemoDispatches = React.useMemo(() => (
        {
            onSignIn,
            onSignOut,
            onRequestEmailToken
        }), 
        [
            onSignIn,
            onSignOut,
            onRequestEmailToken
        ]
    );

    return (
        <AuthContext.Provider value={contextMemoData}>
            <AuthContextDispatches.Provider value={contextMemoDispatches}>
                {props.children}
            </AuthContextDispatches.Provider>
        </AuthContext.Provider>
    )
}

export default React.memo(AuthContextProvider);