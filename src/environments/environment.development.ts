export const environment = {
    production: false,
    apiUrl:
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000/api'
      : 'https://notes-app-8y8i.vercel.app/api',
};
