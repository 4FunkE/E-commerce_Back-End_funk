const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }], // be sure to include its associated Product data
    });
    res.status(200).json(tagData);
    console.log('Showing all tags.');
  } catch (err) {
    res.status(500).json(err);
    console.log('server error: All tags');
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  try {
    const singletagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }], // be sure to include its associated Product data
    });

    if (!singletagData) {
      res.status(404).json({ message: 'No tag found with that id!' });
      return;
    }

    res.status(200).json(singletagData);
    console.log('Showing one tag by ID.');
  } catch (err) {
    res.status(500).json(err);
    console.log('server error: one tag');
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);

    // if there are product IDs, create associations with ProductTag
    if (req.body.productIds && req.body.productIds.length > 0) {
      const tagIdArr = req.body.productIds.map((product_id) => {
        return {
          tag_id: newTag.id,
          product_id,
        };
      });
      await ProductTag.bulkCreate(tagIdArr);
    }

    res.status(200).json(newTag);
    console.log('You created a new tag');
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
    console.log('Oops, tag did not create...');
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update tag's name by its `id` value
    await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const existingProductTagIds = productTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !existingProductTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);
      // run both actions
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    const updatedTag = await Tag.findByPk(req.params.id);
    res.json(updatedTag);
    console.log('You updated a tag');
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
    console.log('tag did not update');
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const deleteTagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deleteTagData) {
      res.status(404).json({ message: 'No Tag found with that id! Did not delete.' });
      return;
    }

    res.status(200).json(deleteTagData);
    console.log('Deleted Tag.');
  } catch (err) {
    res.status(500).json(err);
    console.log('Server error, Tag delete unsuccessful...');
  }
});

module.exports = router;