const express = require('express');
const router = express.Router();
const KnowledgeEntry = require('../models/KnowledgeEntry');
const Contact = require('../models/Contact');
const { decrypt } = require('../utils/encryption');

// ========== KNOWLEDGE ENTRIES (Procedures, Locations, Notes) ==========

// GET all entries by category
router.get('/entries', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: category.toUpperCase() } : {};
    const entries = await KnowledgeEntry.find(filter).sort({ createdAt: -1 });
    const formatted = entries.map(e => ({
      id: e._id.toString(),
      title: e.title,
      content: e.content,
      category: e.category,
      subcategory: e.subcategory,
      location: e.location,
      tags: e.tags,
      createdBy: e.createdBy,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// GET procedures
router.get('/procedures', async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find({ category: 'PROCEDURE' }).sort({ createdAt: -1 });
    const formatted = entries.map(e => ({
      id: e._id.toString(),
      title: e.title,
      content: e.content,
      category: e.category,
      subcategory: e.subcategory,
      tags: e.tags,
      createdBy: e.createdBy,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching procedures:', error);
    res.status(500).json({ error: 'Failed to fetch procedures' });
  }
});

// GET locations
router.get('/locations', async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find({ category: 'LOCATION' }).sort({ createdAt: -1 });
    const formatted = entries.map(e => ({
      id: e._id.toString(),
      title: e.title,
      content: e.content,
      category: e.category,
      location: e.location,
      tags: e.tags,
      createdBy: e.createdBy,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET notes
router.get('/notes', async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find({ category: 'NOTE' }).sort({ createdAt: -1 });
    const formatted = entries.map(e => ({
      id: e._id.toString(),
      title: e.title,
      content: e.content,
      category: e.category,
      tags: e.tags,
      createdBy: e.createdBy,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST new entry
router.post('/entries', async (req, res) => {
  try {
    const { title, content, category, subcategory, location, tags, createdBy } = req.body;
    const entry = new KnowledgeEntry({
      title,
      content,
      category: category.toUpperCase(),
      subcategory: subcategory || '',
      location: location || '',
      tags: tags || [],
      createdBy,
    });
    await entry.save();
    res.status(201).json({
      id: entry._id.toString(),
      title: entry.title,
      content: entry.content,
      category: entry.category,
      subcategory: entry.subcategory,
      location: entry.location,
      tags: entry.tags,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// PUT update entry
router.put('/entries/:id', async (req, res) => {
  try {
    const { title, content, subcategory, location, tags } = req.body;
    const entry = await KnowledgeEntry.findByIdAndUpdate(
      req.params.id,
      { title, content, subcategory, location, tags, updatedAt: new Date() },
      { new: true }
    );
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({
      id: entry._id.toString(),
      title: entry.title,
      content: entry.content,
      category: entry.category,
      subcategory: entry.subcategory,
      location: entry.location,
      tags: entry.tags,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE entry
router.delete('/entries/:id', async (req, res) => {
  try {
    await KnowledgeEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// ========== CONTACTS ==========

// GET all contacts
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    const formatted = contacts.map(c => ({
      id: c._id.toString(),
      name: c.name,
      role: c.role,
      company: c.company,
      location: c.location,
      phone: decrypt(c.phone),
      email: decrypt(c.email),
      notes: decrypt(c.notes),
      tags: c.tags,
      createdBy: c.createdBy,
      createdAt: c.createdAt.toISOString(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST new contact
router.post('/contacts', async (req, res) => {
  try {
    const { name, role, company, location, phone, email, notes, tags, createdBy } = req.body;
    const contact = new Contact({
      name,
      role: role || '',
      company: company || '',
      location: location || '',
      phone: phone || '',
      email: email || '',
      notes: notes || '',
      tags: tags || [],
      createdBy,
    });
    await contact.save();
    // Return original values (pre-encryption) not the encrypted ones
    res.status(201).json({
      id: contact._id.toString(),
      name: contact.name,
      role: contact.role,
      company: contact.company,
      location: contact.location,
      phone: phone || '',
      email: email || '',
      notes: notes || '',
      tags: contact.tags,
      createdBy: contact.createdBy,
      createdAt: contact.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT update contact
router.put('/contacts/:id', async (req, res) => {
  try {
    const { name, role, company, location, phone, email, notes, tags } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, role, company, location, phone, email, notes, tags },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    // Return original values (pre-encryption) not the encrypted ones
    res.json({
      id: contact._id.toString(),
      name: contact.name,
      role: contact.role,
      company: contact.company,
      location: contact.location,
      phone: phone || '',
      email: email || '',
      notes: notes || '',
      tags: contact.tags,
      createdBy: contact.createdBy,
      createdAt: contact.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE contact
router.delete('/contacts/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
