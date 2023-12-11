import { Router, Request, Response } from "express";
const mongoose = require("mongoose");
const { mainModel } = require("../models/product");
const { pesananModel } = require("../models/pesanan");
require("dotenv").config();

const uri: string = process.env.MONGODBURI;

const mainRouter = Router();
interface Product {
  nama: string;
  deskripsi: string;
  harga: string;
  pembayaran: string;
  gambar: string;
}

interface Pesanan {
  id: number;
  product: string;
  nama: string;
  alamat: string;
  dikirim: boolean;
  email: string;
  dibayar: boolean;
}
let listProduct: Product[];
let pesanan: Pesanan[];
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    const [docs] = await Promise.all([mainModel.find({}, null)]);
    const [docsPesanan] = await Promise.all([pesananModel.find({}, null)]);

    listProduct = docs;

    pesanan = docsPesanan;
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
mainRouter.get("/", (req: Request, res: Response) => {
  res.render("index", {
    data: listProduct,
  });
});
mainRouter.get("/admin", (req: Request, res: Response) => {
  // Separate orders based on confirmation and shipment status
  const confirmedUnshippedOrders = pesanan.filter(
    (order) => order.dibayar && !order.dikirim
  );
  const confirmedShippedOrders = pesanan.filter(
    (order) => order.dibayar && order.dikirim
  );
  const unconfirmedOrders = pesanan.filter((order) => !order.dibayar);

  // Separate orders based on shipment status
  const shippedOrders = pesanan.filter((order) => order.dikirim);
  const unshippedOrders = pesanan.filter(
    (order) => !order.dikirim && order.dibayar
  );

  res.render("admin", {
    confirmedUnshippedOrders,
    confirmedShippedOrders,
    unconfirmedOrders,
    shippedOrders,
    unshippedOrders,
  });
});

mainRouter.post(
  "/admin/toggleShipped/:orderId",
  async (req: Request, res: Response) => {
    const orderId: number = +req.params.orderId;
    // Find the order by ID and toggle the paid status
    const order = pesanan.find((order) => order.id === orderId);

    if (order) {
      order.dikirim = !order.dikirim;
      await pesananModel.findOneAndUpdate({ id: orderId }, order);

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
);

// Toggle paid status
mainRouter.post(
  "/admin/togglePaid/:orderId",
  async (req: Request, res: Response) => {
    const orderId: number = +req.params.orderId;
    // Find the order by ID and toggle the paid status
    const order = pesanan.find((order) => order.id === orderId);

    if (order) {
      order.dibayar = !order.dibayar;
      await pesananModel.findOneAndUpdate({ id: orderId }, order);

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
);
mainRouter.post("/admin/addProduct", async (req: Request, res: Response) => {
  listProduct.push({
    nama: req.body.name,
    deskripsi: req.body.deskripsi,
    harga: req.body.harga,
    pembayaran: req.body.pembayaran,
    gambar: req.body.gambar,
  });
  await mainModel.create({
    nama: req.body.name,
    deskripsi: req.body.deskripsi,
    harga: req.body.harga,
    pembayaran: req.body.pembayaran,
    gambar: req.body.gambar,
  });
  res.redirect("/admin");
});
mainRouter.get("/pesan/:nama", (req: Request, res: Response) => {
  const productName = req.params.nama;
  const product = listProduct.find((item) => item.nama === productName);

  if (product) {
    res.render("product", {
      data: product,
    });
  } else {
    res.status(404).render("error", {
      message: "Product not found",
    });
  }
});
mainRouter.get("/search", (req: Request, res: Response) => {
  const query = req.query.q;
  if (!query) {
    // If no query is provided, redirect to the home page
    res.redirect("/");
    return;
  }

  // Perform a simple case-insensitive search
  const searchResults = listProduct.filter(
    (product) =>
      product.nama.toLowerCase().includes(query.toLowerCase()) ||
      product.deskripsi.toLowerCase().includes(query.toLowerCase())
  );

  res.render("search-results", { results: searchResults, query });
});
mainRouter.post("/pesan/:nama", async (req: Request, res: Response) => {
  const productName = req.params.nama;
  pesanan.push({
    id: pesanan.length + 1,
    product: productName,
    nama: req.body.nama,
    alamat: req.body.alamat,
    dikirim: false,
    email: req.body.email,
    dibayar: false,
  });
  await pesananModel.create({
    id: pesanan.length + 1,
    product: productName,
    nama: req.body.nama,
    alamat: req.body.alamat,
    dikirim: false,
    email: req.body.email,
    dibayar: false,
  });

  res.json({ success: true });
});

module.exports = mainRouter;
