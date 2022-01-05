require("dotenv").config();
const easyvk = require("easyvk");
const S = require("string");
const fs = require("fs");

const schedule = require("node-schedule");

const job = schedule.scheduleJob(process.env.SCHEDULE_PERIOD, () => {
  main();
});

const main = () => {
  easyvk({
    token: process.env.VK_USER_TOKEN,
    mode: {
      name: "highload",
    },
  })
    .then(async (vk) => {
      const phrases = fs.readFileSync("./Files/phrases.txt", "utf-8");
      const subStrs = phrases.split("\n");

      const startMessage = +fs.readFileSync("./Files/start_message_id.txt");

      vk.post("messages.getHistory", {
        peer_id: 2000000000 + 129,
        extended: 1,
        offset: -10,
        count: 10,
        start_message_id: startMessage || 266999,
      })
        .then((response) => {
          const messages = response.items;

          console.log(
            "messages:",
            messages.map((m) => m?.id)
          );

          const filtered = messages.filter((message) => {
            let flag = false;
            for (const sub of subStrs) {
              const contains = S(message.text.toLowerCase()).contains(
                S(sub.toLowerCase())
              );
              if (contains) {
                flag = true;
              }
            }
            return flag;
          });

          if (filtered.length > 0) {
            for (const msg of filtered) {
              const textMsg = `Сообщение из чата: "${msg?.text}"`;

              vk.post("messages.send", {
                peer_id: vk.session.user_id,
                message: textMsg,
                random_id: easyvk.randomId(),
              });
            }
          }

          console.log("messages.length:", messages.length);
          fs.writeFileSync(
            "./Files/start_message_id.txt",
            `${messages[0]?.id}`
          );
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch(console.error);
};
