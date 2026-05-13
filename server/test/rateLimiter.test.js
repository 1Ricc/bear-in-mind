import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../lib/rateLimiter.js';

test('allows first message and returns correct remaining count', () => {
  const limiter = createRateLimiter(20);
  const result = limiter.consumeMessage(1);
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 19);
});

test('decrements remaining on each call', () => {
  const limiter = createRateLimiter(20);
  limiter.consumeMessage(1);
  const result = limiter.consumeMessage(1);
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 18);
});

test('blocks after limit is reached', () => {
  const limiter = createRateLimiter(3);
  limiter.consumeMessage(1);
  limiter.consumeMessage(1);
  limiter.consumeMessage(1);
  const result = limiter.consumeMessage(1);
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
});

test('different users have independent limits', () => {
  const limiter = createRateLimiter(2);
  limiter.consumeMessage(1);
  limiter.consumeMessage(1);
  const blocked = limiter.consumeMessage(1);
  const allowed = limiter.consumeMessage(2);
  assert.equal(blocked.allowed, false);
  assert.equal(allowed.allowed, true);
});

test('last allowed message returns remaining=0 but is still allowed', () => {
  const limiter = createRateLimiter(2);
  limiter.consumeMessage(1);
  const result = limiter.consumeMessage(1);
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 0);
});
