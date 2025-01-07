// pages/api/index.js
// Этот файл — простой API-роут. Здесь НЕ должно быть React-компонентов.
// Он отвечает JSON-данными, когда вы открываете /api в браузере.

export default function handler(req, res) {
  res.status(200).json({
    message: "Hello from /api/index! Это пример серверного кода."
  });
}
