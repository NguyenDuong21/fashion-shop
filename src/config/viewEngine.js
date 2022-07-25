import express from "express";

//config view engine for a express app
let configViewEngine = (app) => {
  app.use(express.static("./src/public"));
  app.set("view engine", "ejs");
  app.set("views", "./src/views");
  app.set("layout", "./layouts/xe-mart");
};

module.exports = configViewEngine;
