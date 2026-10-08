const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(name, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/', name + '.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const context = { exports: {}, setTimeout, ...globals };
  vm.runInNewContext(compiled.outputText, context);
  return context.exports;
}
const { waitForGymPayment } = load('gym-payment-status');
const noPause = async () => {};

test('waits for a server-confirmed successful payment', async () => {
  let calls = 0;
  const result = await waitForGymPayment(async () => ({ orderId: 'order', paymentStatus: ++calls < 3 ? 1 : 2 }), 4, noPause);
  assert.equal(calls, 3);
  assert.equal(result.paymentStatus, 2);
});
test('failed gateway result is not reported as success', async () => {
  const result = await waitForGymPayment(async () => ({ orderId: 'order', paymentStatus: 5 }), 4, noPause);
  assert.equal(result.paymentStatus, 5);
});
test('timeout retains pending rather than assuming success', async () => {
  const result = await waitForGymPayment(async () => ({ orderId: 'order', paymentStatus: 1 }), 2, noPause);
  assert.equal(result.paymentStatus, 1);
});
test('temporary status API failures can recover', async () => {
  let calls = 0;
  const result = await waitForGymPayment(async () => {
    if (++calls === 1) throw new Error('offline');
    return { orderId: 'order', paymentStatus: 2 };
  }, 3, noPause);
  assert.equal(result.paymentStatus, 2);
});
test('an unreachable status API never confirms payment', async () => {
  await assert.rejects(waitForGymPayment(async () => { throw new Error('offline'); }, 2, noPause), /offline/);
});

function checkoutFixture(status = 1) {
  const entries = new Map();
  const calls = { paid: 0, pending: 0, cancelled: 0, error: 0, reverse: 0, create: 0 };
  const sdk = {};
  const api = {
    createPayment: async () => { calls.create++; return { orderId: 'order', merchantId: 'merchant', amount: '1500.00', currency: 'LKR', hash: 'hash', sandbox: false }; },
    getPaymentStatus: async () => ({ orderId: 'order', paymentStatus: status }),
    reversePayment: async () => { calls.reverse++; },
  };
  sdk.startPayment = (payment) => { calls.payment = payment; };
  const checkout = load('gym-checkout', {
    window: { payhere: sdk },
    localStorage: { getItem: (key) => entries.get(key) || null, setItem: (key, value) => entries.set(key, value), removeItem: (key) => entries.delete(key) },
    require: (name) => {
      if (name === '@/env') return { getEnv: () => ({ API_URL: 'https://example.test/api/' }) };
      if (name === './pay-api') return api;
      if (name === './gym-payment-status') return { waitForGymPayment: (read) => read() };
      throw new Error('Unexpected module: ' + name);
    },
  });
  const callbacks = { onPaid: () => calls.paid++, onPending: () => calls.pending++, onCancelled: () => calls.cancelled++, onError: () => calls.error++ };
  const pending = { memberId: 'member', membershipPlanId: 'plan', orderId: 'order' };
  const customer = { firstName: 'Test', lastName: 'Customer', email: 'test@example.test', phone: '771234567' };
  return { ...checkout, entries, calls, callbacks, sdk, pending, customer };
}
test('refresh resumes status checks without reversing or deleting a pending order', async () => {
  const f = checkoutFixture(1);
  f.entries.set('pendingMembershipPayment', JSON.stringify(f.pending));
  await f.resumeGymPayment(f.callbacks);
  assert.equal(f.calls.reverse, 0);
  assert.equal(f.calls.pending, 1);
  assert.equal(f.calls.paid, 0);
  assert.ok(f.entries.has('pendingMembershipPayment'));
});
test('checkout uses server mode and confirms persisted success before clearing its order', async () => {
  const f = checkoutFixture(2);
  await f.startGymPayment({ ...f.pending, amount: 1500 }, f.customer, f.callbacks);
  assert.equal(f.calls.payment.sandbox, false);
  assert.equal(f.calls.payment.phone, '0771234567');
  assert.equal(f.calls.payment.notify_url, 'https://example.test/api/payments/notify');
  assert.equal(f.calls.paid, 0);
  await f.sdk.onCompleted('order');
  assert.equal(f.calls.paid, 1);
  assert.equal(f.entries.has('pendingMembershipPayment'), false);
});
test('completed checkout with a failed server result does not show success', async () => {
  const f = checkoutFixture(5);
  await f.startGymPayment({ ...f.pending, amount: 1500 }, f.customer, f.callbacks);
  await f.sdk.onCompleted('order');
  assert.equal(f.calls.paid, 0);
  assert.equal(f.calls.cancelled, 1);
});
test('an unconfirmed previous payment prevents a second checkout', async () => {
  const f = checkoutFixture(1);
  f.entries.set('pendingMembershipPayment', JSON.stringify(f.pending));
  await assert.rejects(f.startGymPayment({ ...f.pending, amount: 1500 }, f.customer, f.callbacks), /awaiting confirmation/);
  assert.equal(f.calls.create, 0);
});
test('late paid result after checkout dismissal is still shown as paid', async () => {
  const f = checkoutFixture(2);
  await f.startGymPayment({ ...f.pending, amount: 1500 }, f.customer, f.callbacks);
  await f.sdk.onDismissed();
  assert.equal(f.calls.reverse, 1);
  assert.equal(f.calls.paid, 1);
  assert.equal(f.calls.cancelled, 0);
});
