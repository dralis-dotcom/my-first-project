export async function sendTelegramNotification(taskTitle) {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ Task completed: "${taskTitle}"`,
        parse_mode: 'HTML',
      }),
    })
  } catch {
    // Notification failure should not break the app
  }
}
