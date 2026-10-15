const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const context = { exports: {}, Intl, Date, Error, FormData, ...globals };
  vm.runInNewContext(outputText, context);
  return context.exports;
}
const utils = load('client/pages/members/badminton/booking-utils.ts');
const slots = [
  { slotId: 'a', startTime: '08:00:00', endTime: '09:00:00' },
  { slotId: 'b', startTime: '09:00:00', endTime: '10:00:00' },
  { slotId: 'c', startTime: '11:00:00', endTime: '12:00:00' },
];

test('rejects missing slots, gaps, duplicates, invalid dates and invalid durations', () => {
  const check = (date, weeks, ids) => utils.validateSchedule(date, '2027-01-01', weeks, ['Monday'], ids, slots);
  assert.equal(check('2027-01-04', '4', ['a', 'b']), '');
  for (const args of [ ['2027-01-04', '4', []], ['2027-01-04', '4', ['a', 'c']], ['2027-01-04', '4', ['a', 'a']], ['2027-02-30', '4', ['a']], ['2026-12-31', '4', ['a']], ['2027-01-04', '0', ['a']], ['2027-01-04', '1.5', ['a']], ['2027-01-04', 'Infinity', ['a']] ]) assert.notEqual(check(...args), '');
  assert.notEqual(utils.validateSchedule('2027-01-04', '2027-01-01', '4', [], ['a'], slots), '');
});

test('time selection requires actual adjacency rather than adjacent array positions', () => {
  assert.equal(utils.consecutiveSlots(['a', 'b'], slots), true);
  assert.equal(utils.consecutiveSlots(['b', 'c'], slots), false);
  assert.equal(utils.consecutiveSlots(['missing'], slots), false);
});

test('calendar configuration is converted to explicit whole weeks', () => {
  assert.equal(utils.initialWeeks('2027-01-01', '3'), '13');
  assert.equal(utils.initialWeeks('2027-01-01', ''), '4');
  assert.equal(utils.isDate('2028-02-29'), true);
  assert.equal(utils.isDate('2027-02-29'), false);
});

test('time labels distinguish noon and midnight', () => {
  assert.equal(utils.slotTime('00:00:00'), '12:00 AM');
  assert.equal(utils.slotTime('12:30:00'), '12:30 PM');
});

function apiFixture(response = { succeeded: true }) {
  const calls = [];
  const axios = { post: async (...args) => { calls.push(args); return { data: response }; }, get: async (...args) => { calls.push(args); return { data: [] }; }, isAxiosError: error => error?.isAxiosError === true };
  const api = load('services/member-badminton-api.ts', {
    localStorage: { getItem: () => null },
    require: name => {
      if (name === 'axios') return axios;
      if (name === '@/env') return { getEnv: () => ({ API_URL: 'https://arena.test/api' }) };
      throw new Error(name);
    },
  });
  return { api, calls };
}
const schedule = { courtId: 'court', startDate: '2027-01-04T00:00:00', numberOfSlots: 4, slotIds: ['a', 'b'], daysOfWeek: ['Monday', 'Friday'] };

test('anonymous member checks use the dedicated endpoint and member/coupon query', async () => {
  const { api, calls } = apiFixture();
  await api.checkMemberBooking(schedule, 'KVK-MEM-20261234', 'MEMBER');
  assert.equal(calls[0][0], 'https://arena.test/api/member-badminton-bookings/check-availability');
  assert.equal(calls[0][1].startDate, '2027-01-04T00:00:00');
  assert.equal(calls[0][2].params.memberId, 'KVK-MEM-20261234');
  assert.equal(calls[0][2].params.couponCode, 'MEMBER');
  assert.equal(calls[0][2].headers.Authorization, undefined);
});

test('booking submission preserves every selected slot/day using multipart fields', async () => {
  const { api, calls } = apiFixture();
  await api.createMemberBooking({ ...schedule, memberId: 'KVK-MEM-20261234', couponCode: 'MEMBER', paymentType: 2, isHalfPayment: true, amount: 500 });
  const body = calls[0][1];
  assert.deepEqual(body.getAll('SlotIds'), ['a', 'b']);
  assert.deepEqual(body.getAll('DaysOfWeek'), ['Monday', 'Friday']);
  assert.equal(body.get('IsHalfPayment'), 'true');
  assert.equal(body.get('PaymentType'), '2');
  assert.equal(body.get('Amount'), '500');
  assert.equal(body.get('StartDate'), '2027-01-04T00:00:00');
});

test('a rejected booking is never reported as a success', async () => {
  const { api } = apiFixture({ succeeded: false, message: 'Slot was just booked.' });
  await assert.rejects(api.createMemberBooking({ ...schedule, memberId: 'member', couponCode: '', paymentType: 1, isHalfPayment: false, amount: 500 }), /Slot was just booked/);
});

test('an unexpected server response never confirms a reservation', async () => {
  const { api } = apiFixture({});
  await assert.rejects(api.createMemberBooking({ ...schedule, memberId: 'member', couponCode: '', paymentType: 1, isHalfPayment: false, amount: 500 }), /could not be confirmed/);
});

