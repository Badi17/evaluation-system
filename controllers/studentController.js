const db = require('../models');

// Save new section
const saveSection = async (req, res) => {
    const { section_name, section_block, section_yearLevel } = req.body; // Destructure from the request body
    
    try {
        // Check if section already exists
        const existingSection = await db.Section.findOne({ where: { Section_name } });
        if (existingSection) {
            return res.status(400).json({ message: 'Section already exists.' }); // Send error message if exists
        }

        const newSection = await db.Section.create({
            section_name,
            section_block,
            section_yearLevel,
        });
        res.json(newSection); // Send back the created section as a response
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).send('Internal server error');
    }
};


// Get all section
const getSection = async () => {
    try {
        return await db.Section.findAll(); // Fetch all section from the database
    } catch (error) {
        console.error('Error fetching section:', error);
        throw new Error('Error fetching section');
    }
};



module.exports = {
    saveSection,
    getSection
};
