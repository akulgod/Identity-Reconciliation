import express from "express";
import { AppDataSource } from "./data-source";
import { identifyContact } from "./controllers/contactController";

const app = express();
const port = 3000;

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    // Route to identify contact
    app.post("/identify", identifyContact);

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
