import { Schema, model, Document } from "mongoose";

interface Post extends Document {
  nama: string;
  deskripsi: string;
  harga: string;
  pembayaran: string;
  gambar: string;
}

const postSchema = new Schema<Post>({
  nama: String,
  deskripsi: String,
  harga: String,
  pembayaran: String,
  gambar: String,
});

export const mainModel = model<Post>("mains", postSchema);
