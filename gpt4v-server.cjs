const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.post('/api/gpt4v', upload.single('image'), async (req, res) => {
  console.log(`[GPT-4V] Received request: file=${req.file?.filename}, mimetype=${req.file?.mimetype}`);
  try {
    const imagePath = req.file.path;
    const imageData = require('fs').readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    console.log('File size:', imageData.length, 'Base64 size:', base64Image.length);
    console.log('Calling OpenAI GPT-4o...');
    // Compose the prompt for GPT-4V
    const prompt = `Extract the main math or science question from this image. Then, provide a step-by-step, grade-appropriate solution in plain English (not LaTeX unless requested). Format your response as JSON with these fields: question, answer, explanation, steps (array), confidence (0-100), approaches (array, optional), flashcards (array, optional), practiceQuestions (array, optional), timeToSolve (string, optional).`;
    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Here is the homework image.' },
              { type: 'image_url', image_url: { url: `data:${req.file.mimetype};base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 1200,
        temperature: 0.3
      });
      console.log('OpenAI GPT-4o call complete');
      console.log('OpenAI response:', JSON.stringify(response, null, 2));
    } catch (apiErr) {
      console.error('OpenAI API error:', apiErr);
      res.status(500).json({ error: 'OpenAI API error', details: apiErr });
      return;
    }
    require('fs').unlinkSync(imagePath);
    let content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { question: '', answer: content, explanation: content, steps: [content], confidence: 80 };
    }
    res.json(parsed);
  } catch (err) {
    const errorLog = `[${new Date().toISOString()}] Error: ${err.message}\nStack: ${err.stack}\n`;
    require('fs').appendFileSync('gpt4v-error.log', errorLog);
    console.error('Error in /api/gpt4v:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Test endpoint to verify backend can reach OpenAI
app.get('/api/test-openai', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Say hello.' },
        { role: 'user', content: 'Hello!' }
      ],
      max_tokens: 20
    });
    res.json({ ok: true, response });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`GPT-4V server running on port ${PORT}`);
}); 