const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const contract = require('../docs/contracts/deployed-v29-full.json');
const { createHarness } = require('./testHarness.cjs');

const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const semester = { code: 'SP27', name: 'Spring 2027', startDate: '2027-01-01', endDate: '2027-05-31', formationOpensAt: '2026-12-01T00:00:00Z', defaultDeadline: '2026-12-30T00:00:00Z' };
const user = { id: uid(1), email: 'staff@example.test', fullName: 'Test Staff', role: 'ADMIN', status: 'ACTIVE' };
const response = (config, data, headers = {}) => ({ config, data, headers, status: 200, statusText: 'OK' });
async function signedHarness(role = 'ADMIN', overrides = {}) {
  const h = createHarness(null, overrides);
  await h.store.accept(h.store.begin(), { accessToken: 'test-token', user: { ...user, role } });
  return h;
}
function resolve(schema) { return schema?.$ref ? resolve(schema.$ref.split('/').reduce((value, key, i) => i ? value[key] : value, contract)) : schema; }
function validate(value, raw, location) {
  const schema = resolve(raw);
  if (!schema || value === null) return; // OpenAPI v3.0 does not describe reset-to-default nulls consistently.
  if (schema.type === 'object') {
    for (const key of schema.required ?? []) assert.ok(Object.hasOwn(value, key), `${location}.${key} required`);
    for (const [key, child] of Object.entries(value)) {
      assert.ok(schema.properties?.[key], `${location}.${key} is not a deployed field`);
      validate(child, schema.properties[key], `${location}.${key}`);
    }
  } else if (schema.type === 'array') { assert.ok(Array.isArray(value)); value.forEach(v => validate(v, schema.items, location)); }
  else if (schema.type === 'integer') assert.ok(Number.isInteger(value), location);
  else if (schema.type) assert.equal(typeof value, schema.type, location);
  if (schema.enum) assert.ok(schema.enum.includes(value), `${location} invalid enum: ${value}`);
  if (schema.minLength !== undefined) assert.ok(value.length >= schema.minLength, location);
  if (schema.maxLength !== undefined) assert.ok(value.length <= schema.maxLength, location);
  if (schema.format === 'uuid') assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, location);
}

