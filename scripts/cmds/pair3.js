 const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "pair3",
    aliases: [],
    version: "2.0-VIP",
    author: "OTINXSANDIP + Modified by ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Pair with centered GIF (VIP)",
    longDescription: "Pairs you with another user and shows a video with both avatars and a love GIF in the center.",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, usersData, message }) {
    const vipPath = path.join(__dirname, "vip.json");
    if (!fs.existsSync(vipPath)) return message.reply("VIP system not configured. `vip.json` missing.");

    const vipData = JSON.parse(fs.readFileSync(vipPath));
    const isVip = vipData.some(user => user.uid === event.senderID && (user.expire === 0 || user.expire > Date.now()));
    if (!isVip) return message.reply("❌ You’re not a VIP! Use !vip to apply.");

    const { threadID, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const otherUsers = threadInfo.participantIDs.filter(id => id !== senderID && id !== botID);
    if (otherUsers.length < 1) return message.reply("No other user available to pair with!");

    const partnerID = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    const name1 = (await usersData.get(senderID)).name;
    const name2 = (await usersData.get(partnerID)).name;
    const percentage = Math.floor(Math.random() * 101);

    // File paths
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);
    const avatar1Path = path.join(cacheDir, "avatar1.png");
    const avatar2Path = path.join(cacheDir, "avatar2.png");
    const outputVideo = path.join(cacheDir, "paired.mp4");

    // Random GIFs
    const gifs = [
      "https://i.ibb.co/y4dWfQq/image.gif",
      "https://i.postimg.cc/tRhsd74M/829c0b19-1d38-44b3-9fa9-bebe74e7b21a.gif",
      "https://i.postimg.cc/TwvRhqgY/85214f13824854bb63145bc85f850cf5.gif"
    ];
    const selectedGif = gifs[Math.floor(Math.random() * gifs.length)];
    const gifPath = path.join(cacheDir, "love.gif");

    // Download avatars and gif
    const getAvatar = async (uid, path) => {
      const url = `https://graph.facebook.com/${uid}/picture?width=300&height=300&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(path, res.data);
    };
    await getAvatar(senderID, avatar1Path);
    await getAvatar(partnerID, avatar2Path);

    const gifData = (await axios.get(selectedGif, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(gifPath, gifData);

    // Generate video using FFmpeg (avatar1 + gif + avatar2 horizontally)
    const ffmpegCmd = `
      ffmpeg -y -i "${avatar1Path}" -i "${gifPath}" -i "${avatar2Path}" -filter_complex "
      [0:v]scale=300:300[av1];
      [1:v]scale=200:300[gif];
      [2:v]scale=300:300[av2];
      [av1][gif][av2]hstack=inputs=3[out]
      " -map "[out]" -t 5 -r 10 "${outputVideo}"
    `;

    try {
      execSync(ffmpegCmd, { stdio: "ignore" });
    } catch (err) {
      return message.reply("❌ FFmpeg failed to generate the video.");
    }

    // Send final video
    const bodyText = `💘 Successful Pairing!\n💑 ${name1} 💖 ${name2}\n❤️ Match: ${percentage}%`;
    const mentions = [
      { id: senderID, tag: name1 },
      { id: partnerID, tag: name2 }
    ];

    return api.sendMessage({
      body: bodyText,
      mentions,
      attachment: fs.createReadStream(outputVideo)
    }, threadID);
  }
};