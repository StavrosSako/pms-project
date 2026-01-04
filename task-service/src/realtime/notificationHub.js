const subscribersByUserId = new Map();

const ensureSet = (userId) => {
  if (!subscribersByUserId.has(userId)) {
    subscribersByUserId.set(userId, new Set());
  }
  return subscribersByUserId.get(userId);
};

export const addSubscriber = (userId, res) => {
  const set = ensureSet(userId);
  set.add(res);
};

export const removeSubscriber = (userId, res) => {
  const set = subscribersByUserId.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) subscribersByUserId.delete(userId);
};

export const sendToAll = (event, data) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [userId, set] of subscribersByUserId.entries()) {
    for (const res of set) {
      try {
        res.write(payload);
      } catch (_) {
        set.delete(res);
      }
    }

    if (set.size === 0) subscribersByUserId.delete(userId);
  }
};

export const sendToUser = (userId, event, data) => {
  const set = subscribersByUserId.get(userId);
  if (!set) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch (_) {
      set.delete(res);
    }
  }

  if (set.size === 0) subscribersByUserId.delete(userId);
};

export const sendKeepAlive = () => {
  for (const set of subscribersByUserId.values()) {
    for (const res of set) {
      try {
        res.write(':keepalive\n\n');
      } catch (_) {
        set.delete(res);
      }
    }
  }
};
