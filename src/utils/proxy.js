const cors_proxy = require('cors-anywhere');

// Define the port for the CORS-anywhere server
const PORT = 8080;

cors_proxy.createServer({
  originWhitelist: [], // Allow all origins during development. Be more restrictive in production.
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: ['cookie', 'cookie2'],
}).listen(PORT, () => {
  console.log(`CORS Anywhere server is running on port ${PORT}`);
});