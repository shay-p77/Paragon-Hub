const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { logAudit } = require('../utils/auditLogger');

// GET /api/vendors - Get all vendors (optionally filter by type)
router.get('/', async (req, res) => {
  try {
    const { type, active } = req.query;
    const query = {};

    if (type) {
      query.type = type.toUpperCase();
    }
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const vendors = await Vendor.find(query).sort({ name: 1 });

    const formatted = vendors.map(v => ({
      id: v._id.toString(),
      name: v.name,
      code: v.code,
      type: v.type,
      commissionPercent: v.commissionPercent,
      collectionMethod: v.collectionMethod,
      paymentFrequency: v.paymentFrequency,
      collectionEmail: v.collectionEmail,
      collectionFormUrl: v.collectionFormUrl,
      collectionNotes: v.collectionNotes,
      contactName: v.contactName,
      contactEmail: v.contactEmail,
      contactPhone: v.contactPhone,
      notes: v.notes,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET /api/vendors/:id - Get single vendor
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      id: vendor._id.toString(),
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      commissionPercent: vendor.commissionPercent,
      collectionMethod: vendor.collectionMethod,
      paymentFrequency: vendor.paymentFrequency,
      collectionEmail: vendor.collectionEmail,
      collectionFormUrl: vendor.collectionFormUrl,
      collectionNotes: vendor.collectionNotes,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      notes: vendor.notes,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// POST /api/vendors - Create new vendor
router.post('/', async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      commissionPercent,
      collectionMethod,
      paymentFrequency,
      collectionEmail,
      collectionFormUrl,
      collectionNotes,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      createdById,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const validTypes = ['FLIGHT', 'HOTEL', 'LOGISTICS'];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid vendor type' });
    }

    const vendor = new Vendor({
      name,
      code: code || '',
      type: type.toUpperCase(),
      commissionPercent: commissionPercent || 0,
      collectionMethod: collectionMethod || 'OTHER',
      paymentFrequency: paymentFrequency || 'MONTHLY',
      collectionEmail: collectionEmail || '',
      collectionFormUrl: collectionFormUrl || '',
      collectionNotes: collectionNotes || '',
      contactName: contactName || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      notes: notes || '',
      createdBy: createdById || null,
    });

    await vendor.save();

    // Log audit
    await logAudit({
      user: { id: createdById },
      action: 'CREATE_VENDOR',
      resourceType: 'Vendor',
      resourceId: vendor._id,
      resourceName: vendor.name,
      details: { type: vendor.type },
      req
    });

    res.status(201).json({
      id: vendor._id.toString(),
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      commissionPercent: vendor.commissionPercent,
      collectionMethod: vendor.collectionMethod,
      paymentFrequency: vendor.paymentFrequency,
      collectionEmail: vendor.collectionEmail,
      collectionFormUrl: vendor.collectionFormUrl,
      collectionNotes: vendor.collectionNotes,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      notes: vendor.notes,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// PUT /api/vendors/:id - Update vendor
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      code,
      type,
      commissionPercent,
      collectionMethod,
      paymentFrequency,
      collectionEmail,
      collectionFormUrl,
      collectionNotes,
      contactName,
      contactEmail,
      contactPhone,
      notes,
      isActive,
    } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Update fields
    if (name !== undefined) vendor.name = name;
    if (code !== undefined) vendor.code = code;
    if (type !== undefined) vendor.type = type.toUpperCase();
    if (commissionPercent !== undefined) vendor.commissionPercent = commissionPercent;
    if (collectionMethod !== undefined) vendor.collectionMethod = collectionMethod;
    if (paymentFrequency !== undefined) vendor.paymentFrequency = paymentFrequency;
    if (collectionEmail !== undefined) vendor.collectionEmail = collectionEmail;
    if (collectionFormUrl !== undefined) vendor.collectionFormUrl = collectionFormUrl;
    if (collectionNotes !== undefined) vendor.collectionNotes = collectionNotes;
    if (contactName !== undefined) vendor.contactName = contactName;
    if (contactEmail !== undefined) vendor.contactEmail = contactEmail;
    if (contactPhone !== undefined) vendor.contactPhone = contactPhone;
    if (notes !== undefined) vendor.notes = notes;
    if (isActive !== undefined) vendor.isActive = isActive;

    await vendor.save();

    // Log audit
    await logAudit({
      action: 'UPDATE_VENDOR',
      resourceType: 'Vendor',
      resourceId: vendor._id,
      resourceName: vendor.name,
      details: { fieldsUpdated: Object.keys(req.body) },
      req
    });

    res.json({
      id: vendor._id.toString(),
      name: vendor.name,
      code: vendor.code,
      type: vendor.type,
      commissionPercent: vendor.commissionPercent,
      collectionMethod: vendor.collectionMethod,
      paymentFrequency: vendor.paymentFrequency,
      collectionEmail: vendor.collectionEmail,
      collectionFormUrl: vendor.collectionFormUrl,
      collectionNotes: vendor.collectionNotes,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      notes: vendor.notes,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
      updatedAt: vendor.updatedAt,
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// DELETE /api/vendors/:id - Delete vendor
router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Log audit
    await logAudit({
      action: 'DELETE_VENDOR',
      resourceType: 'Vendor',
      resourceId: vendor._id,
      resourceName: vendor.name,
      details: { type: vendor.type },
      req
    });

    res.json({ success: true, message: 'Vendor deleted' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router;
