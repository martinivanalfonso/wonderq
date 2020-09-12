const wq = require("./WonderQ");

/*
======================================
WonderQ is simple queue that allows writers to write to it, and consumers to read from it.
======================================
*/

function main() {
  console.log("Starting server...");

  const wonderQ = new wq.WonderQ({
    name: "WonderQ_001",
    port: 6379,
    host: "127.0.0.1",
    visibilityTimeOut: 300,
  });

  wonderQ.select(0, () => {
    console.log("db select success");
  });

  wonderQ.push("Your message here", (err) => {
    if (err) console.log(err);
  });

  wonderQ.get((err, messages) => {
    if (err) console.log(err);
    if (messages.length) console.log(messages[0]);
  });
}
main();
