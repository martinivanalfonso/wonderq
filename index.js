const wq = require("./WonderQ");

/*
======================================
WonderQ is simple queue that allows writers to write to it, and consumer to read from it.
======================================
*/

async function main() {
  console.log("Starting server...");

  const wonderQ = new wq.WonderQ({
    name: "WonderQ_001",
    port: 6379,
    host: "127.0.0.1",
    visibilityTimeOut: 300,
  });

  await wonderQ.push("TESTA", (err, value) => {
    if (err) console.log(err);
    console.log('push' + value)
  });
  await wonderQ.push("TESTB", (err, value) => {
    if (err) console.log(err);
    console.log('push' + value)
  });

  await wonderQ.get((err, messages) => {
    if (err) console.log(err);
    if (messages.length) console.log(messages);
  });

  await wonderQ.get((err, value) => {
    if (err) console.log(err);
    console.log(value);

   wonderQ.jobDone(value, (err) => {
      if (err) console.log(err)
      console.log("job done")
    })

      wonderQ.destroy()

  });


}
main();
