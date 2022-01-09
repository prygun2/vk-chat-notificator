require("dotenv").config();
const easyvk = require("easyvk");
const S = require("string");
// const fs = require("fs");

const schedule = require("node-schedule");

schedule.scheduleJob("*/5 * * * * *", () => {
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
      const substrings = ["машин", "авто"];
      const triggerSubstrings = substrings.map((str) => `${str}`);

      vk.post("messages.getHistory", {
        peer_id: 2000000000 + 129,
        extended: 1,
        // offset: -10,
        count: 200,
        // start_message_id: 266999,
      })
        .then((response) => {
          const messages = response.items;

          const filteredMessages = messages.filter((message) => {
            return message.date * 1000 > Date.now() - 60 * 60 * 1000;
          });

          const filtered = filteredMessages.filter((message) => {
            let flag = false;
            for (const substring of triggerSubstrings) {
              const contains = S(message.text.toLowerCase()).contains(
                S(substring.toLowerCase())
              );
              if (contains) {
                flag = true;
              }
            }
            return flag;
          });

          console.log("filtered:", filtered);

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

          console.log("filtered.length:", filtered.length);
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
