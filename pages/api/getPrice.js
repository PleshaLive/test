// pages/api/getPrice.js
export default async function handler(req, res) {
    try {
      const { tokenMint } = req.query; // например, ?tokenMint=3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump
      const apiKey = process.env.BIRDEYE_API_KEY; 
  
      // Пример URL (проверьте в BirdEye docs). Возможно, нужно "&api_key=..." или "Authorization" в заголовках
      const url = `https://public-api.birdeye.so/public/price?address=${tokenMint}&api_key=${apiKey}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`BirdEye API error: ${response.status}`);
      }
      const data = await response.json();
  
      // Возвращаем "как есть" или структуру { priceData: data }
      return res.status(200).json(data);
    } catch (err) {
      console.error('Ошибка при запросе BirdEye:', err);
      return res.status(500).json({ error: err.message });
    }
  }
  