import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Define request handlers for the mock server
const handlers = [
  // Example: Mocking a login request
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;

    // Simulate a successful login response
    if (email === 'user@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({ token: 'mocked_token', user: { id: 1, name: 'John Doe' } })
      );
    }

    // Simulate an error response for invalid credentials
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  }),

  // Add more handlers for other endpoints as needed
];

// Setup the mock server
const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());