import multer from 'multer'

export default {
  storage: multer.memoryStorage(), // Salva o arquivo em memória
}
