module.exports = {
  config: {
    name: "spy",
    version: "2.0",
    author: "Shikaki // Modified by Kakashi",
    countDown: 60,
    role: 0,
    shortDescription: "Get user info stylishly",
    longDescription: "Get stylish user information by mention, UID, or reply",
    category: "info",
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      const uidInput = args[0];
      let uid;

      if (uidInput && /^\d+$/.test(uidInput)) {
        uid = uidInput;
      } else if (uidInput && uidInput.includes("profile.php?id=")) {
        const match = uidInput.match(/id=(\d+)/);
        if (match) uid = match[1];
      } else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
      } else if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else {
        uid = event.senderID;
      }

      api.getUserInfo(uid, async (err, data) => {
        if (err || !data[uid]) return message.reply("❌ Couldn't retrieve user info.");

        const info = data[uid];
        const avatarUrl = await usersData.getAvatarUrl(uid);

        const gender = info.gender === 1 ? "👧 Girl" : info.gender === 2 ? "👦 Boy" : "❓ Unknown";
        const isFriend = info.isFriend ? "✅ Yes" : "❌ No";
        const isBirthday = info.isBirthday ? "🎉 Yes" : "❌ No";
        const vanity = info.vanity ? `https://facebook.com/${info.vanity}` : "🔒 Private";
        const profileLink = info.profileUrl || vanity;

        const fancyMsg = 
`🎭 𝗨𝘀𝗲𝗿 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 🎭

👤 𝗡𝗮𝗺𝗲: ${info.name}
🆔 𝗨𝗜𝗗: ${uid}
🌐 𝗣𝗿𝗼𝗳𝗶𝗹𝗲: ${profileLink}
🙋‍♂️ 𝗚𝗲𝗻𝗱𝗲𝗿: ${gender}
👫 𝗙𝗿𝗶𝗲𝗻𝗱: ${isFriend}
🎂 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆 𝗧𝗼𝗱𝗮𝘆: ${isBirthday}
🧩 𝗧𝘆𝗽𝗲: ${info.type}
📎 𝗩𝗮𝗻𝗶𝘁𝘆: ${vanity}`;

        message.reply({
          body: fancyMsg,
          attachment: await global.utils.getStreamFromURL(avatarUrl)
        });
      });
    } catch (e) {
      console.error(e);
      message.reply("⚠️ Something went wrong while fetching info.");
    }
  }
};