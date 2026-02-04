const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const PipelineTrip = require('../models/PipelineTrip');
const BookingRequest = require('../models/BookingRequest');
const { decrypt } = require('../utils/encryption');
const { logAudit } = require('../utils/auditLogger');

// Helper to format customer for API response (with decryption)
function formatCustomer(c) {
  return {
    id: c._id.toString(),
    legalFirstName: c.legalFirstName,
    legalMiddleName: c.legalMiddleName || '',
    legalLastName: c.legalLastName,
    displayName: c.displayName || '',
    dateOfBirth: decrypt(c.dateOfBirth) || '',
    email: decrypt(c.email) || '',
    phone: decrypt(c.phone) || '',
    primaryCustomerId: c.primaryCustomerId ? c.primaryCustomerId.toString() : null,
    // Legacy single passport fields (kept for backwards compatibility)
    passportNumber: decrypt(c.passportNumber) || '',
    passportExpiry: c.passportExpiry || '',
    passportCountry: c.passportCountry || '',
    // Multiple passports
    passports: (c.passports || []).map(p => ({
      number: decrypt(p.number) || '',
      country: p.country || '',
      expiry: p.expiry || '',
    })),
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
    agentId: c.agentId || '',
    customMarkups: c.customMarkups || null,
    createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
  };
}

// GET all customers (optionally filter by agentId)
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query;
    const query = agentId ? { agentId } : {};
    const customers = await Customer.find(query).sort({ createdAt: -1 });
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

    // Log PII access
    await logAudit({
      action: 'VIEW_CUSTOMER',
      resourceType: 'Customer',
      resourceId: customer._id,
      resourceName: `${customer.legalFirstName} ${customer.legalLastName}`,
      details: { hasPII: !!customer.passportNumber || !!customer.dateOfBirth },
      req
    });

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
      legalMiddleName,
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
      agentId,
      customMarkups,
    } = req.body;

    if (!legalFirstName || !legalLastName) {
      return res.status(400).json({ error: 'Legal first and last name are required' });
    }

    const customer = new Customer({
      legalFirstName,
      legalMiddleName: legalMiddleName || '',
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
      agentId: agentId || '',
      customMarkups: customMarkups || undefined,
    });

    await customer.save();

    // Log audit
    await logAudit({
      action: 'CREATE_CUSTOMER',
      resourceType: 'Customer',
      resourceId: customer._id,
      resourceName: `${legalFirstName} ${legalLastName}`,
      details: { createdBy },
      req
    });

    // Return original values (pre-encryption)
    res.status(201).json({
      id: customer._id.toString(),
      legalFirstName,
      legalMiddleName: legalMiddleName || '',
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
      agentId: agentId || '',
      customMarkups: customMarkups || null,
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
      legalMiddleName,
      legalLastName,
      displayName,
      dateOfBirth,
      email,
      phone,
      primaryCustomerId,
      passportNumber,
      passportExpiry,
      passportCountry,
      passports,
      loyaltyPrograms,
      preferences,
      notes,
      agentId,
      customMarkups,
    } = req.body;

    // Find and update - need to handle encryption manually for updates
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update fields
    if (legalFirstName !== undefined) customer.legalFirstName = legalFirstName;
    if (legalMiddleName !== undefined) customer.legalMiddleName = legalMiddleName;
    if (legalLastName !== undefined) customer.legalLastName = legalLastName;
    if (displayName !== undefined) customer.displayName = displayName;
    if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (primaryCustomerId !== undefined) customer.primaryCustomerId = primaryCustomerId || null;
    if (passportNumber !== undefined) customer.passportNumber = passportNumber;
    if (passportExpiry !== undefined) customer.passportExpiry = passportExpiry;
    if (passportCountry !== undefined) customer.passportCountry = passportCountry;
    if (passports !== undefined) customer.passports = passports;
    if (loyaltyPrograms !== undefined) customer.loyaltyPrograms = loyaltyPrograms;
    if (preferences !== undefined) customer.preferences = preferences;
    if (notes !== undefined) customer.notes = notes;
    if (agentId !== undefined) customer.agentId = agentId;
    if (customMarkups !== undefined) customer.customMarkups = customMarkups;

    await customer.save();

    // Sync customer name to any trips or booking requests that reference this customer
    const newClientName = customer.displayName || `${customer.legalFirstName} ${customer.legalLastName}`;
    const customerId = customer._id.toString();

    // Update trips that reference this customer
    await PipelineTrip.updateMany(
      { clientId: customerId },
      { $set: { clientName: newClientName } }
    );

    // Update booking requests that reference this customer
    await BookingRequest.updateMany(
      { clientId: customerId },
      { $set: { clientName: newClientName } }
    );

    // Log audit
    await logAudit({
      action: 'UPDATE_CUSTOMER',
      resourceType: 'Customer',
      resourceId: customer._id,
      resourceName: `${customer.legalFirstName} ${customer.legalLastName}`,
      details: { fieldsUpdated: Object.keys(req.body) },
      req
    });

    // Return original values (pre-encryption)
    res.json({
      id: customer._id.toString(),
      legalFirstName: legalFirstName ?? customer.legalFirstName,
      legalMiddleName: legalMiddleName ?? customer.legalMiddleName ?? '',
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
      agentId: customer.agentId || '',
      customMarkups: customer.customMarkups || null,
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

    // Log audit
    await logAudit({
      action: 'DELETE_CUSTOMER',
      resourceType: 'Customer',
      resourceId: customer._id,
      resourceName: `${customer.legalFirstName} ${customer.legalLastName}`,
      req
    });

    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
