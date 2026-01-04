import { addSubscriber, removeSubscriber } from '../realtime/notificationHub.js';

export const streamNotifications = async (req, res) => {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const userId = req.user?.id;
  if (!userId) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Missing user id' })}\n\n`);
    res.end();
    return;
  }

  addSubscriber(userId, res);

  req.on('close', () => {
    removeSubscriber(userId, res);
  });
};
