require("dotenv").config();
const easyvk = require("easyvk");
const S = require("string");
const fs = require("fs");

const schedule = require("node-schedule");

const job = schedule.scheduleJob("*/10 * * * * *", () => {
  main();
});

const main = () => {
  easyvk({
    token:
      "5d40085a4b82ba5009f835e339693571ed6089d67d86f8d2fc7ba128da1f80b937ca0ddbcaddef6b6256c",
    mode: {
      name: "highload",
    },
  })
    .then(async (vk) => {
      // const phrases = fs.readFileSync("./Files/phrases.txt", "utf-8");
      // const triggerSubstrings = phrases.split("\n");

      const substrings = ["авто"];
      const triggerSubstrings = substrings.map((str) => `!${str}`);

      // const startMessageId = +fs.readFileSync("./Files/start_message_id.txt");

      vk.post("messages.getHistory", {
        peer_id: 2000000000 + 129,
        extended: 1,
        offset: -10,
        count: 10,
        start_message_id: 266999,
      })
        .then((response) => {
          const messages = response.items;

          console.log(
            "messages ids:",
            messages.map((m) => m?.id)
          );

          const filtered = messages.filter((message) => {
            console.log("message:", message.date);
            console.log("Date.now():", Date.now() / 1000);
            return;
            let flag = false;
            for (const substring of triggerSubstrings) {
              console.log("substring:", substring);
              console.log("message:", message?.text);
              const contains = S(message.text.toLowerCase()).contains(
                S(substring.toLowerCase())
              );
              if (contains) {
                flag = true;
              }
            }
            return flag;
          });

          if (filtered.length > 0) {
            for (const message of filtered) {
              const textMessage = `Сообщение из чата: "${message?.text}"`;

              vk.post("messages.send", {
                peer_id: vk.session.user_id,
                message: textMessage,
                random_id: easyvk.randomId(),
              });
            }
          }

          console.log("messages.length:", messages.length);
          // fs.writeFileSync(
          //   "./Files/start_message_id.txt",
          //   `${messages[0]?.id}`
          // );
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch(console.error);
};
