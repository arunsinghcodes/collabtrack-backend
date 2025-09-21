import express from "express";

const app = express();

app.get("/", ()=>{
    console.log("Welcome to Collab Track API's end points")
})

export default app;