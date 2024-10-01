// routes/ads.js
const express = require('express');
const router = express.Router();
const Ad = require('../models/ad_Schema.js');

// Create a new ad
router.post('/ad', async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// Update an existing ad by uuid
router.put('/ad/:uuid', async (req, res) => {
  try {
    const ad = await Ad.findOneAndUpdate({ uuid: req.params.uuid }, req.body, { new: true });
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// Fetch an ad by uuid
router.get('/ad/:uuid', async (req, res) => {
  try {
    const ad = await Ad.findOne({ uuid: req.params.uuid });
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

module.exports = router;
