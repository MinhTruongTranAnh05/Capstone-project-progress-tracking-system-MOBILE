const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const axios = require('axios');

const root = path.resolve(__dirname, '..');

// Execute the real TS services with an in-memory storage boundary, without loading native Expo modules.
function createHarness(initialToken = null) {
  const disk = {
    token: initialToken, user: null, clears: 0,
    async getToken() { return this.token; },
    async setToken(token) { this.token = token; },
    async setUser(user) { this.user = user; },
    async clear() { this.token = null; this.user = null; this.clears++; },
  };
  const modules = new Map();
  function load(filename) {
    filename = path.resolve(root, filename);
    if (modules.has(filename)) return modules.get(filename).exports;
    if (filename === path.join(root, 'src/services/storage.ts')) return { storage: disk };
    if (filename === path.join(root, 'src/constants/config.ts')) {
      return { config: { API_URL: 'https://api.example.test/api/v1', API_TIMEOUT: 15000 } };
    }
    const module = { exports: {} };
    modules.set(filename, module);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const localRequire = (name) => {
      if (name.startsWith('@/')) return load(path.join(root, 'src', name.slice(2)) + '.ts');
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), name) + '.ts');
      return require(name);
    };
    new Function('require', 'module', 'exports', source)(localRequire, module, module.exports);
    return module.exports;
  }
  const { sessionStore: store } = load('src/services/sessionStore.ts');
  const api = load('src/services/api.ts').default;
  const { authService } = load('src/services/authService.ts');
  return { store, api, disk, authService, load };
}

