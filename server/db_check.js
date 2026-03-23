import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Product from './models/Product.js';
import Collection from './models/Collection.js';

dotenv.config();

const checkDB = async () => {
  let output = '';
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    output += 'Connected to MongoDB\n';

    const products = await Product.find({}, 'name slug collection');
    const collections = await Collection.find({}, 'title slug productSlugs');

    output += '\n--- COLLECTIONS ---\n';
    collections.forEach(c => {
      output += `Title: ${c.title} | Slug: ${c.slug} | ProductSlugs: [${c.productSlugs.join(', ')}]\n`;
    });

    output += '\n--- PRODUCTS ---\n';
    products.forEach(p => {
      output += `Name: ${p.name} | Slug: ${p.slug} | Collection Field: ${p.collection}\n`;
    });

    fs.writeFileSync('db_results.txt', output);
    console.log('Results written to db_results.txt');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
