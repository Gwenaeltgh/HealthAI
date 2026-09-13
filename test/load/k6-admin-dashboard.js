import http from 'k6/http';
import { check, fail, sleep } from 'k6';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:15002';
const EMAIL = __ENV.K6_ADMIN_EMAIL;
const PASSWORD = __ENV.K6_ADMIN_PASSWORD;

export const options = {
  scenarios: {
    dashboard: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '30s', target: 20 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1500'],
  },
};

function ensureCreds() {
  if (!EMAIL || !PASSWORD) {
    fail('Missing env: K6_ADMIN_EMAIL and K6_ADMIN_PASSWORD');
  }
}

function login() {
  const payload = JSON.stringify({ email: EMAIL, password: PASSWORD });
  const res = http.post(`${BASE_URL}/api/admin/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login status 200': (r) => r.status === 200,
  });

  return res;
}

let loggedIn = false;

function ensureLoggedIn() {
  if (loggedIn) return;
  ensureCreds();
  const res = login();
  if (res.status !== 200) {
    fail(`Login failed with status ${res.status}`);
  }
  loggedIn = true;
}

export default function () {
  ensureLoggedIn();
  const dash = http.get(`${BASE_URL}/api/admin/dashboard`);
  check(dash, {
    'dashboard status 200': (r) => r.status === 200,
  });
  sleep(0.2);
}
