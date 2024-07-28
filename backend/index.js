const express = require("express");
var cors = require("cors");

const app = express();
const port = 5001 || process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/payment", require("./routes/checkout"));

app.listen(port, () => {
  console.log(`Manasatarang app listening on port ${port}`);
});
