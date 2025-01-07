import users from '../../usersArr';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { publicKey, nickname, twitter, tokenBalance } = req.body;
    if (!publicKey || tokenBalance === undefined || !nickname) {
      return res.status(400).json({ error: 'Missing data...' });
    }
    const idx = users.findIndex((u) => u.publicKey === publicKey);
    if (idx === -1) {
      users.push({ publicKey, nickname, twitter, tokenBalance });
    } else {
      users[idx].nickname = nickname;
      users[idx].twitter = twitter;
      users[idx].tokenBalance = tokenBalance;
    }
    return res.status(200).json({ message: 'User updated' });
  } else if (req.method === 'GET') {
    // ...
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
