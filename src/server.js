import express from "express";
import viewEngine from "./config/viewEngine";
import webRoutes from "./routes/web";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('src/public'))
//config view Engine
viewEngine(app);

//config route for app
webRoutes(app);

app.listen(PORT, () => {
    console.log("App running at the port: " + PORT);
});