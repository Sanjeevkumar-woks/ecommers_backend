import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const MONGO_URL = "mongodb://localhost";

const app = express();
app.use(express.json());
app.use(cors());

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected");
  return client;
}

export const client = await createConnection();

app.get("/", (req, res) => {
  res.send("Hi World");
});

app.get("/mobiles", async (req, res) => {
  const result = await getMobiles();
  res.send(result);
});
app.post("/mobiles/add", async (req, res) => {
  const mobiles = req.body;
  const result = await addMobiles(mobiles);
  res.send({ mess: "added sussesfully", result });
});

app.get("/cart", async (req, res) => {
  const result = await getCart();
  res.send(result);
});

app.put("/cart", async (req, res) => {
  const mobile = req.body;
  const { type } = req.query;
  //console.log(req.body);
  //bd.cart.updateOne({"id":"66666"})//
  const itemExist = await getCartIteamBYId(mobile);
  //console.log(itemExist);
  if (itemExist) {
    if (type === "decrement" && itemExist.qty <= 1) {
      console.log("delete");
      await deteteById(mobile);
    } else {
      await updateQtyById(mobile, type);
    }
  } else {
    await insertOneIteamToCart(mobile);
  }

  const allCart = await client.db("ecom").collection("cart").find().toArray();

  res.send(allCart);
});

app.listen(9000, () => console.log(`server is running on post 9000`));

function getCart() {
  return client.db("ecom").collection("cart").find().toArray();
}

function insertOneIteamToCart(mobile) {
  return client
    .db("ecom")
    .collection("cart")
    .insertOne({ ...mobile, qty: 1 });
}

function getCartIteamBYId(mobile) {
  return client.db("ecom").collection("cart").findOne({ _id: mobile._id });
}

function updateQtyById(mobile, type) {
  console.log(mobile);
  return client
    .db("ecom")
    .collection("cart")
    .updateOne(
      { _id: mobile._id },
      { $inc: { qty: type === "increment" ? +1 : -1 } }
    );
}
function deteteById(mobile) {
  return client.db("ecom").collection("cart").deleteOne({ _id: mobile._id });
}

function getMobiles() {
  return client.db("ecom").collection("mobiles").find().toArray();
}

function addMobiles(mobile) {
  return client.db("ecom").collection("mobiles").insertMany(mobile);
}