test('every staff operation matches the separately captured v2.9 path, method, query and body schema', async () => {
  const h = await signedHarness(); const calls = [];
  h.api.defaults.adapter = async config => {
    const path = '/api/v1' + config.url;
    // Prefer the exact static path over a path parameter such as /users/{id}.
    const template = contract.paths[path] ? path : Object.keys(contract.paths).find(p => new RegExp('^' + p.replace(/\{[^}]+\}/g, '[^/]+') + '$').test(path));
    assert.ok(template, `Undeployed endpoint: ${path}`);
    const operation = contract.paths[template][config.method];
    assert.ok(operation, `Undeployed method: ${config.method} ${template}`);
    assert.equal(config.headers.get('Authorization'), 'Bearer test-token');
    for (const [key, value] of Object.entries(config.params ?? {})) if (value !== undefined) {
      const parameter = operation.parameters?.find(p => p.in === 'query' && p.name === key);
      assert.ok(parameter, `Undeployed query ${key} for ${template}`);
      validate(value, parameter.schema, `${template}?${key}`);
    }
    const content = operation.requestBody?.content;
    if (content?.['multipart/form-data']) {
      assert.ok(config.data instanceof FormData, 'File must remain multipart, not JSON');
      assert.match(config.headers.get('Content-Type'), /^multipart\/form-data/);
      assert.ok(config.data.get('file') instanceof Blob);
    } else if (content?.['application/json']) {
      validate(JSON.parse(config.data), content['application/json'].schema, template);
    } else assert.ok(config.data === undefined, `Unexpected body: ${template}`);
    calls.push(`${config.method} ${template}`);
    return response(config, []);
  };
  const { staffApi: api } = h.load('src/features/staff/data/staffApi.ts');
  await api.semesters({ q: 'SP', moderatedByMe: true, sort: 'code', direction: 'asc' });
  await api.createSemester(semester); await api.updateSemester('SP27', semester); await api.deleteSemester('SP27');
  await api.assignModerator('SP27', uid(2)); await api.assignModerator('SP27', '');
  await api.subjects('SP27'); await api.updateSubject(uid(3), { code: 'CAP', name: 'Capstone', targetTerm: 9, requestTtlMinutes: 15 });
  await api.majors(); await api.createMajor({ code: 'SE', name: 'Software' }); await api.updateMajor(uid(4), { code: 'SE', name: 'Software' });
  await api.users({ role: 'LECTURER', q: 'staff', page: 0, size: 20 });
  await api.createModerator({ email: 'staff@example.test', fullName: 'Test Staff', password: ' pass word ', phone: '' });
  await api.updateUser(uid(2), { fullName: 'Test Staff', email: 'staff@example.test', phone: '', status: 'ACTIVE' });
  await api.resetPassword(uid(2), ' pass word ');
  await api.students('SP27', { q: 'SE', majorId: uid(4), hasGroup: false, eligibility: 'UNDECIDED', page: 0, size: 20 });
  await api.updateStudent(uid(5), { fullName: 'Test Student', email: 'student@example.test', phone: '' });
  await api.eligibility(uid(6), { eligibility: 'INELIGIBLE', reason: 'Test reason' });
  for (const kind of ['students', 'eligibility']) for (const preview of [true, false]) {
    const file = new FormData(); file.append('file', new Blob(['studentCode']), 'test.csv');
    await api.importFile('SP27', kind, file, preview);
  }
  await api.groups('SP27', { majorId: uid(4), state: 'OPEN', maxSize: 2, finalized: false, q: 'TEST', page: 0, size: 100 });
  await api.group(uid(7)); await api.statistics('SP27', { subjectId: uid(3), majorId: uid(4) });
  await api.exportCheck('SP27'); await api.exportExcel('SP27', { subjectId: uid(3) });
  await api.scopes('SP27'); await api.setDeadline(uid(8), null); await api.setDeadline(uid(8), semester.defaultDeadline);
  await api.extend(uid(8), semester.defaultDeadline); await api.finalizeCheck(uid(8)); await api.finalize(uid(8)); await api.reopen(uid(8), 'Test reason');
  await api.createGroup(uid(8), { name: 'Test Team', leaderUserId: uid(1), memberUserIds: [uid(2)] });
  await api.add(uid(7), uid(2)); await api.move(uid(7), uid(2)); await api.remove(uid(7), uid(2), 'Test reason');
  await api.merge(uid(7), uid(9)); await api.appointLeader(uid(7), uid(2)); await api.dissolve([uid(7)], 'Test reason');
  await api.complaints(uid(3), uid(8)); await api.decideLeave(uid(9), false, 'Test reason');
  assert.equal(calls.length, 43);
});

test('student sessions and unverified sessions cannot issue staff requests; lecturer cannot issue admin requests', async () => {
  for (const role of [null, 'STUDENT', 'LECTURER']) {
    const h = role ? await signedHarness(role) : createHarness(); let calls = 0;
    h.api.defaults.adapter = async config => { calls++; return response(config, []); };
    const { staffApi: api } = h.load('src/features/staff/data/staffApi.ts');
    const blocked = [() => api.users({}), () => api.createMajor({ code: 'SE', name: 'Software' }), () => api.createSemester(semester), () => api.importFile('SP27', 'students', new FormData(), true)];
    if (role !== 'LECTURER') blocked.push(() => api.groups('SP27'), () => api.decideLeave(uid(9), true, ''));
    for (const operation of blocked) await assert.rejects(async () => operation(), { code: 'FORBIDDEN' });
    assert.equal(calls, 0);
    if (role === 'LECTURER') { await api.semesters({ moderatedByMe: true }); await api.groups('SP27'); assert.equal(calls, 2); }
  }
});

