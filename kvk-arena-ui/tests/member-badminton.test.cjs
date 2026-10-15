const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const context = { exports: {}, Intl, Date, Error, ...globals };
  vm.runInNewContext(outputText, context);
  return context.exports;
}
const utils = load('client/pages/members/badminton/booking-utils.ts');
const slots = [
  { slotId: 'a', startTime: '08:00:00', endTime: '09:00:00' },
  { slotId: 'b', startTime: '09:00:00', endTime: '10:00:00' },
  { slotId: 'c', startTime: '11:00:00', endTime: '12:00:00' },
];
test('duration maximum uses env weeks without converting to months', () => {
  assert.equal(utils.maximumWeeks('12'), 12);
  assert.equal(utils.maximumWeeks('0'), 0);
  assert.equal(utils.maximumWeeks('1.5'), 0);
  assert.equal(utils.maximumWeeks(''), 0);
});
test('booking end is inclusive and handles month and leap-year boundaries', () => {
  assert.equal(utils.endDate('2027-01-01', 1), '2027-01-07');
  assert.equal(utils.endDate('2027-01-01', 12), '2027-03-25');
  assert.equal(utils.endDate('2028-02-26', 1), '2028-03-03');
  assert.equal(utils.endDate('2027-12-29', 2), '2028-01-11');
  assert.equal(utils.endDate('2027-02-30', 1), '');
});
test('schedule rejects durations above the env maximum, invalid days, duplicates and slot gaps', () => {
  const check = (weeks, days, ids) => utils.validateSchedule('2027-01-04', '2027-01-01', weeks, 12, days, ids, slots);
  assert.equal(check(12, ['Monday'], ['a', 'b']), '');
  for (const args of [[13, ['Monday'], ['a']], [0, ['Monday'], ['a']], [1, [], ['a']], [1, ['Invalid'], ['a']], [1, ['Monday', 'Monday'], ['a']], [1, ['Monday'], ['b', 'c']], [1, ['Monday'], ['a', 'a']]]) assert.notEqual(check(...args), '');
});
test('countdown uses an absolute deadline and never goes negative after a sleeping tab resumes', () => {
  assert.equal(utils.remainingSeconds(420000, 0), 420);
  assert.equal(utils.remainingSeconds(420000, 419001), 1);
  assert.equal(utils.remainingSeconds(420000, 900000), 0);
  assert.equal(utils.countdown(420), '07:00');
  assert.equal(utils.countdown(0), '00:00');
});
function fixture(response = {}) {
  const calls = [];
  let responseIndex = 0;
  const nextResponse = () => Array.isArray(response) ? response[responseIndex++] : response;
  const axios = { get: async (...args) => { calls.push(['GET', ...args]); return { data: response }; }, post: async (...args) => { calls.push(['POST', ...args]); return { data: nextResponse() }; }, delete: async (...args) => { calls.push(['DELETE', ...args]); return { data: response }; }, isAxiosError: error => error?.isAxiosError === true };
  const api = load('services/member-badminton-api.ts', { require: name => {
    if (name === 'axios') return axios;
    if (name === '@/env') return { getEnv: () => ({ API_URL: 'https://arena.test/api' }) };
    throw new Error(name);
  } });
  return { api, calls };
}
const schedule = { startDate: '2027-01-04', weeks: 12, slotIds: ['a', 'b'], daysOfWeek: ['Monday', 'Friday'] };
test('availability and hold contain only the schedule, with no member ID or coupon', async () => {
  const { api, calls } = fixture();
  await api.checkMemberBooking(schedule);
  await api.holdMemberBooking(schedule);
  assert.equal(calls[0][1], 'https://arena.test/api/member-badminton-bookings/check-availability');
  assert.equal(calls[1][1], 'https://arena.test/api/member-badminton-bookings/hold');
  assert.deepEqual(calls[0][2], schedule);
  assert.equal(calls[0][2].memberId, undefined);
  assert.equal(calls[1][2].couponCode, undefined);
});
test('coupon validation happens against a held reservation', async () => {
  const { api, calls } = fixture();
  await api.quoteMemberCoupon('reservation', 'UNUSED');
  assert.equal(calls[0][1], 'https://arena.test/api/member-badminton-bookings/coupon');
  assert.equal(calls[0][2].holdToken, 'reservation');
  assert.equal(calls[0][2].couponCode, 'UNUSED');
});
test('confirm uses customer details and coupon, never a client-supplied price or member ID', async () => {
  const { api, calls } = fixture({ succeeded: true, finalAmount: 1500, bookings: [{ bookingNumber: 'BOOK-1' }] });
  await api.createMemberPayment({ holdToken: 'reservation', customerName: 'Test', phoneNumber: '0771234567', couponCode: 'UNUSED', email: 'test@example.com' });
  const payload = calls[0][2];
  assert.equal(payload.couponCode, 'UNUSED');
  assert.equal(payload.memberId, undefined);
  assert.equal(payload.amount, undefined);
  assert.equal(calls[0][1], 'https://arena.test/api/member-badminton-bookings/payment');
});
test('editing a schedule releases the hold through the dedicated endpoint', async () => {
  const { api, calls } = fixture();
  await api.releaseMemberHold('reservation');
  assert.equal(calls[0][0], 'DELETE');
  assert.equal(calls[0][1], 'https://arena.test/api/member-badminton-bookings/hold/reservation');
});
test('Book rechecks availability before requesting a hold', async () => {
  const { api, calls } = fixture([{ isAvailable: true }, { holdToken: 'new-hold' }]);
  const result = await api.checkAndHoldMemberBooking(schedule);
  assert.equal(calls.length, 2);
  assert.ok(calls[0][1].endsWith('/check-availability'));
  assert.ok(calls[1][1].endsWith('/hold'));
  assert.equal(result.hold.holdToken, 'new-hold');
});
test('Book never creates a hold when the recheck finds a conflict', async () => {
  const { api, calls } = fixture({ isAvailable: false, unavailableSchedules: [{ date: '2027-01-04' }] });
  const result = await api.checkAndHoldMemberBooking(schedule);
  assert.equal(calls.length, 1);
  assert.equal(result.hold, null);
  assert.equal(result.availability.unavailableSchedules.length, 1);
});
