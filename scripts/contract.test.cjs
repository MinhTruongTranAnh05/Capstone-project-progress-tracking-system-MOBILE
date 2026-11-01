const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const contract = require('../docs/contracts/deployed-v29.json');
const { createHarness } = require('./testHarness.cjs');

test('student API operations exist in the independently captured deployed contract', async () => {
  const h = createHarness();
  h.api.defaults.adapter = async config => {
    const path = '/api/v1' + config.url;
    const template = Object.keys(contract.paths).find(key => new RegExp('^' + key.replace(/\{[^}]+\}/g, '[^/]+') + '$').test(path));
    assert.ok(template, `Undeployed endpoint: ${path}`);
    assert.ok(contract.paths[template].includes(config.method), `Unsupported method: ${config.method} ${path}`);
    return { config, status: 200, statusText: 'OK', headers: {}, data: [] };
  };
  const { groupApi } = h.load('src/features/groups/data/groupApi.ts');
  await groupApi.getMySemesters(); await groupApi.createGroup('subject', { name: 'TEST-Team', wantedSkills: '' });
  await groupApi.requests('group'); await groupApi.apply('group', 'TEST-apply'); await groupApi.invite('group', 'SE192636', 'TEST-invite');
  await groupApi.answer('request', 'accept'); await groupApi.like('request', true); await groupApi.like('request', false);
  await groupApi.leave('group', 'TEST-leave'); await groupApi.kick('group', 'user');
});

test('restored group is not usable without membership and matching scope', async () => {
  const h = createHarness();
  let data = { id: 'g1', scopeId: 's1', members: [{ userId: 'u1', leader: true }] };
  h.api.defaults.adapter = async config => ({ config, status: 200, statusText: 'OK', headers: {}, data });
  const { loadVerifiedGroup } = h.load('src/features/groups/data/groupRecovery.ts');
  assert.equal((await loadVerifiedGroup('g1', 'u1', 's1')).id, 'g1');
  await assert.rejects(loadVerifiedGroup('g1', 'u2', 's1'), { code: 'GROUP_MEMBERSHIP_MISSING' });
  await assert.rejects(loadVerifiedGroup('g1', 'u1', 's2'), { code: 'GROUP_MEMBERSHIP_MISSING' });
  data = { ...data, members: [] };
  await assert.rejects(loadVerifiedGroup('g1', 'u1', 's1'), { code: 'GROUP_MEMBERSHIP_MISSING' });
});

test('scope selection uses only an explicit scope or server-confirmed group summary', () => {
  const { selectScope } = createHarness().load('src/features/groups/data/groupRecovery.ts');
  const semesters = [{ subjects: [{ scopeId: 's1', group: null }, { scopeId: 's2', group: { id: 'g2' } }] }];
  assert.equal(selectScope(semesters, undefined, 'g2').subject.scopeId, 's2');
  assert.equal(selectScope(semesters, 's1', 'g2').subject.scopeId, 's1');
  assert.equal(selectScope(semesters, undefined, 'unknown').subject.group, null);
  assert.equal(selectScope([], undefined, 'g2'), undefined);
});

test('known group hints are user-scoped and survive logout without preserving credentials', async t => {
  const previous = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  t.after(() => { globalThis.localStorage = previous; });
  const { storage } = createHarness().load('src/services/storage.web.ts');
  await storage.setKnownGroup('user-a', 'group-a');
  await storage.setKnownGroup('user-b', 'group-b');
  await storage.setToken('credential');
  await storage.clear();
  assert.equal(await storage.getToken(), null);
  assert.equal(await storage.getKnownGroup('user-a'), 'group-a');
  assert.equal(await storage.getKnownGroup('user-b'), 'group-b');
  assert.equal(await storage.getKnownGroup('unknown-user'), null);
  await storage.setKnownGroup('user-a', null);
  assert.equal(await storage.getKnownGroup('user-a'), null);
  assert.equal(await storage.getKnownGroup('user-b'), 'group-b');
});

test('denial message is preserved exactly and field errors remain available', () => {
  const { getErrorMessage, getFieldErrors } = createHarness().load('src/services/apiError.ts');
  const data = { errorCode: 'NOT_ELIGIBLE', message: 'Ineligible students may only view their profile', fieldErrors: [{ field: 'skills', message: 'size must be between 0 and 1000' }] };
  const error = new axios.AxiosError('Denied', 'ERR_BAD_RESPONSE', {}, null, { status: 403, data });
  assert.ok(getErrorMessage(error).startsWith(data.message));
  assert.equal(getFieldErrors(error).skills, data.fieldErrors[0].message);
});

test('profile limits follow deployed fields; registration and requested capstone endpoints are absent', () => {
  const { profileSchema } = createHarness().load('src/core/validation/groups.ts');
  const data = { phone: '', skills: 'x'.repeat(1000), strengths: '', weaknesses: '', profilePrivate: true };
  assert.equal(profileSchema.safeParse(data).success, true);
  assert.equal(profileSchema.safeParse({ ...data, skills: 'x'.repeat(1001) }).success, false);
  assert.equal(profileSchema.safeParse({ ...data, phone: '1'.repeat(21) }).success, false);
  assert.deepEqual(contract.schemas.GoogleLoginRequest.required, ['idToken']);
  assert.deepEqual(contract.schemas.UserResponse.properties.role.enum, ['ADMIN', 'LECTURER', 'STUDENT']);
  for (const path of ['/api/v1/auth/register', '/api/v1/topics', '/api/v1/groups/{groupId}/progress', '/api/v1/groups/{groupId}/topic-proposals']) assert.equal(contract.paths[path], undefined);
});
