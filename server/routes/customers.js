const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { decrypt } = require('../utils/encryption');

// Helper to format customer for API response (with decryption)
function formatCustomer(c) {
  return {
    id: c._id.toString(),
    legalFirstName: c.legalFirstName,
    legalLastName: c.legalLastName,
    displayName: c.displayName || '',
    dateOfBirth: decrypt(c.dateOfBirth) || '',
    email: decrypt(c.email) || '',
    phone: decrypt(c.phone) || '',
    primaryCustomerId: c.primaryCustomerId ? c.primaryCustomerId.toString() : null,
    passportNumber: decrypt(c.passportNumber) || '',
    passportExpiry: c.passportExpiry || '',
    passportCountry: c.passportCountry || '',
    loyaltyPrograms: (c.loyaltyPrograms || []).map(lp => ({
      program: lp.program,
      number: decrypt(lp.number) || '',
      status: lp.status || '',
    })),
    preferences: c.preferences ? {
      seatPreference: c.preferences.seatPreference || '',
      dietaryRestrictions: c.preferences.dietaryRestrictions || [],
      hotelPreferences: c.preferences.hotelPreferences || '',
      specialRequests: c.preferences.specialRequests || '',
    } : null,
    notes: decrypt(c.notes) || '',
    createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
  };
}

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const formatted = customers.map(formatCustomer);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(formatCustomer(customer));
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// GET sub-customers for a primary customer
router.get('/:id/sub-customers', async (req, res) => {
  try {
    const subCustomers = await Customer.find({ primaryCustomerId: req.params.id });
    const formatted = subCustomers.map(formatCustomer);
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching sub-customers:', error);
    res.status(500).json({ error: 'Failed to fetch sub-customers' });
  }
});

// POST create new customer
router.post('/', async (req, res) => {
  try {
    const {
      legalFirstName,
      legalLastName,
      displayName,
      dateOfBirth,
      email,
      phone,
      primaryCustomerId,
      passportNumber,
      passportExpiry,
      passportCountry,
      loyaltyPrograms,
      preferences,
      notes,
      createdBy,
    } = req.body;

    if (!legalFirstName || !legalLastName) {
      return res.status(400).json({ error: 'Legal first and last name are required' });
    }

    const customer = new Customer({
      legalFirstName,
      legalLastName,
      displayName: displayName || `${legalFirstName} ${legalLastName}`,
      dateOfBirth: dateOfBirth || '',
      email: email || '',
      phone: phone || '',
      primaryCustomerId: primaryCustomerId || null,
      passportNumber: passportNumber || '',
      passportExpiry: passportExpiry || '',
      passportCountry: passportCountry || '',
      loyaltyPrograms: loyaltyPrograms || [],
      preferences: preferences || {},
      notes: notes || '',
      createdBy: createdBy || '',
    });

    await customer.save();

    // Return original values (pre-encryption)
    res.status(201).json({
      id: customer._id.toString(),
      legalFirstName,
      legalLastName,
      displayName: displayName || `${legalFirstName} ${legalLastName}`,
      dateOfBirth: dateOfBirth || '',
      email: email || '',
      phone: phone || '',
      primaryCustomerId: primaryCustomerId || null,
      passportNumber: passportNumber || '',
      passportExpiry: passportExpiry || '',
      passportCountry: passportCountry || '',
      loyaltyPrograms: loyaltyPrograms || [],
      preferences: preferences || {},
      notes: notes || '',
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const {
      legalFirstName,
      legalLastName,
      displayName,
      dateOfBirth,
      email,
      phone,
      primaryCustomerId,
      passportNumber,
      passportExpiry,
      passportCountry,
      loyaltyPrograms,
      preferences,
      notes,
    } = req.body;

    // Find and update - need to handle encryption manually for updates
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update fields
    if (legalFirstName !== undefined) customer.legalFirstName = legalFirstName;
    if (legalLastName !== undefined) customer.legalLastName = legalLastName;
    if (displayName !== undefined) customer.displayName = displayName;
    if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (primaryCustomerId !== undefined) customer.primaryCustomerId = primaryCustomerId || null;
    if (passportNumber !== undefined) customer.passportNumber = passportNumber;
    if (passportExpiry !== undefined) customer.passportExpiry = passportExpiry;
    if (passportCountry !== undefined) customer.passportCountry = passportCountry;
    if (loyaltyPrograms !== undefined) customer.loyaltyPrograms = loyaltyPrograms;
    if (preferences !== undefined) customer.preferences = preferences;
    if (notes !== undefined) customer.notes = notes;

    await customer.save();

    // Return original values (pre-encryption)
    res.json({
      id: customer._id.toString(),
      legalFirstName: legalFirstName ?? customer.legalFirstName,
      legalLastName: legalLastName ?? customer.legalLastName,
      displayName: displayName ?? customer.displayName,
      dateOfBirth: dateOfBirth ?? '',
      email: email ?? '',
      phone: phone ?? '',
      primaryCustomerId: primaryCustomerId ?? null,
      passportNumber: passportNumber ?? '',
      passportExpiry: passportExpiry ?? customer.passportExpiry,
      passportCountry: passportCountry ?? customer.passportCountry,
      loyaltyPrograms: loyaltyPrograms ?? customer.loyaltyPrograms,
      preferences: preferences ?? customer.preferences,
      notes: notes ?? '',
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    // First, unlink any sub-customers
    await Customer.updateMany(
      { primaryCustomerId: req.params.id },
      { $set: { primaryCustomerId: null } }
    );

    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
