import {PublicClientApplication} from '@azure/msal-browser'

export const requiresInteraction = errorMessage => {
    if (!errorMessage || !errorMessage.length) {
        return false;
    }

    return (
        errorMessage.indexOf("consent_required") > -1 ||
        errorMessage.indexOf("interaction_required") > -1 ||
        errorMessage.indexOf("login_required") > -1
    );
};

export const fetchMsGraph = async (url, accessToken) => {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    return response.json();
};

export const isIE = () => {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf("MSIE ") > -1;
    const msie11 = ua.indexOf("Trident/") > -1;

    // If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
    // const isEdge = ua.indexOf("Edge/") > -1;

    return msie || msie11;
};

export const GRAPH_SCOPES = {
    OPENID: "openid",
    PROFILE: "profile",
    USER_READ: "User.Read",
    MAIL_READ: "Mail.Read"
};

export const GRAPH_ENDPOINTS = {
    ME: "https://graph.microsoft.com/v1.0/me",
    MAIL: "https://graph.microsoft.com/v1.0/me/messages"
};

export const GRAPH_REQUESTS = {
    LOGIN: {
        scopes: [
            GRAPH_SCOPES.OPENID,
            GRAPH_SCOPES.PROFILE,
            GRAPH_SCOPES.USER_READ
        ]
    },
    EMAIL: {
        scopes: [GRAPH_SCOPES.MAIL_READ]
    }
};

// REPLACE "[ REPLACE ]" with the proper MSAL code
let msalConfig = {
    auth: {
        clientId: "[ REPLACE ]",
        authority: "https://login.microsoftonline.com/[ REPLACE ]",
        validateAuthority: true,
        postLogoutRedirectUri: "https://localhost:3000",
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: isIE()
    },
    system: {
        navigateFrameWait: 0,
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                // https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case 'Error':
                        console.error(message);
                        return;
                    case 'Info':
                        console.info(message);
                        return;
                    case 'Verbose':
                        console.debug(message);
                        return;
                    case 'Warning':
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
            piiLoggingEnabled: false
        },
        windowHashTimeout: 60000,
        iframeHashTimeout: 6000,
        loadFrameTimeout: 0
    }
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
const loginRequest = {
    scopes: ["openid", "profile", "User.Read"]
   };
   
   // Add scopes here for access token to be used at Microsoft Graph API endpoints.
   const tokenRequest = {
    scopes: ["User.Read", "Mail.Read"]
   };

export const myMSALObj = new PublicClientApplication(msalConfig);
