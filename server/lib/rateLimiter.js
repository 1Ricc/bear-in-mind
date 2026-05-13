const DAILY_LIMIT = 20;

function getToday() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

export function createRateLimiter(limit = DAILY_LIMIT) {
  const rateLimits = new Map(); // Map<employeeId, { count, date }>

  function consumeMessage(employeeId) {
    const today = getToday();
    const entry = rateLimits.get(employeeId);

    if (!entry || entry.date !== today) {
      rateLimits.set(employeeId, { count: 1, date: today });
      return { allowed: true, remaining: limit - 1 };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    const newCount = entry.count + 1;
    rateLimits.set(employeeId, { count: newCount, date: today });
    return { allowed: true, remaining: limit - newCount };
  }

  return { consumeMessage };
}
