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
        const response = await result.response;
        const text = response.text();
    
        // Clean up the output to make sure it's just tags
        const cleanTags = text.replace(/#/g, '').split('\n').filter(tag => tag.trim());
    
        res.json({ tags: cleanTags });
    } catch (err) {
        res.status(500).json({ message: "AI Tags Generation Failed", error: err.message });
    }
};

exports.continueWriting = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI writing assistant. The user is writing a note. Please read what they have written and provide the next 1-2 paragraphs to continue their thought naturally. Write ONLY the continuation, do not include any conversational filler or introductions.

User's note:
"""
${content}
"""

Continuation:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ continuation: response.text().trim() });
  } catch (err) {
    res.status(500).json({ message: "AI Continuation Failed", error: err.message });
  }
};

exports.extractActionItems = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI assistant. Analyze the following note and extract all tasks, to-dos, or action items implicitly or explicitly mentioned.
Return the result strictly as a Markdown checklist (e.g. "- [ ] Task 1"). If there are no action items, return the exact string "No action items found."

Note:
"""
${content}
"""`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ actionItems: response.text().trim() });
  } catch (err) {
    res.status(500).json({ message: "AI Action Item Extraction Failed", error: err.message });
  }
};
