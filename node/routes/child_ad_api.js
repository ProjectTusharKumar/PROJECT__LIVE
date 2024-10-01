const express = require('express');
const Ad = require('../models/ad_Schema.js');

const router = express.Router();

// API to add a child entry to an existing ad
router.post('/ad/:parentUUID/addChild', async (req, res) => {
  try {
    const { parentUUID } = req.params;
    const { childDataEntry } = req.body;

    // Find the ad by parentUUID and update it by pushing the new child entry into childDataEntry array
    const ad = await Ad.findOneAndUpdate(
      { uuid: parentUUID },
      { $push: { childDataEntry: childDataEntry } },
      { new: true } // Return the updated document
    );

    if (!ad) {
      return res.status(404).send('Ad not found');
    }

    res.json(ad);
  } catch (error) {
    res.status(500).send('Error updating ad with child data');
  }
});



// Get all child entries for an ad
router.get('/ad/:uuid/children', async (req, res) => {
  try {
    const { uuid } = req.params;
    const ad = await Ad.findOne({ uuid });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json(ad.childDataEntry); // Return the child data entries
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch child data' });
  }
});

// Delete a specific child entry from an ad
router.delete('/ad/children/:childUUID', async (req, res) => {
  try {
    const { childUUID } = req.params;

    const ad = await Ad.findOneAndUpdate(
      { 'childDataEntry.childUUID': childUUID },
      { $pull: { childDataEntry: { childUUID } } },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ error: 'Child entry not found' });
    }

    res.json({ message: 'Child entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete child entry' });
  }
});
// Update a specific child entry in an ad
router.post('/ad/children/:childUUID', async (req, res) => {
  try {
    const { childUUID } = req.params;
    const updateData = req.body;

    const ad = await Ad.findOneAndUpdate(
      { 'childDataEntry.childUUID': childUUID },
      { $set: { 'childDataEntry.$': updateData } },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ error: 'Child entry not found' });
    }

    res.json({ message: 'Child entry updated successfully', data: updateData });
  } catch (error) {
    console.error('Error updating child entry:', error);
    res.status(500).json({ error: 'Failed to update child entry' });
  }
});


module.exports = router;