const student = { id: 'student-1', email: 'student@example.test', fullName: 'Sinh viên', role: 'STUDENT', status: 'ACTIVE', campus: 'HO_CHI_MINH' };
function response(config, data) { return { config, data, status: 200, statusText: 'OK', headers: {} }; }
function httpError(config, status, errorCode) {
  return new axios.AxiosError('HTTP error', 'ERR_BAD_RESPONSE', config, null, {
    config, status, statusText: 'Error', headers: {}, data: { status, errorCode },
  });
}
async function signIn(harness, user = student, token = 'token-1') {
  const revision = harness.store.begin();
  await harness.store.accept(revision, { accessToken: token, user });
  return revision;
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

for (const role of ['STUDENT', 'GROUP_LEADER']) {
  test(`accepts an active ${role} and persists a verified session`, async () => {
    const h = createHarness();
    await signIn(h, { ...student, role });
    assert.equal(h.store.getSnapshot().user.role, role);
    assert.equal(h.disk.token, 'token-1');
  });
}

test('denies Admin/Coordinator and any unknown role before credentials are stored', async () => {
  for (const role of ['ADMIN', 'COORDINATOR', 'unsupported-role']) {
    const h = createHarness();
    await assert.rejects(signIn(h, { ...student, role }), { code: 'WEB_ONLY', message: 'Vui lòng dùng phiên bản Web' });
    assert.equal(h.store.getSnapshot().user, null);
    assert.equal(h.disk.token, null);
  }
});

test('denies inactive, suspended, pending and rejected accounts', async () => {
  for (const status of ['INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL', 'REJECTED']) {
    const h = createHarness();
    await assert.rejects(signIn(h, { ...student, status }), { code: 'ACCOUNT_INACTIVE' });
    assert.equal(h.disk.token, null);
  }
});

test('does not grant access from a saved token or cached user before server verification', async () => {
  const h = createHarness('saved-token');
  h.disk.user = student;
  const revision = h.store.begin();
  assert.equal(await h.store.restoreToken(revision), 'saved-token');
  assert.equal(h.store.getSnapshot().user, null);
  h.api.defaults.adapter = async (config) => {
    assert.equal(config.url, '/auth/me');
    assert.equal(config.headers.get('Authorization'), 'Bearer saved-token');
    return response(config, { ...student, role: 'ADMIN' });
  };
  await assert.rejects(h.store.accept(revision, { accessToken: 'saved-token', user: await h.authService.getCurrentUser() }), { code: 'WEB_ONLY' });
  assert.equal(h.store.getSnapshot().user, null);
});

test('network failure while verifying a saved session keeps it unverified and retryable', async () => {
  const h = createHarness('saved-token');
  const revision = h.store.begin();
  await h.store.restoreToken(revision);
  h.api.defaults.adapter = async (config) => { throw new axios.AxiosError('Network Error', 'ERR_NETWORK', config); };
  await assert.rejects(h.authService.getCurrentUser());
  assert.equal(h.store.getSnapshot().user, null);
  assert.equal(h.disk.token, 'saved-token');
});

test('authenticated 401 clears the session and notifies subscribers once for concurrent failures', async () => {
  const h = createHarness();
  await signIn(h);
  let loggedOut = 0;
  h.store.subscribe(() => { if (!h.store.getSnapshot().token) loggedOut++; });
  h.api.defaults.adapter = async (config) => { throw httpError(config, 401, 'UNAUTHORIZED'); };
  const results = await Promise.allSettled([h.api.get('/groups'), h.api.get('/notifications')]);
  assert.equal(results.every((result) => result.status === 'rejected'), true);
  assert.equal(loggedOut, 1);
  assert.equal(h.disk.clears, 1);
  assert.equal(h.disk.token, null);
  assert.equal(h.store.getSnapshot().user, null);
  assert.match(h.store.getSnapshot().notice, /đăng nhập lại/);
});

test('403 denies the action without clearing the authenticated session', async () => {
  const h = createHarness();
  await signIn(h);
  h.api.defaults.adapter = async (config) => { throw httpError(config, 403, 'FORBIDDEN'); };
  await assert.rejects(h.api.get('/topics'));
  assert.equal(h.store.getSnapshot().user.id, student.id);
  assert.equal(h.disk.clears, 0);
});

test('public auth requests omit Bearer credentials and their 401 cannot expire an active session', async () => {
  const h = createHarness();
  await signIn(h);
  const requests = [];
  h.api.defaults.adapter = async (config) => {
    requests.push(config.url);
    assert.equal(config.headers.has('Authorization'), false);
    throw httpError(config, 401, 'INVALID_CREDENTIALS');
  };
  await assert.rejects(h.authService.login({ email: student.email, password: 'incorrect' }));
  await assert.rejects(h.authService.loginWithGoogle({ idToken: 'invalid', campus: student.campus }));
  assert.deepEqual(requests, ['/auth/login', '/auth/google']);
  assert.equal(h.store.getSnapshot().token, 'token-1');
});

test('email and Google login services never persist an unapproved response themselves', async () => {
  const h = createHarness();
  h.api.defaults.adapter = async (config) => response(config, { accessToken: 'staff-token', user: { ...student, role: 'ADMIN' } });
  const login = await h.authService.login({ email: student.email, password: 'password' });
  await assert.rejects(h.store.accept(h.store.begin(), login), { code: 'WEB_ONLY' });
  const google = await h.authService.loginWithGoogle({ idToken: 'google-token', campus: student.campus });
  await assert.rejects(h.store.accept(h.store.begin(), google), { code: 'WEB_ONLY' });
  assert.equal(h.disk.token, null);
  assert.equal(h.disk.user, null);
});

test('a delayed 401 from an old request cannot log out the next account', async () => {
  const h = createHarness();
  await signIn(h);
  const started = deferred();
  const finish = deferred();
  h.api.defaults.adapter = async (config) => {
    started.resolve();
    await finish.promise;
    throw httpError(config, 401, 'UNAUTHORIZED');
  };
  const oldRequest = h.api.get('/groups');
  const rejection = assert.rejects(oldRequest);
  await started.promise;
  await signIn(h, { ...student, id: 'student-2' }, 'token-2');
  finish.resolve();
  await rejection;
  assert.equal(h.store.getSnapshot().user.id, 'student-2');
  assert.equal(h.disk.token, 'token-2');
});

test('successful data from the previous session is discarded after switching accounts', async () => {
  const h = createHarness();
  await signIn(h);
  const started = deferred();
  const finish = deferred();
  h.api.defaults.adapter = async (config) => {
    started.resolve();
    await finish.promise;
    return response(config, { private: 'old account data' });
  };
  const rejection = assert.rejects(h.api.get('/groups'), { code: 'SESSION_CHANGED' });
  await started.promise;
  await signIn(h, { ...student, id: 'student-2' }, 'token-2');
  finish.resolve();
  await rejection;
});

test('logout during a delayed disk save cannot resurrect credentials', async () => {
  const h = createHarness();
  const started = deferred();
  const finish = deferred();
  h.disk.setToken = async (token) => { started.resolve(); await finish.promise; h.disk.token = token; };
  const revision = h.store.begin();
  const rejection = assert.rejects(h.store.accept(revision, { accessToken: 'token-1', user: student }), { code: 'SESSION_CHANGED' });
  await started.promise;
  const logout = h.store.invalidate(revision);
  assert.equal(h.store.getSnapshot().user, null);
  finish.resolve();
  await Promise.all([rejection, logout]);
  assert.equal(h.disk.token, null);
  assert.equal(h.disk.user, null);
});

test('partial storage failure does not authenticate the user or leave a token behind', async () => {
  const h = createHarness();
  h.disk.setUser = async () => { throw new Error('Disk unavailable'); };
  await assert.rejects(signIn(h), { code: 'SESSION_STORAGE' });
  assert.equal(h.disk.token, null);
  assert.equal(h.store.getSnapshot().user, null);
});

test('malformed login responses cannot create a usable session', async () => {
  const h = createHarness();
  await assert.rejects(signIn(h, null), { code: 'INVALID_SESSION' });
  await assert.rejects(signIn(h, student, ''), { code: 'INVALID_SESSION' });
  assert.equal(h.disk.token, null);
});
