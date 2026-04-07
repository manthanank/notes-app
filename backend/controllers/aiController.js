const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Use gemini-2.0-flash (fast, efficient and latest free tier friendly)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Summarize note content using Google Gemini
 */
exports.summarizeNote = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.length < 20) {
            return res.status(400).json({ message: "Content is too short to summarize." });
        }

        const prompt = `Summarize the following note into a single, concise, and professional sentence (maximum 20 words):\n\n${content}`;
        
        const result = await model.generateContent(prompt);
        const summary = result.response.text();
        
        if (summary) {
            res.json({ summary: summary.trim() });
        } else {
            throw new Error("Empty response from Gemini");
        }
    } catch (error) {
        console.error("Gemini Summarize Error:", error);
        res.status(500).json({ message: "Gemini failed to generate summary. Please check your API key." });
    }
};

/**
 * Generate smart tags for a note
 */
exports.generateTags = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!content) {
            return res.status(400).json({ message: "Content is required for tag generation." });
        }

        const prompt = `Based on the following note title and content, generate 3-5 relevant one-word tags (lowercase, no hash). Return ONLY the tags separated by commas.
        Title: ${title}
        Content: ${content}`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        if (responseText) {
            const tags = responseText.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
            res.json({ tags });
        } else {
            throw new Error("Empty response from Gemini");
        }
    } catch (error) {
        console.error("Gemini Tags Error:", error);
        res.status(500).json({ message: "Gemini failed to generate tags." });
    }
};
