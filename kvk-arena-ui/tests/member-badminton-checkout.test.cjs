const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
function fixture(statuses = [{ status: 'pending' }], paymentOverride, store = new Map(), errors = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/services/member-badminton-checkout.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const calls = { create: 0, reads: 0, gateway: 0, reverse: 0, reversed: 0, confirmed: 0, pending: 0, failed: 0, review: 0, expired: 0, error: 0 };
  const callbacks = { onConfirmed: value => { calls.confirmed++; calls.confirmation = value; }, onPending: () => calls.pending++, onFailed: () => calls.failed++, onReversed: () => calls.reversed++, onReview: () => calls.review++, onExpired: () => calls.expired++, onError: () => calls.error++ };
  const payment = paymentOverride || { orderId: 'order', merchantId: 'merchant', currency: 'LKR', amount: '900.00', hash: 'signed', sandbox: false, expiresInSeconds: 900 };
  const api = { reverseMemberPayment: async () => { calls.reverse++; if (errors.reverse) throw new Error('reverse unavailable'); return { status: 'reversed' }; }, createMemberPayment: async () => { calls.create++; if (errors.create) throw new Error('payment rejected'); return payment; }, getMemberPaymentStatus: async () => statuses[Math.min(calls.reads++, statuses.length - 1)] };
  const exports = {};
  vm.runInNewContext(compiled, { exports, Date, Error, window: { payhere: {} }, sessionStorage: { getItem: k => store.get(k) || null, setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) }, setTimeout: fn => fn(), require: name => {
    if (name === './member-badminton-api') return api;
    if (name === './payhere') return { startPayHereCheckout: (details, handlers) => { calls.gateway++; if (errors.sdk) throw new Error('checkout failed to open'); calls.details = details; calls.handlers = handlers; } };
    throw new Error(name);
  } });
  const request = { holdToken: 'reservation', customerName: 'Test Member', phoneNumber: '0771234567', email: 'test@example.com', couponCode: 'UNUSED' };
  const view = { schedule: {}, hold: {}, deadline: Date.now() + 420000, quote: {}, customerName: 'Test Member', phone: request.phoneNumber, email: request.email };
  return { api: exports, calls, callbacks, store, view, start: () => exports.startMemberCheckout(request, view, callbacks) };
}
const paid = { status: 'confirmed', confirmation: { succeeded: true, bookings: [{ bookingNumber: 'B-1' }], finalAmount: 900 } };
test('checkout opens PayHere with server-signed prices, configured sandbox and dedicated notification route', async () => {
  const f = fixture(); await f.start();
  assert.equal(f.calls.gateway, 1);
  assert.equal(f.calls.details.amount, '900.00');
  assert.equal(f.calls.details.sandbox, false);
  assert.equal(f.calls.details.notifyPath, 'member-badminton-bookings/notify');
  assert.equal(f.calls.confirmed, 0);
});
test('browser completion alone never confirms a pending payment', async () => {
  const f = fixture(); await f.start(); await f.calls.handlers.onCompleted('order');
  await f.api.resumeMemberPayment(f.callbacks);
  assert.equal(f.calls.confirmed, 0);
  assert.ok(f.api.pendingMemberPayment());
});
test('only server-confirmed payment produces a receipt and clears the pending checkout', async () => {
  const f = fixture([paid]); await f.start(); await f.api.resumeMemberPayment(f.callbacks);
  assert.equal(f.calls.confirmed, 1);
  assert.equal(f.api.pendingMemberPayment(), null);
});
test('closing unpaid checkout reverses the order and makes Pay available again', async () => {
  const f = fixture(); await f.start(); f.calls.handlers.onDismissed();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.calls.confirmed, 0);
  assert.equal(f.calls.failed, 0);
  assert.equal(f.calls.reverse, 1);
  assert.equal(f.calls.reversed, 1);
  assert.equal(f.api.pendingMemberPayment(), null);
});
test('pending checkout blocks another charge and can be restored after refresh', async () => {
  const f = fixture(); await f.start();
  await assert.rejects(f.start(), /existing payment/);
  assert.equal(f.calls.create, 1);
  const restored = fixture([paid], undefined, f.store);
  await restored.api.resumeMemberPayment(restored.callbacks);
  assert.equal(restored.calls.gateway, 0);
  assert.equal(restored.calls.confirmed, 1);
});
test('verified gateway failures are recoverable and review cases do not trigger another charge', async () => {
  const failed = fixture([{ status: 'failed' }]); await failed.start(); await failed.api.resumeMemberPayment(failed.callbacks);
  assert.equal(failed.calls.failed, 1); assert.equal(failed.api.pendingMemberPayment(), null);
  const review = fixture([{ status: 'review' }]); await review.start(); await review.api.resumeMemberPayment(review.callbacks);
  assert.equal(review.calls.review, 1); assert.equal(review.calls.confirmed, 0); assert.ok(review.api.pendingMemberPayment());
});
test('fully coupon-covered server confirmation does not launch a zero-value gateway charge', async () => {
  const f = fixture([], { confirmation: paid.confirmation }); await f.start();
  assert.equal(f.calls.gateway, 0); assert.equal(f.calls.confirmed, 1); assert.equal(f.api.pendingMemberPayment(), null);
});

