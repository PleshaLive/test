// pages/api/leaderboard.js

export default function handler(req, res) {
  if (req.method === 'GET') {
    // ...
    return res.status(200).json(sortedUsers);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
