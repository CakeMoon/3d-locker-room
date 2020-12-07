const express = require('express');
const Model3Ds = require('../models/Model3Ds');

const v = require('./validators');
const router = express.Router();

/**
 * @name POST /api/model3ds
 */
router.post(
  '/',
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const userId = req.session.uid;
    const modelName = req.body.name;
    const modelContent = req.body.file;
    if (!modelContent) {
      res.status(400).json({
        error: `Model file may not be empty`
      }).end();
      return;
    }
    const model3D = await Model3Ds.addOne(userId, modelName, modelContent);
    res.status(200).json({ data: model3D, message: 'Model added.' }).end();
  } catch (error) {
    res.status(400).json({ error: "Model name must be unique and non-empty" }).end();
  }
});

/**
 * @name GET /api/model3ds
 */
router.get(
  '/', 
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const userId = req.session.uid;
    const model3D = await Model3Ds.findAll(userId);
    res.status(200).json(model3D).end();
  } catch (error) {
    res.status(503).json({ error: `Could find the models: ${error}` }).end();
  }
});

/**
 * Delete a model.
 * 
 * @name DELETE /api/model3ds
 */
router.delete(
  '/:id',
  [
    v.ensureUserLoggedIn,
  ],
  async (req, res) => {
  try {
    const modelId = req.params.id;
    let model3D = await Model3Ds.findOneById(modelId);
    if (!model3D) {
      res.status(404).json({
        error: `This model does not exist`
      }).end();
      return;
    }
    model3D = await Model3Ds.deleteOne(modelId);
    res.status(200).json({ data: model3D, message: 'Model deleted.' }).end();
  } catch (error) {
    res.status(503).json({ error: `Could not delete the model: ${error}` }).end();
  }
});

module.exports = router;