test('an expired checkout can be released without claiming a failed or successful charge', async () => {
  const f = fixture([{ status: 'expired' }]); await f.start(); await f.api.resumeMemberPayment(f.callbacks);
  assert.equal(f.calls.expired, 1); assert.equal(f.calls.confirmed, 0); assert.equal(f.calls.failed, 0);
});

test('starting checkout preserves the original deadline despite the gateway response', async () => {
  const f = fixture(); await f.start();
  assert.equal(f.api.pendingMemberPayment().view.deadline, f.view.deadline);
});
test('closing an already paid checkout verifies its receipt without reversing it', async () => {
  const f = fixture([paid]); await f.start(); f.calls.handlers.onDismissed();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.calls.reverse, 0); assert.equal(f.calls.confirmed, 1);
});
test('the same hold can start another checkout after the unpaid order is reversed', async () => {
  const f = fixture(); await f.start(); f.calls.handlers.onDismissed();
  await new Promise(resolve => setImmediate(resolve));
  await f.start();
  assert.equal(f.calls.create, 2); assert.equal(f.calls.gateway, 2);
});

test('payment creation errors clear the pending lock and allow another Pay attempt', async () => {
  const f = fixture(undefined, undefined, undefined, { create: true });
  await f.start();
  assert.equal(f.calls.error, 1); assert.equal(f.calls.reversed, 1);
  assert.equal(f.calls.gateway, 0); assert.equal(f.api.pendingMemberPayment(), null);
  await f.start(); assert.equal(f.calls.create, 2);
});
test('a rejected preparation never locks navigation even when cleanup is temporarily unavailable', async () => {
  const f = fixture(undefined, undefined, undefined, { create: true, reverse: true });
  await f.start(); assert.equal(f.api.pendingMemberPayment(), null);
  assert.equal(f.calls.reversed, 1); assert.equal(f.calls.error, 1);
});
test('a malformed preparation response is recoverable before the gateway opens', async () => {
  const f = fixture(undefined, {}); await f.start();
  assert.equal(f.calls.gateway, 0); assert.equal(f.calls.error, 1);
  assert.equal(f.api.pendingMemberPayment(), null);
});
test('a synchronous gateway startup error reverses the prepared order and unlocks Pay', async () => {
  const f = fixture(undefined, undefined, undefined, { sdk: true }); await f.start();
  assert.equal(f.calls.reverse, 1); assert.equal(f.calls.reversed, 1);
  assert.equal(f.calls.error, 1); assert.equal(f.api.pendingMemberPayment(), null);
});

test('an expired previous hold cannot lock payment for a newly reserved schedule', async () => {
  const store = new Map([['pendingMemberBadmintonPayment', JSON.stringify({ token: 'expired-hold', view: {} })]]);
  const f = fixture([{ status: 'expired' }], undefined, store);
  await f.start();
  assert.equal(f.calls.create, 1); assert.equal(f.calls.gateway, 1);
  assert.equal(f.api.pendingMemberPayment().token, 'reservation');
});
test('a hold expiring while Pay is preparing never opens the gateway', async () => {
  const f = fixture(); f.view.deadline = Date.now() - 1;
  await f.start();
  assert.equal(f.calls.gateway, 0); assert.equal(f.calls.expired, 1);
  assert.equal(f.calls.reverse, 1); assert.equal(f.api.pendingMemberPayment(), null);
});
