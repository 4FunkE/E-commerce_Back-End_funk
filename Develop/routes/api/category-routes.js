const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }], // be sure to include its associated Products
    });
    res.status(200).json(categoryData);
    console.log('Showing all categories.');
  } catch (err) {
    res.status(500).json(err);
    console.log('server error: All categories');
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  try {
    const singlecategoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }], // be sure to include its associated Product data
    });

    if (!singlecategoryData) {
      res.status(404).json({ message: 'No category found with that id!' });
      return;
    }

    res.status(200).json(singlecategoryData);
    console.log('Showing one category by ID.');
  } catch (err) {
    res.status(500).json(err);
    console.log('server error: one category');
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create(req.body);

    // if there are product IDs, create associations with ProductTag
    if (req.body.productIds && req.body.productIds.length > 0) {
      const categoryIdArr = req.body.productIds.map((product_id) => {
        return {
          category_id: newCategory.id,
          product_id,
        };
      });
      await ProductCategory.bulkCreate(categoryIdArr);
    }

    res.status(200).json(newCategory);
    console.log('You created a new category');
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
    console.log('Oops, category did not create...');
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.productIds && req.body.productIds.length) {
      const products = await Product.findAll({
        where: { category_id: req.params.id },
      });

      const existingProductIds = products.map(({ id }) => id);
      const newProductCategories = req.body.productIds
        .filter((product_id) => !existingProductIds.includes(product_id))
        .map((product_id) => {
          return {
            category_id: req.params.id,
            product_id,
          };
        });

      // Figure out which ones to remove
      const productCategoriesToRemove = products
        .filter(({ id }) => !req.body.productIds.includes(id))
        .map(({ id }) => id);

      // Run both actions
      await Promise.all([
        ProductCategory.destroy({ where: { product_id: productCategoriesToRemove } }),
        ProductCategory.bulkCreate(newProductCategories),
      ]);
    }

    const updatedCategory = await Category.findByPk(req.params.id);
    res.json(updatedCategory);
    console.log('You updated a Category');
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
    console.log('Category did not update');
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const deleteCategoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deleteCategoryData) {
      res.status(404).json({ message: 'No category found with that id! Did not delete.' });
      return;
    }

    res.status(200).json(deleteCategoryData);
    console.log('Deleted category.');
  } catch (err) {
    res.status(500).json(err);
    console.log('Server error, category delete unsuccessful...');
  }
});

module.exports = router;