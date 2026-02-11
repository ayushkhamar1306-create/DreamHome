import nextConnect from "next-connect";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = multer({ dest: "/tmp" });

const handler = nextConnect();
handler.use(upload.fields([{ name: "images" }, { name: "proof" }]));

handler.post(async (req, res) => {
  try {
    const images = await Promise.all(
      req.files.images.map((file) => cloudinary.uploader.upload(file.path))
    );

    const proof = await cloudinary.uploader.upload(req.files.proof[0].path);

    res.json({
      images: images.map((i) => i.secure_url),
      proof: proof.secure_url,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default handler;
