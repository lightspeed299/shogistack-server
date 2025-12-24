// shogistack-server/logger.js

const https = require('https');

// あなたのDiscord Webhook URL
const WEBHOOK_URL = "https://discord.com/api/webhooks/1453039131876921344/RTvAGX-V1S3zDGqLCbtLjx0Ys_pZW3N3oUJKYkd6STZU3jxt-j2itEj7yhP7inl6awA8";

// 汎用送信関数
const sendDiscordPayload = (title, message, color, fields = []) => {
  if (!WEBHOOK_URL) return;

  const payload = JSON.stringify({
    username: "ShogiStack Monitor",
    avatar_url: "https://www.come-toto.com/wp-content/uploads/2022/07/c454eaf08ab8f5ea7a476f5930c46ed3.jpeg",
    embeds: [{
      title: title,
      description: message,
      color: color, // 10進数のカラーコード
      fields: fields,
      footer: { text: `Env: ${process.env.NODE_ENV || 'Dev'}` },
      timestamp: new Date().toISOString()
    }]
  });

  const req = https.request(WEBHOOK_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  });
  
  req.on('error', (e) => console.log("Discord送信失敗:", e.message));
  req.write(payload);
  req.end();
};

// 1. エラー監視用 (赤色)
const initLogger = () => {
    const originalConsoleError = console.error;
    console.error = function (...args) {
        originalConsoleError.apply(console, args);
        try {
            const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
            const stack = args.find(a => a instanceof Error)?.stack || "No stack trace";
            
            sendDiscordPayload(
                "🚨 サーバーエラー発生 (Error)", 
                "予期せぬエラーが発生しました。",
                15158332, // Red
                [
                    { name: "Message", value: `\`\`\`${message.substring(0, 1000)}\`\`\`` },
                    { name: "Stack", value: `\`\`\`js\n${stack.substring(0, 1000)}\n\`\`\`` }
                ]
            );
        } catch (e) {
            originalConsoleError.call(console, "Logger internal error:", e);
        }
    };
    console.log("✅ Logger initialized.");
};

// 2. 情報通知用 (青色) - 起動や切断ログ用
const sendInfo = (title, message, details = []) => {
    // コンソールにも出す
    console.log(`[Discord Log] ${title}: ${message}`);
    
    sendDiscordPayload(
        title, 
        message, 
        3447003, // Blue
        details
    );
};

module.exports = { initLogger, sendInfo };