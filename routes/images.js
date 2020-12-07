const express = require('express');
const Images = require('../models/Images');

const v = require('./validators');
const router = express.Router();

/**
 * @name POST /api/images
 */
router.post(
  '/',
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const userId = req.session.uid;
    const imageName = req.body.name;
    const imageLink = req.body.file;
    const imageWidth = req.body.width;
    const imageHeight = req.body.height;
    
    if (!imageLink || !imageWidth || !imageHeight) {
      res.status(400).json({
        error: `Name, width and height may not be empty`
      }).end();
      return;
    }

    const image = await Images.addOne(userId, imageName, imageLink, imageWidth, imageHeight);
    res.status(200).json({ data: image, message: 'Image added.' }).end();
  } catch (error) {
    res.status(400).json({ error: "Image name must be unique and non-empty" }).end();
  }
});

/**
 * @name GET /api/images
 */
router.get(
  '/', 
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const userId = req.session.uid;
    const image = await Images.findAll(userId);
    res.status(200).json(image).end();
  } catch (error) {
    res.status(503).json({ error: `Could find the images: ${error}` }).end();
  }
});

/**
 * Delete an image.
 * 
 * @name DELETE /api/images
 */
router.delete(
  '/:id',
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const imageId = req.params.id;
    let image = await Images.findOneById(imageId);
    if (!image) {
      res.status(404).json({
        error: `This image does not exist`
      }).end();
      return;
    }
    image = await Images.deleteOne(imageId);
    res.status(200).json({ data: image, message: 'Image deleted.' }).end();
  } catch (error) {
    res.status(503).json({ error: `Could not delete the image: ${error}` }).end();
  }
});

module.exports = router;
