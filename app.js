const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const link = require("./routes/index");
const errorHandler = require("./middleware/error");
const fs = require("fs");
const path = require("path");
const rfs = require("rotating-file-stream");
const db = require("./config/database/database");
const fileUpload = require("express-fileupload");
const socket_io = require('socket.io');

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);


app.use(cors());
// CREATE FOLDER LOGS
const logDirectory = path.join(__dirname, "logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

app.use(fileUpload());
app.use('/file', express.static(path.join(__dirname, 'filePDF')))

// CREATE A ROTATING WRITE STREAM
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});

//security
app.use(helmet());

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);

if (["development", "production"].includes(process.env.NODE_ENV)) {
  app.use(logger("dev"));
} else {
  app.use(logger("combined", { stream: accessLogStream }));
}

/*index root test app run in ci/cd*/
app.get("/", async (req, res, next) => {
  try {
    await db.authenticate();
    const data = {
      status: "Health Check Success",
      date: new Date().toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }),
      uptime: `${Math.round(process.uptime())} second`,
    };
    res.status(200).json({
      msg: "Auth Service",
      data,
    });
  } catch (error) {
    next(error);
  }
});

app.use("/", link.userRoleRouter);
app.use("/", link.masterRouter);
app.use("/", link.projectRouter)
app.use("/", link.marketingRouter)
app.use("/", link.eventRouter)
app.use("/", link.dashboardRouter)

app.use((req, res, next) => {
  res.status(404).json({
    code: 2,
    error: "Error : Route Not Found ",
  });
});

app.use(errorHandler);

module.exports = app;