test('staff payloads distinguish enrollment/student IDs, preserve password whitespace and use approve/note', async () => {
  const h = await signedHarness(); const requests = [];
  h.api.defaults.adapter = async config => { requests.push({ path: config.url, body: config.data && JSON.parse(config.data) }); return response(config, {}); };
  const { staffApi: api } = h.load('src/features/staff/data/staffApi.ts');
  await api.updateStudent(uid(5), { fullName: ' Test Student ', email: 'student@example.test', phone: '' });
  await api.eligibility(uid(6), { eligibility: 'INELIGIBLE', reason: ' Test reason ' });
  await api.decideLeave(uid(9), false, ' Rejected '); await api.resetPassword(uid(2), ' pass word ');
  assert.equal(requests[0].path, `/semester-students/${uid(5)}`);
  assert.equal(requests[1].path, `/enrollments/${uid(6)}/eligibility`);
  assert.deepEqual(requests[2].body, { approve: false, note: 'Rejected' });
  assert.deepEqual(requests[3].body, { password: ' pass word ' });
  const count = requests.length;
  for (const operation of [() => api.add(uid(7), ' '), () => api.remove(uid(7), uid(2), ''), () => api.dissolve([], 'reason'), () => api.extend(uid(8), 'not a date'), () => api.decideLeave(uid(9), false, '')]) await assert.rejects(async () => operation());
  assert.equal(requests.length, count, 'Invalid forms must not send HTTP requests');
});

test('bulk group collection reads every server page and retains the filter', async () => {
  const h = await signedHarness(); const pages = [];
  h.api.defaults.adapter = async config => {
    assert.deepEqual(config.params, { maxSize: 2, page: pages.length, size: 100 }); pages.push(config.params.page);
    return response(config, { content: [{ id: uid(pages.length) }], totalPages: 3 });
  };
  const { collectGroups } = h.load('src/features/staff/data/groupLists.ts');
  assert.deepEqual((await collectGroups('SP27', { maxSize: 2 })).map(g => g.id), [uid(1), uid(2), uid(3)]);
  assert.deepEqual(pages, [0, 1, 2]);
});

test('role-specific staff navigation excludes unauthorized portal sections', () => {
  const { getStaffNavigation, getStaffSection } = createHarness().load('src/features/staff/domain/navigation.ts');
  assert.equal(getStaffNavigation('ADMIN').length, 8); assert.equal(getStaffNavigation('LECTURER').length, 5);
  assert.deepEqual(getStaffNavigation('STUDENT'), []); assert.equal(getStaffSection('STUDENT', 'accounts'), null);
  assert.equal(getStaffSection('LECTURER', 'accounts'), 'groups'); assert.equal(getStaffSection('ADMIN', 'accounts'), 'accounts');
});

test('staff validation covers time ordering, backend limits and duplicate memberships', () => {
  const v = createHarness().load('src/features/staff/domain/validation.ts');
  assert.equal(v.semesterSchema.safeParse(semester).success, true);
  assert.equal(v.semesterSchema.safeParse({ ...semester, endDate: '2026-01-01' }).success, false);
  assert.equal(v.semesterSchema.safeParse({ ...semester, defaultDeadline: semester.formationOpensAt }).success, false);
  const group = { name: 'TEST', leaderUserId: uid(1), memberUserIds: [uid(2)] };
  assert.equal(v.coordinatedGroupSchema.safeParse(group).success, true);
  for (const memberUserIds of [[uid(1)], [uid(2), uid(2)], Array.from({ length: 5 }, (_, i) => uid(i + 2))]) assert.equal(v.coordinatedGroupSchema.safeParse({ ...group, memberUserIds }).success, false);
  const subject = { code: 'CAP', name: 'Capstone', targetTerm: 9, requestTtlMinutes: 20160 };
  assert.equal(v.subjectSchema.safeParse(subject).success, true);
  for (const ttl of [0, 20161, 1.5]) assert.equal(v.subjectSchema.safeParse({ ...subject, requestTtlMinutes: ttl }).success, false);
  assert.equal(v.eligibilitySchema.safeParse({ eligibility: 'INELIGIBLE', reason: '' }).success, false);
  assert.equal(v.eligibilitySchema.safeParse({ eligibility: 'ELIGIBLE', reason: 'x'.repeat(501) }).success, false);
  assert.throws(() => v.toInstant('')); assert.throws(() => v.toInstant('invalid'));
  assert.throws(() => v.toInstant('2027-02-31T12:00')); assert.throws(() => v.toInstant('2027-01-01T25:00'));
  assert.ok(Number.isFinite(Date.parse(v.toInstant('2027-01-01T12:00'))));
});

