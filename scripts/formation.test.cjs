const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./testHarness.cjs');

const semester = { readOnly: false };
const subject = { canAct: true, phase: 'OPEN', eligibility: 'UNDECIDED', deadline: '2026-11-01T00:00:00Z' };
const now = Date.parse('2026-10-30T00:00:00Z');

test('formation respects authoritative canAct, semester history, eligibility, phase and deadline', () => {
  const { canRecruit } = createHarness().load('src/constants/formation.ts');
  assert.equal(canRecruit(semester, subject, now), true);
  for (const eligibility of ['ELIGIBLE', 'UNDECIDED']) assert.equal(canRecruit(semester, { ...subject, eligibility }, now), true);
  assert.equal(canRecruit({ readOnly: true }, subject, now), false);
  assert.equal(canRecruit(semester, { ...subject, canAct: false }, now), false);
  assert.equal(canRecruit(semester, { ...subject, eligibility: 'INELIGIBLE' }, now), false);
  for (const phase of ['PREPARING', 'LOCKED', 'FINALIZED']) assert.equal(canRecruit(semester, { ...subject, phase }, now), false);
  assert.equal(canRecruit(semester, { ...subject, deadline: new Date(now).toISOString() }, now), false);
  assert.equal(canRecruit(undefined, undefined, now), false);
});

test('five members including the leader disable invitations, even if the full flag is stale', () => {
  const { canInvite } = createHarness().load('src/constants/formation.ts');
  const group = { size: 4, state: 'OPEN', full: false, finalized: false };
  assert.equal(canInvite(group), true);
  assert.equal(canInvite({ ...group, size: 5 }), false);
  assert.equal(canInvite({ ...group, size: 6 }), false);
  assert.equal(canInvite({ ...group, full: true }), false);
  assert.equal(canInvite({ ...group, finalized: true }), false);
  assert.equal(canInvite({ ...group, state: 'DISSOLVED' }), false);
});

test('requests past their lifetime are disabled before the backend sweeper updates status', () => {
  const { isPending } = createHarness().load('src/constants/formation.ts');
  assert.equal(isPending({ status: 'PENDING', expiresAt: new Date(now + 1).toISOString() }, now), true);
  assert.equal(isPending({ status: 'PENDING', expiresAt: new Date(now).toISOString() }, now), false);
  for (const status of ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'CANCELLED']) {
    assert.equal(isPending({ status, expiresAt: new Date(now + 1000).toISOString() }, now), false);
  }
});

test('Google payload contains only idToken and has no Bearer header', async () => {
  const h = createHarness();
  h.api.defaults.adapter = async config => {
    assert.equal(config.url, '/auth/google');
    assert.deepEqual(JSON.parse(config.data), { idToken: 'google-credential' });
    assert.equal(config.headers.has('Authorization'), false);
    return { config, status: 200, statusText: 'OK', headers: {}, data: {} };
  };
  await h.authService.loginWithGoogle({ idToken: 'google-credential' });
});

test('current group is supplied by me/semesters even for full and locked groups', async () => {
  const h = createHarness();
  const groups = h.load('src/services/groupService.ts').groupService;
  for (const state of ['FULL', 'LOCKED']) {
    const fixture = [{ semesterCode: 'FA26', subjects: [{ subjectId: 'subject-1', group: { id: 'my-group', state, size: 5 } }] }];
    h.api.defaults.adapter = async config => {
      assert.equal(config.url, '/me/semesters');
      return { config, status: 200, statusText: 'OK', headers: {}, data: fixture };
    };
    const semesters = await groups.getMySemesters();
    assert.equal(semesters[0].subjects[0].group.id, 'my-group');
    assert.equal(semesters[0].subjects[0].group.state, state);
  }
});

test('create, invite, accept, kick, leave and transfer use v2.9 request contracts', async () => {
  const h = createHarness();
  const service = h.load('src/services/groupService.ts').groupService;
  const seen = [];
  h.api.defaults.adapter = async config => {
    seen.push({ method: config.method, url: config.url, body: config.data ? JSON.parse(config.data) : null });
    return { config, status: 200, statusText: 'OK', headers: {}, data: {} };
  };
  await service.createGroup('subject-1', { name: 'Team', wantedSkills: 'React' });
  await service.invite('group-1', 'SE123456', 'Hello');
  await service.answer('request-1', 'accept');
  await service.kick('group-1', 'user-2');
  await service.leave('group-1', 'Reason');
  await service.offerTransfer('group-1', 'user-2', true);
  assert.deepEqual(seen, [
    { method: 'post', url: '/subjects/subject-1/groups', body: { name: 'Team', wantedSkills: 'React' } },
    { method: 'post', url: '/groups/group-1/invitations', body: { studentCode: 'SE123456', message: 'Hello' } },
    { method: 'post', url: '/requests/request-1/accept', body: null },
    { method: 'delete', url: '/groups/group-1/members/user-2', body: null },
    { method: 'post', url: '/groups/group-1/leave', body: { reason: 'Reason' } },
    { method: 'post', url: '/groups/group-1/leader-transfers', body: { toUserId: 'user-2', leaveAfter: true } },
  ]);
});

test('empty identifiers are rejected before issuing a request', async () => {
  const h = createHarness();
  const service = h.load('src/services/groupService.ts').groupService;
  h.api.defaults.adapter = async () => { assert.fail('Must not send a request with an empty group ID'); };
  assert.throws(() => service.getGroup(''));
});

test('active mobile source does not retain removed APIs or old leadership field names', () => {
  const root = path.resolve(__dirname, '..');
  const files = fs.readdirSync(path.join(root, 'src/services')).filter(name => /\.ts$/.test(name));
  const text = files.map(name => fs.readFileSync(path.join(root, 'src/services', name), 'utf8')).join('\n');
  assert.doesNotMatch(text, /\/auth\/(register|campuses)|\/slots|\/bookings|\/topics|\/progress|\/documents|\/invites|\/applications\/\$|memberId:/);
  for (const file of ['register.tsx']) assert.equal(fs.existsSync(path.join(root, 'app/(auth)', file)), false);
  for (const file of ['topics.tsx', 'progress.tsx', 'documents.tsx']) assert.equal(fs.existsSync(path.join(root, 'app/(groups)', file)), false);
});

test('private profile rendering never exposes fields outside the server privacy boundary', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Text = ({ children }) => React.createElement('span', null, children);
  const View = ({ children }) => React.createElement('div', null, children);
  const h = createHarness(null, {
    'react-native': { Text, View, StyleSheet: { create: styles => styles } },
    'react-native-safe-area-context': {},
    '@expo/vector-icons': {},
    'expo-router': {},
  });
  const { ProfileDetails } = h.load('src/components/FormationUI.tsx');
  const profile = { userId: 'student-1', fullName: 'Student', studentCode: 'SE123456', full: false,
    email: 'private@example.test', phone: '0123456789', skills: 'private-skill', strengths: 'private-strength', weaknesses: 'private-weakness' };
  const privateHtml = renderToStaticMarkup(React.createElement(ProfileDetails, { profile }));
  assert.match(privateHtml, /Student/);
  assert.match(privateHtml, /SE123456/);
  for (const field of ['email', 'phone', 'skills', 'strengths', 'weaknesses']) assert.equal(privateHtml.includes(profile[field]), false);
  const fullHtml = renderToStaticMarkup(React.createElement(ProfileDetails, { profile: { ...profile, full: true } }));
  assert.equal(fullHtml.includes(profile.email), true);
});
