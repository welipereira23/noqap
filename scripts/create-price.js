import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPrice() {
  try {
    const price = await stripe.prices.create({
      product: 'prod_RKRpLHhmdhjceV',
      unit_amount: 2990,
      currency: 'brl',
      recurring: { interval: 'month' }
    });
    console.log('Price created:', price);
  } catch (error) {
    console.error('Error:', error);
  }
}

createPrice();