test('Excel download rejects JSON/error bodies and preserves real server denial messages', async () => {
  const saved = []; const h = await signedHarness('ADMIN', { './fileTransfer': { saveWorkbook: async (...args) => saved.push(args) } });
  const { exportReport } = h.load('src/features/staff/data/reportExport.ts');
  const { XLSX_TYPE, validateWorkbook, workbookName } = h.load('src/features/staff/domain/workbook.ts');
  const bytes = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 1]).buffer;
  for (const [status, type, body] of [[500, XLSX_TYPE, bytes], [200, 'application/json', bytes], [200, XLSX_TYPE, new ArrayBuffer(0)]]) assert.throws(() => validateWorkbook(status, type, body));
  assert.equal(workbookName("attachment; filename*=UTF-8''Nh%C3%B3m.xlsx", 'fallback.xlsx'), 'Nhóm.xlsx');
  assert.equal(workbookName('attachment; filename="../../report.xlsx"', 'fallback.xlsx'), 'report.xlsx');
  assert.equal(workbookName('attachment; filename="error.html"', 'fallback.xlsx'), 'fallback.xlsx');
  h.api.defaults.adapter = async config => response(config, bytes, { 'content-type': 'application/json' });
  await assert.rejects(exportReport('SP27')); assert.equal(saved.length, 0);
  h.api.defaults.adapter = async config => { throw new axios.AxiosError('Denied', 'ERR_BAD_RESPONSE', config, null, { config, status: 403, headers: {}, data: new TextEncoder().encode(JSON.stringify({ message: 'Không có quyền xuất học kỳ này' })).buffer }); };
  const { getErrorMessage } = h.load('src/services/apiError.ts');
  await assert.rejects(exportReport('SP27'), error => getErrorMessage(error).includes('Không có quyền xuất học kỳ này'));
  assert.equal(saved.length, 0);
  h.api.defaults.adapter = async config => response(config, bytes, { 'content-type': XLSX_TYPE, 'content-disposition': 'attachment; filename="report.xlsx"' });
  await exportReport('SP27'); assert.equal(saved.length, 1); assert.equal(saved[0][1], 'report.xlsx');
});

