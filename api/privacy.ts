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
      <title>Политика конфиденциальности - LFG AI Market</title>
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
      <h1>Политика конфиденциальности LFG AI Market</h1>
      
      <h2>1. Сбор данных</h2>
      <p>Мы не собираем персональные данные пользователей. Вся информация обрабатывается локально в браузере.</p>
      
      <h2>2. Данные кошелька</h2>
      <p>Мы не имеем доступа к приватным ключам пользователей. Все операции с кошельком происходят через протокол TonConnect.</p>
      
      <h2>3. Аналитика</h2>
      <p>Мы можем собирать анонимную статистику использования для улучшения сервиса.</p>
      
      <h2>4. Безопасность</h2>
      <p>Все соединения защищены протоколом HTTPS. Транзакции обрабатываются децентрализованно в блокчейне TON.</p>
      
      <h2>5. Blockchain данные</h2>
      <p>Все транзакции записываются в публичный блокчейн TON и являются необратимыми.</p>
      
      <h2>6. Контакты</h2>
      <p>По вопросам конфиденциальности: <a href="https://t.me/ruhunt">@ruhunt</a></p>
    </body>
    </html>
  `);
};