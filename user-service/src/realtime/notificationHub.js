const subscribersByRole = new Map();

const ensureSet = (role) => {
  if (!subscribersByRole.has(role)) {
    subscribersByRole.set(role, new Set());
  }
  return subscribersByRole.get(role);
};

export const addSubscriber = (role, res) => {
  const set = ensureSet(role);
  set.add(res);
};

export const removeSubscriber = (role, res) => {
  const set = subscribersByRole.get(role);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) subscribersByRole.delete(role);
};

export const sendToRole = (role, event, data) => {
  const set = subscribersByRole.get(role);
  if (!set) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch (_) {
      set.delete(res);
    }
  }

  if (set.size === 0) subscribersByRole.delete(role);
};

export const sendKeepAlive = () => {
  for (const set of subscribersByRole.values()) {
    for (const res of set) {
      try {
        res.write(':keepalive\n\n');
      } catch (_) {
        set.delete(res);
      }
    }
  }
};