test('all Admin and Coordinator portal sections render with server-shaped data', () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const host = ({ children }) => React.createElement('div', null, children);
  const heading = ({ title, subtitle, children, label, value, text }) => React.createElement('div', null, React.Children.toArray([title, subtitle, label, value, text, children]));
  const primitive = new Proxy({ ui: {}, Columns: ({ main, aside }) => React.createElement('div', null, main, aside) }, { get: (target, name) => target[name] ?? heading });
  const counts = { totalStudents: 3, withGroup: 3, withoutGroup: 0, ineligible: 0, groupsBySize: { 3: 1 }, totalGroups: 1, openGroups: 1, fullGroups: 0, lockedGroups: 0, finalizedGroups: 0, groupsUnderMinimum: 0, openComplaints: 1, pendingApplies: 0, pendingInvites: 0 };
  const scope = { id: uid(8), subjectId: uid(3), subjectName: 'Capstone', subjectCode: 'CAP', majorCode: 'SE', majorName: 'Software', phase: 'OPEN', studentCount: 3, groupCount: 1, counts };
  const subject = { id: uid(3), name: 'Capstone', scopes: [scope] };
  const page = content => ({ content, totalPages: 1, totalElements: content.length, last: true, number: 0 });
  for (const role of ['ADMIN', 'LECTURER']) {
    let requested;
    const key = ['staff', uid(1)]; const f = { key, admin: role === 'ADMIN', semester: 'SP27', semesters: [semester], loading: false, error: null, selectSemester() {}, refresh() {} };
    const h = createHarness(null, {
      'react-native': { StyleSheet: { create: value => value }, View: host, Text: host, ScrollView: host, Modal: ({ visible, children }) => visible ? React.createElement(host, null, children) : null, TouchableOpacity: host, Pressable: host, ActivityIndicator: host, useWindowDimensions: () => ({ width: 1200, height: 900 }) },
      'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) },
      '@expo/vector-icons': { Ionicons: () => null },
      'expo-router': { useLocalSearchParams: () => ({ section: requested }) },
      '@/contexts/AuthContext': { useAuth: () => ({ user: { ...user, role }, logout() {} }) },
      '@/core/ui/primitives': primitive,
      '@/features/profile/presentation/ProfileDetails': { ProfileDetails: () => null },
      './StaffContext': { useStaff: () => f, StaffProvider: host },
      '@tanstack/react-query': {
        useQueries: ({ queries }) => queries.map(() => ({ data: page([user]), isPending: false, error: null })),
        useQueryClient: () => ({ invalidateQueries: async () => {} }),
        useMutation: () => ({ isPending: false, isError: false, isSuccess: false }),
        useQuery: ({ queryKey }) => {
          const type = queryKey[2];
          const data = type === 'semesters' ? [semester] : type === 'subjects' ? [subject] : type === 'scopes' ? [scope]
            : type === 'majors' ? [{ id: uid(4), code: 'SE', name: 'Software' }]
            : type === 'statistics' ? { total: counts, scopes: [{ ...scope, scopeId: scope.id }] }
            : type === 'complaints' ? [{ id: uid(9), fullName: 'TEST Student', studentCode: 'SE000001', status: 'PENDING_MODERATOR', reason: 'TEST', createdAt: '2026-11-05T00:00:00Z' }]
            : type === 'users' ? page([user])
            : type === 'students' || type === 'accounts-roster' || type === 'unassigned' ? page([{ enrollmentId: uid(6), fullName: 'TEST Student', eligibility: 'UNDECIDED', email: 'student@example.test' }])
            : type === 'groups' ? page([{ id: uid(7), code: 'TEST-001', name: 'TEST Team', size: 3, state: 'OPEN' }])
            : type === 'unread' ? { unread: 1 } : undefined;
          return { data, error: null, isPending: false, isFetching: false, isSuccess: true, refetch: async () => {} };
        },
      },
    });
    const { getStaffNavigation } = h.load('src/features/staff/domain/navigation.ts');
    const Screen = h.load('src/features/staff/presentation/StaffDashboardScreen.tsx').default;
    for (const section of getStaffNavigation(role)) {
      requested = section.key;
      const html = renderToStaticMarkup(React.createElement(Screen));
      assert.ok(html.includes(section.label.replaceAll('&', '&amp;')), `${role}/${section.key} must render its heading`);
      assert.ok(!html.includes('Thao tác thành công'), 'Read-only rendering must not claim a completed action');
      if (section.key === 'groups') assert.ok(html.includes('TEST-001'));
      if (section.key === 'eligibility') assert.ok(html.includes('TEST Student'));
    }
  }
});

test('pressing the student bell opens and closes an in-place popup without route navigation', () => {
  const React = require('react'); let cursor = 0; const states = []; let navigations = 0;
  const h = createHarness(null, {
    react: { ...React, useState: initial => { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = value; }]; } },
    'react-native': { StyleSheet: { create: value => value }, Platform: { OS: 'android' }, View: 'View', Text: 'Text', ScrollView: 'ScrollView', KeyboardAvoidingView: 'KeyboardAvoidingView', TouchableOpacity: 'Button', Modal: 'Modal', RefreshControl: 'RefreshControl', useWindowDimensions: () => ({ width: 400 }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'expo-router': { usePathname: () => '/', useRouter: () => ({ navigate: () => navigations++ }) },
    '@tanstack/react-query': { useQuery: () => ({ data: { unread: 1 } }) },
    '@/contexts/AuthContext': { useAuth: () => ({ user: { ...user, role: 'STUDENT' } }) },
    './GroupContext': { useFormation: () => ({ key: ['formation', uid(1)], group: null, semesters: [], canAct: true }) },
    '@/core/ui/primitives': { ui: {} },
  });
  const { FormationPage } = h.load('src/features/groups/presentation/FormationShell.tsx');
  const render = () => { cursor = 0; return FormationPage({ title: 'TEST' }); };
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const popup = tree => nodes(tree).find(node => node.type?.name === 'NotificationsPopup');
  const first = render(); assert.equal(popup(first), undefined);
  const bell = nodes(first).find(node => node.props?.accessibilityLabel === 'Thông báo, 1 chưa đọc');
  assert.ok(bell); bell.props.onPress();
  const opened = popup(render()); assert.ok(opened, 'Press must mount the notification popup'); assert.equal(navigations, 0);
  opened.props.onClose(); assert.equal(popup(render()), undefined);
});

