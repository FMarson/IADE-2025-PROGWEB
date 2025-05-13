const express = require("express");
const mongoose = require("mongoose");
const port = 80;
const app = express();

mongoose.connect("mongodb://localhost/teste");
let db = mongoose.connection;

app.use(express.json());

// For serving static HTML files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*",
    });

    return res.redirect("index.html");
});

app.post("/formFillUp", (req, res) => {
    const name = req.body.name;
    const reason = req.body.reason;
    const email = req.body.email;
    const phone = req.body.phone;
    const city = req.body.city;
    const state = req.body.state;
    const addressline = req.body.addressline;

    const data = {
        name: name,
        reason: reason,
        email: email,
        phone: phone,
        city: city,
        state: state,
        addressline: addressline,
    };

    db.collection("users").insertOne(
        data, (err, collection) => {
            if (err) {
                throw err;
            }
            console.log("Data inserted successfully!");
        });

    return res.redirect("formSubmitted.html");
});

app.listen(port, () => {
    console.log(`The application started
successfully on port ${port}`);
});