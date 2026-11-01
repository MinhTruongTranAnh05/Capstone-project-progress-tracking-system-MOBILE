const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { createHarness } = require('./testHarness.cjs');
const student = { id: 'u1', email: 'student@example.test', fullName: 'Student', role: 'STUDENT', status: 'ACTIVE' };
function adapter(h, handler) { h.api.defaults.adapter = async config => ({ config, status: 200, statusText: 'OK', headers: {}, data: await handler(config) }); }
function memory(initial = {}) { const values = new Map(Object.entries(initial)); return { values, async getKnownGroup(id) { return values.get(id) ?? null; }, async setKnownGroup(id, value) { if (value === null) values.delete(id); else values.set(id, value); } }; }
const group = (id, userId = 'u1') => ({ id, groupCode: id, members: [{ id: 'membership', userId, status: 'ACTIVE', isLeader: false }] });

test('recovery verifies saved membership and does not inspect recruiting groups for a STUDENT', async () => {
  const h = createHarness(); const disk = memory({ u1: 'g1', u2: 'private' }); const calls = [];
  adapter(h, c => { calls.push(c.url); return c.url === '/me/invites' ? [] : group('g1'); });
  const { recoverGroups } = h.load('src/features/groups/data/groupRecovery.ts');
  const result = await recoverGroups(student, disk);
  assert.equal(result.selectedId, 'g1'); assert.deepEqual(calls, ['/groups/g1', '/me/invites']); assert.equal(disk.values.get('u2'), 'private');
});
test('nonmembership clears the saved ID and returns no guessed group', async () => {
  const h = createHarness(); const disk = memory({ u1: 'g1' });
  adapter(h, c => c.url === '/me/invites' ? [] : group('g1', 'other-user'));
  const { recoverGroups } = h.load('src/features/groups/data/groupRecovery.ts');
  const result = await recoverGroups(student, disk);
  assert.equal(result.selectedId, undefined); assert.deepEqual(result.groups, []); assert.equal(disk.values.has('u1'), false);
});
test('offline recovery retains the known ID for retry instead of claiming no group', async () => {
  const h = createHarness(); const disk = memory({ u1: 'g1' });
  h.api.defaults.adapter = async () => { throw new axios.AxiosError('Offline', 'ERR_NETWORK'); };
  const { recoverGroups } = h.load('src/features/groups/data/groupRecovery.ts');
  await assert.rejects(recoverGroups(student, disk)); assert.equal(disk.values.get('u1'), 'g1');
});
test('accepted invitation can recover a group only after fresh membership verification', async () => {
  const h = createHarness(); const disk = memory();
  adapter(h, c => c.url === '/me/invites' ? [{ groupId: 'g1', status: 'ACCEPTED' }, { groupId: 'g2', status: 'PENDING' }] : group('g1'));
  const { recoverGroups } = h.load('src/features/groups/data/groupRecovery.ts');
  const result = await recoverGroups(student, disk); assert.equal(result.selectedId, 'g1');
});
test('leader recovery follows pagination and requires selection for multiple verified groups', async () => {
  const h = createHarness(); const pages = [];
  adapter(h, c => { if (c.url === '/groups') { pages.push(c.params.page); return { content: [{ id: 'g' + c.params.page }], last: c.params.page === 1 }; } return group(c.url.split('/').pop()); });
  const { recoverGroups } = h.load('src/features/groups/data/groupRecovery.ts');
  const result = await recoverGroups({ ...student, role: 'GROUP_LEADER' }, memory());
  assert.deepEqual(pages, [0, 1]); assert.equal(result.groups.length, 2); assert.equal(result.selectedId, undefined);
});
test('approve is distinct from invite acceptance and kick uses the membership ID', async () => {
  const h = createHarness(); const calls = []; adapter(h, c => { calls.push([c.method, c.url, c.data ? JSON.parse(c.data) : null]); return {}; });
  const { groupApi } = h.load('src/features/groups/data/groupApi.ts');
  await groupApi.approveApplication('a1'); await groupApi.acceptInvitation('i1'); await groupApi.kick('g1', 'membership-2'); await groupApi.vote('a1', 'OPPOSE', 'Reason');
  assert.deepEqual(calls, [['post', '/applications/a1/approve', null], ['post', '/invites/i1/accept', null], ['delete', '/groups/g1/members/membership-2', null], ['post', '/applications/a1/votes', { vote: 'OPPOSE', comment: 'Reason' }]]);
});
test('real recruiting rules respect eligibility, deadline, lock and terminal states', () => {
  const { canRecruit, hasRoom } = createHarness().load('src/features/groups/domain/rules.ts');
  const window = { open: true, formationDeadline: '2026-12-01T00:00:00Z' }; const now = Date.parse('2026-11-01T00:00:00Z'); const current = { status: 'FORMED', locked: false, memberCount: 4, full: false };
  assert.equal(canRecruit(current, window, true, now), true);
  for (const patch of [{ locked: true }, { status: 'ARCHIVED' }, { status: 'FAILED' }, { status: 'COMPLETED' }]) assert.equal(canRecruit({ ...current, ...patch }, window, true, now), false);
  assert.equal(canRecruit(current, window, false, now), false); assert.equal(canRecruit(current, window, true, Date.parse(window.formationDeadline)), false);
  assert.equal(hasRoom({ ...current, memberCount: 5 }), false);
});
