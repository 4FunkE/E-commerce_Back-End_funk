// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
// Define a Category as having one Product to create a foreign key in the `Product` table
Category.hasOne(Product, {
  foreignKey: 'category_id',
  // When we delete a category it will also delete the associated product.
  onDelete: 'CASCADE',
});

// Categories have many Products

// Products belongToMany Tags (through ProductTag)

// Tags belongToMany Products (through ProductTag)

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};