test('native Excel sharing waits for the SDK 58 asynchronous file write and propagates write failures', async () => {
  let finishWrite; let flushed = false; let shares = 0;
  const h = createHarness(null, {
    'expo-file-system': { Paths: { cache: 'cache' }, File: class { uri = 'file:///cache/report.xlsx'; write() { return new Promise(resolve => { finishWrite = () => { flushed = true; resolve(); }; }); } } },
    'expo-sharing': { isAvailableAsync: async () => true, shareAsync: async () => { assert.equal(flushed, true); shares++; } },
  });
  const { saveWorkbook } = h.load('src/features/staff/data/fileTransfer.ts');
  const saving = saveWorkbook(new ArrayBuffer(4), 'report.xlsx');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(shares, 0); assert.equal(typeof finishWrite, 'function');
  finishWrite(); await saving; assert.equal(shares, 1);
  const failing = createHarness(null, {
    'expo-file-system': { Paths: { cache: 'cache' }, File: class { async write() { throw new Error('Disk write failed'); } } },
    'expo-sharing': { isAvailableAsync: async () => true, shareAsync: async () => { shares++; } },
  }).load('src/features/staff/data/fileTransfer.ts');
  await assert.rejects(failing.saveWorkbook(new ArrayBuffer(4), 'report.xlsx'), /Disk write failed/);
  assert.equal(shares, 1);
});

test('root guards use explicit role destinations instead of the ambiguous default index fallback', () => {
  const React = require('react'); const host = () => null;
  function Stack() {} Stack.Screen = host; Stack.Protected = function Protected() {};
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  for (const role of [null, 'STUDENT', 'ADMIN', 'LECTURER']) {
    const account = role ? { ...user, role } : null;
    const h = createHarness(null, {
      react: { ...React, useEffect() {} },
      'expo-router': { Stack },
      'expo-status-bar': { StatusBar: host },
      expo: { requireOptionalNativeModule: () => null },
      '@tanstack/react-query': { QueryClient: class {}, QueryClientProvider: host },
      '@/core/ui/SafeAreaRoot': { SafeAreaRoot: host },
      '@/contexts/AuthContext': { AuthProvider: host, useAuth: () => ({ user: account, isAuthenticated: !!account, isLoading: false, startupError: null }) },
      '@/contexts/FormationContext': { FormationProvider: host },
      '@/components/SessionStatus': { SessionStatus: host },
    });
    const Root = h.load('app/_layout.tsx').default;
    const navigator = nodes(Root()).find(node => node.type?.name === 'RootNavigator');
    const guards = nodes(navigator.type()).filter(node => node.type === Stack.Protected);
    assert.equal(guards.length, 3);
    const destination = role === null ? '/(auth)/login' : role === 'STUDENT' ? '/(tabs)' : '/staff';
    for (const guard of guards) assert.equal(guard.props.redirectTo, destination);
    assert.deepEqual(guards.filter(g => g.props.guard).flatMap(g => nodes(g.props.children).filter(n => n.type === Stack.Screen).map(n => n.props.name)), role === null ? ['(auth)'] : role === 'STUDENT' ? ['(tabs)', '(groups)'] : ['staff']);
  }
});
