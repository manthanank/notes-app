export const environment = {
  production: false,
  apiUrl:
    window.location.hostname === 'localhost'
      ? 'https://notes-app-eta-coral.vercel.app/api'
      : 'https://notes-app-eta-coral.vercel.app/api',
  trackingApiUrl: 'https://visitor-tracking-api.vercel.app/api/visit',
};
