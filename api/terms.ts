import { VercelRequest, VercelResponse } from '@vercel/node';

export default (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Условия использования - LFG AI Market</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          line-height: 1.6; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
        }
        h1 { 
          color: #fff; 
          border-bottom: 2px solid #fff; 
          padding-bottom: 10px; 
          text-align: center;
        }
        h2 { 
          color: #f0f0f0; 
          margin-top: 30px; 
        }
        p { 
          margin-bottom: 15px; 
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        a {
          color: #87ceeb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <h1>Условия использования LFG AI Market</h1>
      
      <h2>1. Принятие условий</h2>
      <p>Используя LFG AI Market, вы соглашаетесь с данными условиями использования.</p>
      
      <h2>2. Описание сервиса</h2>
      <p>LFG AI Market - это платформа для покупки готовых AI-решений с оплатой в криптовалюте TON.</p>
      
      <h2>3. Платежи</h2>
      <p>Все платежи производятся в криптовалюте TON. Платежи необратимы после подтверждения в блокчейне.</p>
      
      <h2>4. Ответственность</h2>
      <p>Пользователь несет полную ответственность за безопасность своего кошелька и приватных ключей.</p>
      
      <h2>5. Контакты</h2>
      <p>По всем вопросам обращайтесь: <a href="https://t.me/ruhunt">@ruhunt</a></p>
    </body>
    </html>
  `);
};