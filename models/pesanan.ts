import { Schema, model, Document } from "mongoose";

interface Post extends Document {
  id: number;
  product: string;
  nama: string;
  alamat: string;
  dikirim: boolean;
  email: string;
  dibayar: boolean;
}

const postSchema = new Schema<Post>({
  id: Number,
  product: String,
  nama: String,
  alamat: String,
  dikirim: Boolean,
  email: String,
  dibayar: Boolean,
});

export const pesananModel = model<Post>("pesanan", postSchema);
