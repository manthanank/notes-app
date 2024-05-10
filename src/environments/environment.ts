export const environment = {
    production: false,
    apiUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000/api/notes' : 'https://notes-app-eta-coral.vercel.app/api/notes'
};
