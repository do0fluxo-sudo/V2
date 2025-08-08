 const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    countDown: 5,
    role: 0,
    category: "love",
    shortDescription: {
      en: "Pair command with lovely note and mentions",
    },
  },
  onStart: async function ({ api, event }) {
    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    let pathAvt2 = __dirname + "/cache/Avthai.png";

    var id1 = event.senderID;

    // Get user names properly from api
    let name1 = (await api.getUserInfo(id1))[id1]?.name || "User1";

    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo;

    let gender1;
    for (let c of all) {
      if (c.id == id1) {
        gender1 = c.gender;
        break;
      }
    }
    const botID = api.getCurrentUserID();

    let ungvien = [];
    if (gender1 === "FEMALE") {
      for (let u of all) {
        if (u.gender === "MALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    } else if (gender1 === "MALE") {
      for (let u of all) {
        if (u.gender === "FEMALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    } else {
      for (let u of all) {
        if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    }

    if (ungvien.length === 0)
      return api.sendMessage("Sorry, no suitable match found in this group.", event.threadID, event.messageID);

    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    let name2 = (await api.getUserInfo(id2))[id2]?.name || "User2";

    // Pair percentage
    var rd1 = Math.floor(Math.random() * 100) + 1;
    var cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    var rd2 = cc[Math.floor(Math.random() * cc.length)];
    var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`];
    var tile = djtme[Math.floor(Math.random() * djtme.length)];

    // Lovely notes array with emojis and styled text
    const lovelyNotes = [
      "💖✨ *Your love is like a beautiful melody.* 🎶",
      "🌟❤️ *Together you shine brighter than stars.* ✨",
      "💞 Two hearts beating as one. 💓",
      "🎢💕 *Love is the greatest adventure.* 🌈",
      "💘 *You both complete each other perfectly.* 🤝",
      "🌠💌 *A love story written in the stars.* 🌌",
      "🎇 When you are together, magic happens. 🔮",
      "💝 Soulmates destined to be. 💫",
      "🌸 Love blooms beautifully here. 🌹",
      "💑 Forever starts today with you two. 🕊️"
    ];
    let note = lovelyNotes[Math.floor(Math.random() * lovelyNotes.length)];

    // Background fixed URL
    var background = ["https://i.postimg.cc/fLd1tGZ6/Picsart-25-08-09-00-04-35-254.jpg"];
    var rd = background[Math.floor(Math.random() * background.length)];

    // Download avatars
    let getAvtmot = (
      await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    let getAvthai = (
      await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    // Download background
    let getbackground = (
      await axios.get(rd, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

    // Load images
    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);
    let baseAvt2 = await loadImage(pathAvt2);

    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Draw square avatars (no circle mask)
    ctx.drawImage(baseAvt1, 100, 150, 300, 300);
    ctx.drawImage(baseAvt2, 900, 150, 300, 300);

    // Save final image
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Prepare message body with mentions
    const mentions = [
      { tag: name1, id: id1 },
      { tag: name2, id: id2 },
    ];

    const body = 
      `💞 𝐋𝐨𝐯𝐞 𝐏𝐚𝐢𝐫 𝐀𝐥𝐞𝐫𝐭 💞\n\n` +
      `💑 Congratulations ${name1} & ${name2}!\n` +
      `💌 ${note}\n` +
      `🔗 Love Connection: ${tile}% 💖`;

    return api.sendMessage(
      {
        body: body,
        mentions: mentions,
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};