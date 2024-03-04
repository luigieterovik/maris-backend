import { v4 } from 'uuid';

const secret = process.env.JWT_SECRET || v4();

export default {
    secret,
    expiresIn: '7d'
};
