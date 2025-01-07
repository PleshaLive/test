import users from '../../usersArr';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const sorted = [...users].sort((a, b) => b.tokenBalance - a.tokenBalance);
    return res.status(200).json(sorted);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
