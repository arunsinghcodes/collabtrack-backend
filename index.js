import express from "express";

const app = express();
const PORT = 8080;

app.get("/", (req, res) =>{
    res.status(200).send("Hello, Project Management API's");
})

app.listen(PORT,()=>{
  console.log(`Server is running up at ${PORT}`)
})