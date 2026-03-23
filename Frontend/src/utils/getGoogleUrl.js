function getGoogleUrl(){
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const REDIRECT_URI = import.meta.env.DEV
        ? 'http://localhost:5173/auth/google-callback'
        : 'https://byte-rank.netlify.app/auth/google-callback';

    const options = {
        // Must match what is in userAuth.js and Google Console
        redirect_uri: REDIRECT_URI, 
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, 
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
};

export default getGoogleUrl;