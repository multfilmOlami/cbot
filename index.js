import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CUTY_API_KEY = process.env.CUTY_API_KEY;
const ADMIN_ID = process.env.ADMIN_ID; // admin telegram ID

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Oddiy xotira (Render qayta ishga tushsa tozalanadi)
const users = new Set();

bot.onText(/\/start/, (msg) => {
  users.add(msg.from.id);

  bot.sendMessage(
    msg.chat.id,
    "👋 Salom!\n\n🔗 Link yuboring, men uni qisqartirib beraman."
  );

  // Adminga xabar
  bot.sendMessage(
    ADMIN_ID,
    `🆕 Yangi foydalanuvchi!\n👤 ID: ${msg.from.id}\n📊 Jami: ${users.size}`
  );
});

// ADMIN BUYRUQLARI
bot.onText(/\/stats/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  bot.sendMessage(
    msg.chat.id,
    `📊 Bot statistikasi:\n👥 Foydalanuvchilar: ${users.size}`
  );
});

bot.onText(/\/users/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  const list = [...users].slice(-10).join("\n");
  bot.sendMessage(
    msg.chat.id,
    `👤 Oxirgi foydalanuvchilar (10 ta):\n${list || "Hali yo‘q"}`
  );
});

// ASOSIY FUNKSIYA (avvalgi koding)
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  users.add(msg.from.id);
  const url = msg.text.trim();

  if (!url.startsWith("http")) {
    return bot.sendMessage(msg.chat.id, "❌ Iltimos, to‘g‘ri link yuboring.");
  }

  try {
    const res = await fetch(
      `https://cuty.io/api?api=${CUTY_API_KEY}&url=${encodeURIComponent(url)}`
    );
    const data = await res.json();

    if (data.status === "success") {
      bot.sendMessage(
        msg.chat.id,
        `✅ Qisqartirilgan link:\n${data.shortenedUrl}`
      );

      // Adminga xabar
      bot.sendMessage(
        ADMIN_ID,
        `🔗 Link qisqartirildi\n👤 ID: ${msg.from.id}\n🌐 ${data.shortenedUrl}`
      );
    } else {
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik: API yoki link muammosi.");
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "🚫 Server xatosi yuz berdi.");
  }
});
