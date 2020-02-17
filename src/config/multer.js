import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  // Maneira que será armazenado
  storage: multer.diskStorage({
    // Local
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    // Nome do arquivo
    // req: Requisição do express,
    // file: Arquivo do multipart form
    // cb: callback da aplicação
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        // Caso haja algum conteúdo em erro, retorna o mesmo
        if (err) return cb(err);
        // Retornando o nome do arquivo
        // null: Null porque o primeiro parâmetro é o erro, e já foi tratado
        // res.toString + extname: é de fato o nome do arquivo que ficará
        // armazenado em filename
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
