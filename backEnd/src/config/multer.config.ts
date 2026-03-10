import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/', // salva direto na pasta
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });