const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const mammoth = require('mammoth');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json()); // Add JSON body parsing

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Enhanced image analysis endpoint with subject and grade context
app.post('/api/gpt4v', upload.single('image'), async (req, res) => {
  console.log(`[GPT-4V] Received request: file=${req.file?.filename}, mimetype=${req.file?.mimetype}, subject=${req.body.subject}, grade=${req.body.grade}`);
  try {
    const imagePath = req.file.path;
    const imageData = require('fs').readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    const subject = req.body.subject || 'math';
    const grade = req.body.grade || '9';
    
    console.log('File size:', imageData.length, 'Base64 size:', base64Image.length);
    console.log('Calling OpenAI GPT-4o...');
    
    // Enhanced prompt with subject and grade context
    const prompt = `You are an expert ${subject} tutor for Grade ${grade} students. 

Extract the main ${subject} question from this image and provide a comprehensive, grade-appropriate solution.

Requirements:
- Grade Level: Strictly Grade ${grade} curriculum level - not easier, not harder
- Subject: ${subject} (follow standard Grade ${grade} ${subject} textbook topics)
- Language: Use clear, age-appropriate explanations that a Grade ${grade} student can understand
- Format: Provide step-by-step solutions with explanations
- Include confidence level based on clarity of the question

Format your response as JSON with these fields:
{
  "question": "The extracted question text",
  "answer": "The final answer",
  "explanation": "Clear explanation of the solution process",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "confidence": 85,
  "approaches": ["Alternative method 1", "Alternative method 2"],
  "flashcards": [{"question": "Study question 1", "answer": "Answer 1"}, {"question": "Study question 2", "answer": "Answer 2"}],
  "practiceQuestions": ["Similar practice problem 1", "Similar practice problem 2"],
  "timeToSolve": "5-10 minutes"
}`;

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
              { type: 'text', text: `Here is a Grade ${grade} ${subject} homework image. Please analyze it and provide a comprehensive solution.` },
              { type: 'image_url', image_url: { url: `data:${req.file.mimetype};base64,${base64Image}` } }
            ]
          }
        ],
        max_tokens: 1500,
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
    // Extract JSON from markdown code block if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
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

// New text-based homework helper endpoint
app.post('/api/homework-helper', async (req, res) => {
  console.log(`[Homework Helper] Received text request: subject=${req.body.subject}, grade=${req.body.grade}`);
  try {
    const { question, subject, grade } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    console.log('Calling OpenAI GPT-4o for text question...');
    
    // Strengthened prompt for text-based questions
    const prompt = `You are an expert ${subject} tutor for Grade ${grade} students.\n\nA student has asked the following question(s):\n\n"${question}"\n\nYour job:\n1. Carefully read the ENTIRE input.\n2. Detect and split ALL individual questions (numbered, lettered, or separated by newlines, etc.).\n3. For EACH question, provide a comprehensive, grade-appropriate solution.\n\nRequirements:\n- Grade Level: Strictly Grade ${grade} curriculum level\n- Subject: ${subject}\n- Language: Use clear, age-appropriate explanations\n- Format: For each question, provide step-by-step solutions with detailed explanations\n- If multiple questions are found, solve each one separately\n- If only one question is found, still return an array with one object\n- If no questions are found, return an empty array []\n- Include confidence level\n- Provide alternative approaches when applicable\n- Include practice problems\n- Create study flashcards\n\nFormat your response as a JSON ARRAY, one object per question, like this:\n[\n  {\n    "question": "Question 1 text",\n    "answer": "The final answer",\n    "explanation": "Clear, detailed explanation of the solution process",\n    "steps": ["Step 1: ...", "Step 2: ..."],\n    "confidence": 85,\n    "approaches": ["Alternative method 1"],\n    "flashcards": [{"question": "Study question 1", "answer": "Answer 1"}],\n    "practiceQuestions": ["Similar practice problem 1"],\n    "timeToSolve": "5-10 minutes"\n  }\n]\n\nIf you cannot find any questions, return an empty array [].`;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Please analyze and solve all questions: ${question}` }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });
      console.log('OpenAI GPT-4o call complete for text question');
      console.log('OpenAI response:', JSON.stringify(response, null, 2));
    } catch (apiErr) {
      console.error('OpenAI API error:', apiErr);
      res.status(500).json({ error: 'OpenAI API error', details: apiErr });
      return;
    }
    
    let content = response.choices[0].message.content;
    let parsed;
    // Extract JSON from markdown code block if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    try {
      parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) parsed = [parsed];
    } catch {
      parsed = [{ 
        question: question, 
        answer: content, 
        explanation: content, 
        steps: [content], 
        confidence: 80,
        approaches: [],
        flashcards: [],
        practiceQuestions: [],
        timeToSolve: "5-10 minutes"
      }];
    }
    res.json(parsed);
  } catch (err) {
    const errorLog = `[${new Date().toISOString()}] Error: ${err.message}\nStack: ${err.stack}\n`;
    require('fs').appendFileSync('homework-helper-error.log', errorLog);
    console.error('Error in /api/homework-helper:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Document processing endpoint for .docx files
app.post('/api/process-document', upload.single('document'), async (req, res) => {
  console.log(`[Document Processor] Received document: file=${req.file?.filename}, mimetype=${req.file?.mimetype}, subject=${req.body.subject}, grade=${req.body.grade}`);
  try {
    const filePath = req.file.path;
    const subject = req.body.subject || 'math';
    const grade = req.body.grade || '9';
    
    // Extract text from .docx file
    let extractedText;
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
      // Sanitize extracted text
      extractedText = extractedText.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
      console.log('Extracted text from document (sanitized):', extractedText);
    } catch (extractErr) {
      console.error('Error extracting text from document:', extractErr);
      res.status(400).json({ error: 'Failed to extract text from document. Please ensure it\'s a valid .docx file.' });
      return;
    }
    if (!extractedText || extractedText.trim().length === 0) {
      res.status(400).json({ error: 'No text found in the document. Please ensure the document contains text.' });
      return;
    }
    console.log('Calling OpenAI GPT-4o for document analysis...');
    // Enhanced prompt for document-based questions
    const prompt = `You are an expert ${subject} tutor for Grade ${grade} students.\n\nA student has uploaded a document containing this ${subject} content: "${extractedText}"\n\nYour job:\n1. Carefully read the ENTIRE content.\n2. Detect and split ALL individual ${subject} questions (numbered, bulleted, or separated by newlines, etc.).\n3. For EACH question, provide a comprehensive, grade-appropriate solution.\n\nRequirements:\n- Grade Level: Strictly Grade ${grade} curriculum level - not easier, not harder\n- Subject: ${subject} (follow standard Grade ${grade} ${subject} textbook topics)\n- Language: Use clear, age-appropriate explanations that a Grade ${grade} student can understand\n- Format: For each question, provide step-by-step solutions with detailed explanations\n- If multiple questions are found, solve each one separately\n- If only one question is found, still return an array with one object\n- If no questions are found, return an empty array []\n- Include confidence level based on clarity of the question\n- Provide alternative approaches when applicable\n- Include practice problems for reinforcement\n- Create study flashcards for key concepts\n\nFormat your response as a JSON ARRAY, one object per question, like this:\n[\n  {\n    "question": "Question 1 text",\n    "answer": "The final answer",\n    "explanation": "Clear, detailed explanation of the solution process",\n    "steps": ["Step 1: ...", "Step 2: ..."],\n    "confidence": 85,\n    "approaches": ["Alternative method 1", "Alternative method 2"],\n    "flashcards": [{"question": "Study question 1", "answer": "Answer 1"}],\n    "practiceQuestions": ["Similar practice problem 1"],\n    "timeToSolve": "5-10 minutes"\n  }\n]\n\nIf you cannot find any questions, return an empty array [].`;
    console.log('Extracted text for AI:', extractedText);
    let response;
    let parsed;
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Please analyze this Grade ${grade} ${subject} document and provide a comprehensive solution: ${extractedText}` }
        ],
        max_tokens: 1500,
        temperature: 0.3
      });
      console.log('OpenAI GPT-4o call complete for document analysis');
      console.log('OpenAI response:', JSON.stringify(response, null, 2));
      let content = response.choices[0].message.content;
      console.log('Raw AI response:', content);
      // Extract JSON from markdown code block if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      try {
        parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) parsed = [parsed];
      } catch {
        parsed = [];
      }
    } catch (apiErr) {
      console.error('OpenAI API error:', apiErr);
      res.status(500).json({ error: 'OpenAI API error', details: apiErr });
      return;
    }
    // Clean up the uploaded file
    require('fs').unlinkSync(filePath);
    // Fallback: If parsed is empty, split text and retry
    if (!parsed || parsed.length === 0) {
      console.log('AI returned empty array. Falling back to manual split and retry.');
      // Improved split: split by numbers, letters, and newlines
      const questionRegex = /(?:\n\s*\d+\.\s+|\n\s*[a-zA-Z]\)\s+|\n{2,})/g;
      const parts = extractedText.split(questionRegex).map(s => s.trim()).filter(Boolean);
      console.log('Fallback split parts:', parts);
      const questions = parts.filter(q => q.length > 10).slice(0, 8); // limit to first 8 for testing
      console.log('Fallback questions to analyze:', questions);
      parsed = [];
      for (const q of questions) {
        try {
          const singlePrompt = `You are an expert ${subject} tutor for Grade ${grade} students.\n\nA student has asked: "${q}"\n\nProvide a comprehensive, grade-appropriate solution as a JSON object with fields: question, answer, explanation, steps, confidence, approaches, flashcards, practiceQuestions, timeToSolve.`;
          const singleResp = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: singlePrompt },
              { role: 'user', content: `Please solve: ${q}` }
            ],
            max_tokens: 800,
            temperature: 0.3
          });
          let singleContent = singleResp.choices[0].message.content;
          if (singleContent.startsWith('```json')) {
            singleContent = singleContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (singleContent.startsWith('```')) {
            singleContent = singleContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          let singleParsed;
          try {
            singleParsed = JSON.parse(singleContent);
          } catch {
            singleParsed = { question: q, answer: singleContent, explanation: singleContent, steps: [singleContent], confidence: 80, approaches: [], flashcards: [], practiceQuestions: [], timeToSolve: "5-10 minutes" };
          }
          parsed.push(singleParsed);
        } catch (err) {
          parsed.push({ question: q, answer: 'Failed to analyze.', explanation: '', steps: [], confidence: 0, approaches: [], flashcards: [], practiceQuestions: [], timeToSolve: '' });
        }
      }
    }
    res.json(parsed);
  } catch (err) {
    const errorLog = `[${new Date().toISOString()}] Error: ${err.message}\nStack: ${err.stack}\n`;
    require('fs').appendFileSync('document-processor-error.log', errorLog);
    console.error('Error in /api/process-document:', err);
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
  console.log(`Available endpoints:`);
  console.log(`  POST /api/gpt4v - Image-based homework analysis`);
  console.log(`  POST /api/homework-helper - Text-based homework analysis`);
  console.log(`  POST /api/process-document - Document-based homework analysis`);
  console.log(`  GET /api/test-openai - Test OpenAI connection`);
}); 