import crypto from 'crypto';

const secret = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

export default {
    secret,
    expiresIn: '7d'
};
