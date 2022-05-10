const bootbot = require("better-bootbot");
const dotenv = require("dotenv");
const env = require("env-var");
const { MEDIADIR } = require("./src/constants/path");
const { createDirectory, fetchPackage } = require("./src/modules/os");
const puppeteer = require("puppeteer");
const { resolve } = require("path");

dotenv.config({
  path: ".env",
});

const config = {
  FB_ACCESS_TOKEN: env.get("FB_ACCESS_TOKEN").required().asString(),
  FB_VERIFY_TOKEN: env.get("FB_VERIFY_TOKEN").required().asString(),
  FB_APP_SECRET: env.get("FB_APP_SECRET").required().asString(),
  PORT: env.get("PORT").required().asInt(),
};

const bot = new bootbot({
  accessToken: config.FB_ACCESS_TOKEN,
  verifyToken: config.FB_VERIFY_TOKEN,
  appSecret: config.FB_APP_SECRET,
});

bot.on("message", (payload, chat) => {
  const text = payload.message.text;

  fetchImage(text)
    .then(() => {
      chat.say("Website has been correctly fetched");
      sendFileAttachmentToMessenger(chat, "object.pdf");
    })
    .catch((err) => {
      console.log(err);
      chat.say("Website has not been fetched");
    });
});

const fetchImage = async (link) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link);
  await page.pdf({ path: `${resolve(MEDIADIR, "object.pdf")}`, format: "A4" });
  await browser.close();
};

const sendFileAttachmentToMessenger = (chat, file) => {
  // exemple
  try {
    chat.say({
      attachment: "file",
      url: "https://78c3-154-126-36-16.ngrok.io/object",
    });
  } catch (error) {
    chay.say(error);
  }
};

// Set express static folder
bot.app.set("static", resolve(__dirname, "medias"));

bot.app.get("/object", (req, res) => {
  res.sendFile(__dirname + "/medias/object.pdf");
});

bot.on("postback", (event, chat) => {
  console.log(event, chat);
});
bot.on("data", (event, chat) => {
  console.log(event, chat);
});

bot.app.get("/", (req, res) => {
  res.send({
    hello: "world",
  });
});

bot.start(config.PORT);
