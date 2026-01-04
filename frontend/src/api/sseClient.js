const parseSseEvents = (buffer) => {
  const events = [];
  const parts = buffer.split(/\n\n/);
  const incomplete = parts.pop() ?? '';

  for (const part of parts) {
    const lines = part.split(/\n/);
    let event = 'message';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const chunk = line.slice(5).trim();
        data = data ? `${data}\n${chunk}` : chunk;
      }
    }

    if (!data) continue;

    try {
      events.push({ event, data: JSON.parse(data) });
    } catch (_) {
      events.push({ event, data });
    }
  }

  return { events, incomplete };
};

export const subscribeSse = ({ url, token, onEvent, onError }) => {
  const controller = new AbortController();
  let stopped = false;

  const run = async () => {
    let backoff = 500;

    while (!stopped) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream'
          },
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error(`SSE request failed (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('SSE response has no body');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        backoff = 500;

        while (!stopped) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parsed = parseSseEvents(buffer);
          buffer = parsed.incomplete;

          for (const evt of parsed.events) {
            try {
              onEvent?.(evt);
            } catch (err) {
              onError?.(err);
            }
          }
        }
      } catch (err) {
        if (stopped) break;
        onError?.(err);

        await new Promise(r => setTimeout(r, backoff));
        backoff = Math.min(backoff * 2, 8000);
      }
    }
  };

  run();

  return () => {
    stopped = true;
    controller.abort();
  };
};
