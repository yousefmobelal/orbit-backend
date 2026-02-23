import cloudinary from 'cloudinary';
import { env } from '@/config/env';

const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.API_SECRET,
});
export default cloudinaryV2;
