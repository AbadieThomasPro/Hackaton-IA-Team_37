// Build de production (Docker/nginx) : le front et le back sont deux
// conteneurs distincts, le navigateur appelle donc le back sur son port expose.
export const environment = {
  apiBaseUrl: 'http://localhost:3000/api',
};
