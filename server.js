import wq from "./WonderQ";
import "dotenv/config";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser"

/*
======================================
WonderQ is simple queue that allows writers to write to it, and consumer to read from it.
======================================
*/
console.log("Starting server...");

const wonderQ = new wq.WonderQ({
  name: "WonderQ_001",
  port: 6379,
  host: "127.0.0.1",
  visibilityTimeOut: 300,
});

const app = express();

app.use(cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

/**
 * @api {post} / Sumbit a job to the queue
 *
 * @apiParam {String} job: Job value
 *
 * @apiSuccess {Object} data: JSON Object containing job value, id and timestamp
 *
 * @apiError 400 Bad request
 * @apiError 500 Server error.
 */
app.post("/", async (req, res) => {
  await wonderQ.push(req.body.job, (err, value) => {
    if (err) return res.sendStatus(500);
    if (!value) return res.sendStatus(400);
    res.send({data: value});
  });
});

/**
 * @api {get} / Get a job from the queue
 * *
 * @apiSuccess {Object} data: JSON Object containing job value, id and timestamp
 *
 * @apiError 400 Bad request
 * @apiError 500 Server error.
 */

app.get("/", async (req, res) => {
  await wonderQ.get((err, value) => {
    if (err) return res.sendStatus(500);
    if (!value) return res.sendStatus(400);
    res.send({data: value});
  });
});

/**
 * @api {post} /jobdone/ Deletes a job from the queue
 *
 * @apiParam {Object} data: JSON Object containing job value, id and timestamp
 *
 * @apiSuccess {String} id: Job ID
 *
 * @apiError 400 Bad request
 * @apiError 500 Server error.
 */
app.post("/jobdone/", async (req, res) => {
  await wonderQ.jobDone(req.body.data, (err, value) => {
    if (err) return res.sendStatus(500);
    if (!value) return res.sendStatus(400);
    res.send(value);
  });
});

app.listen(process.env.PORT, () =>
  console.log(`App listening on port ${process.env.PORT}!`)
);
