function getGitHubUrl() {
    const rootUrl = "https://github.com/login/oauth/authorize";

    const CLIENT_ID = import.meta.env.DEV 
        ? import.meta.env.VITE_GITHUB_CLIENT_ID
        : import.meta.env.VITE_GITHUB_CLIENT_ID_PROD;

    const REDIRECT_URI = import.meta.env.DEV
        ? "http://localhost:5173/auth/github-callback"
        : "https://byte-rank.netlify.app/auth/github-callback";

    const options = {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: "read:user user:email", // We ask for Profile AND Email access
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
}

export default getGitHubUrl;