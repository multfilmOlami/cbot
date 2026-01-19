import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

// Render’da kiritgan o‘zgaruvchilarimizni olamiz
const BOT_TOKEN = process.env.BOT_TOKEN;
const CUTY_API_KEY = process.env.CUTY_API_KEY;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Salom!\n\n🔗 Link yuboring, men uni qisqartirib beraman."
  );
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

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
    } else {
      bot.sendMessage(msg.chat.id, "⚠️ Xatolik: API kalit yoki linkda muammo.");
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "🚫 Server xatosi yuz berdi.");
  }
});
