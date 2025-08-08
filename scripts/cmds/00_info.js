const moment = require('moment-timezone');

module.exports = {
	config: {
		name: "info",
		version: "1.0",
		author: "NIROB",
		countDown: 20,
		role: 0,
		shortDescription: { vi: "", en: "" },
		longDescription: { vi: "", en: "" },
		category: "owner",
		guide: { en: "" },
		envConfig: {}
	},

	onStart: async function ({ message }) {
		const botName = "Kakashi-Bot";
		const botPrefix = "/";
		const authorName = "ＮＩＲＯＢ ᶻ 𝗓 𐰁";
		const ownAge = "19";
		const teamName = "GitHub Team";
		const authorFB = "https://www.facebook.com/hatake.kakashi.NN";
		const authorInsta = "nai";
		const tikTok = "nirob.f8";

		const now = moment().tz('Asia/Jakarta');
		const date = now.format('MMMM Do YYYY');
		const time = now.format('h:mm:ss A');

		const uptime = process.uptime();
		const seconds = Math.floor(uptime % 60);
		const minutes = Math.floor((uptime / 60) % 60);
		const hours = Math.floor((uptime / (60 * 60)) % 24);
		const days = Math.floor(uptime / (60 * 60 * 24));
		const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

		message.reply({
			body: `🌐 『 BOT & OWNER INFO 』 🌐

🤖 Bot Name: ${botName}
📌 Bot Prefix: ${botPrefix}
👑 Owner: ${authorName}
🎂 Age: ${ownAge}
📅 Date: ${date}
⏰ Time: ${time}
🛠 Team: ${teamName}
📈 Uptime: ${uptimeString}

🔗 Facebook: ${authorFB}
📸 Instagram: ${authorInsta}
🎵 TikTok: ${tikTok}

===========================`
		});
	},

	onChat: async function ({ event, message }) {
		if (event.body && event.body.toLowerCase() === "info") {
			this.onStart({ message });
		}
	}
};