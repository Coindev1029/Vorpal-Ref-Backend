export async function TestStartHandler (bot, msg) {
    try {
      console.log("Test handler");
      await bot.sendMessage(msg.chat.id, `Received: ${msg.text}`);
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };