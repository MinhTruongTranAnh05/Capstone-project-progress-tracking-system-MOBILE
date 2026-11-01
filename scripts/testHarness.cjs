const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

// Execute the real TS services with an in-memory storage boundary, without loading native Expo modules.
function createHarness(initialToken = null, externalModules = {}) {
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
    if (!path.extname(filename)) filename += fs.existsSync(filename + '.ts') ? '.ts' : '.tsx';
    if (modules.has(filename)) return modules.get(filename).exports;
    if (filename === path.join(root, 'src/services/storage.ts')) return { storage: disk };
    if (filename === path.join(root, 'src/constants/config.ts')) {
      return { config: { API_URL: 'https://api.example.test/api/v1', API_TIMEOUT: 15000 } };
    }
    const module = { exports: {} };
    modules.set(filename, module);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const localRequire = (name) => {
      if (Object.hasOwn(externalModules, name)) return externalModules[name];
      if (name.startsWith('@/')) return load(path.join(root, 'src', name.slice(2)));
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), name));
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


module.exports = { createHarness };
