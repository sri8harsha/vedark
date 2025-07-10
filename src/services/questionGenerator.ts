interface QuestionRequest {
  grade: number;
  subject: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  opponentId?: string;
  previousQuestions?: string[];
  studentWeakAreas?: string[];
  topic?: string; // Specific topic to focus on
  format?: 'multiple-choice' | 'true-false' | 'fill-blank' | 'catch-mistake' | 'matching' | 'ordering';
}

interface GeneratedQuestion {
  id: string;
  question: string;
  subject: string;
  grade: number;
  topic: string;
  format: 'multiple-choice' | 'true-false' | 'fill-blank' | 'catch-mistake' | 'matching' | 'ordering';
  steps?: string[];
  options?: { id: string; text: string; isCorrect: boolean; explanation?: string }[];
  correctAnswer: number | string | boolean;
  hasError?: boolean;
  errorStep?: number;
  explanation: string;
  difficulty: string;
  storyContext?: string;
  hints?: string[];
  blanks?: string[];
  matchingPairs?: { question: string; answer: string }[];
  orderingItems?: string[];
}

interface ProblemGenerationResult {
  problem: string;
  storyContext: string;
  topic: string;
  characterScenario: string;
}

interface SolutionGenerationResult {
  steps?: string[];
  hasError: boolean;
  errorStep?: number;
  correctAnswer: number | string | boolean;
  mistakeType?: string;
  options?: { id: string; text: string; isCorrect: boolean; explanation?: string }[];
  blanks?: string[];
  matchingPairs?: { question: string; answer: string }[];
  orderingItems?: string[];
}

interface ExplanationGenerationResult {
  explanation: string;
  characterVoice: string;
  educationalValue: string;
}

interface HintGenerationResult {
  hints: string[];
  characterEncouragement: string;
}

class QuestionGenerator {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    // Log API configuration status
    if (!apiKey || apiKey === 'your-actual-api-key-here' || apiKey.trim() === '') {
      console.log('⚠️ OpenAI API not configured - Using fallback questions');
      console.log('📋 To enable AI questions:');
      console.log('1. Get API key: https://platform.openai.com/api-keys');
      console.log('2. Update .env: VITE_REACT_APP_OPENAI_API_KEY=your-real-key');
      console.log('3. Restart server: Ctrl+C then npm run dev');
    } else {
      console.log('✅ OpenAI API configured - Dynamic questions enabled');
    }
  }

  async generateQuestion(request: QuestionRequest): Promise<GeneratedQuestion> {
    try {
      // Step 1: Generate the problem with character theming
      const problemResult = await this.generateProblem(request);
      
      // Step 2: Generate solution with intentional mistakes
      const solutionResult = await this.generateSolution(request, problemResult);
      
      // Step 3: Generate educational explanation
      const explanationResult = await this.generateExplanation(request, problemResult, solutionResult);
      
      // Step 4: Generate hints
      const hintResult = await this.generateHints(request, problemResult, solutionResult);
      
      // Combine all results into final question
      return this.combineResults(request, problemResult, solutionResult, explanationResult, hintResult);
      
    } catch (error) {
      console.error('Question generation failed:', error);
      return this.getFallbackQuestion(request);
    }
  }

  private async generateProblem(request: QuestionRequest): Promise<ProblemGenerationResult> {
    const characterContext = this.getCharacterContext(request.opponentId || 'iron-man');
    const gradeContext = this.getGradeContext(request.grade, request.subject);
    const topic = request.topic || 'a relevant topic from the curriculum';
    const format = request.format || 'catch-mistake';
    
    const formatInstructions = this.getFormatInstructions(format, request.grade);
    
    const prompt = `
You are creating an educational problem for a Grade ${request.grade} student studying ${request.subject}. 

Character Context: The problem should be presented as if ${characterContext.character} needs help solving it. Use simple, age-appropriate scenarios that a Grade ${request.grade} student can understand.

Requirements:
- Grade Level: Strictly Grade ${request.grade} curriculum level - not easier, not harder
- Subject: ${request.subject} (follow standard Grade ${request.grade} ${request.subject} textbook topics)
- Difficulty: ${request.difficulty.toUpperCase()} complexity for Grade ${request.grade} level
- Character Theme: Frame the problem as ${characterContext.character} asking for help
- Topic Focus: ${topic}
- Format: ${format.toUpperCase()}

Character-Specific Guidelines (use simple concepts for young children):
${this.getCharacterSpecificGuidelines(request.opponentId || 'iron-man')}

Format Instructions:
${formatInstructions}

Generate a single problem that ${characterContext.character} would realistically need help with.

Example Format:
"${characterContext.character} is [doing simple activity] and needs to [solve simple problem]. Help [him/her] figure out..."

Problem: [Generate the actual ${request.subject} problem here]

Respond in JSON format:
{
  "problem": "The actual problem text",
  "storyContext": "Brief character scenario",
  "topic": "Specific topic being tested",
  "characterScenario": "How the character is involved"
}
`;

    const response = await this.makeAPIRequest(prompt);
    return JSON.parse(response);
  }

  private async generateSolution(request: QuestionRequest, problemResult: ProblemGenerationResult): Promise<SolutionGenerationResult> {
    const errorRate = this.getErrorRateByDifficulty(request.difficulty);
    const shouldHaveError = Math.random() < errorRate;
    const mistakeType = this.getMistakeTypeByDifficulty(request.difficulty);
    const format = request.format || 'catch-mistake';
    
    let prompt = '';
    
    if (format === 'catch-mistake') {
      prompt = `
For this problem: ${problemResult.problem}

Generate a step-by-step solution that ${shouldHaveError ? `contains ${mistakeType} for ${request.difficulty} level` : 'is completely correct'}:

${shouldHaveError ? `
Mistake Types by Difficulty:
- EASY: Obvious arithmetic errors, wrong basic operations (2+3=6, 4×5=25)
- NORMAL: Moderate errors in multi-step problems, order of operations mistakes
- HARD: Subtle calculation errors, conceptual misunderstandings
- EXPERT: Very sneaky errors that look almost correct, advanced concept mistakes

Requirements:
1. Show 4-6 solution steps
2. Insert exactly ONE mistake in step [random step 2-5]
3. Make the mistake appropriate for ${request.difficulty} level
4. All other steps should be completely correct
5. The final answer should be wrong due to the mistake
` : `
Requirements:
1. Show 4-6 completely correct solution steps
2. Arrive at the correct final answer
3. Use proper mathematical reasoning throughout
`}

Solution Type: ${shouldHaveError ? 'INCORRECT_WITH_MISTAKE' : 'CORRECT'}

Respond in JSON format:
{
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
  "hasError": ${shouldHaveError},
  "errorStep": ${shouldHaveError ? Math.floor(Math.random() * 4) + 2 : 'null'},
  "correctAnswer": [the correct answer],
  "mistakeType": "${shouldHaveError ? mistakeType : 'none'}"
}
`;
    } else if (format === 'multiple-choice') {
      prompt = `
For this problem: ${problemResult.problem}

Generate 4 multiple choice options for Grade ${request.grade} students:

Requirements:
- Create 4 options (A, B, C, D)
- Only ONE correct answer
- Make distractors realistic but clearly wrong for Grade ${request.grade} level
- Include explanations for why each option is correct/incorrect
- Focus on testing understanding of the specific topic
- Use simple, age-appropriate language

Respond in JSON format:
{
  "options": [
    {"id": "A", "text": "Option A", "isCorrect": false, "explanation": "Why this is wrong"},
    {"id": "B", "text": "Option B", "isCorrect": true, "explanation": "Why this is correct"},
    {"id": "C", "text": "Option C", "isCorrect": false, "explanation": "Why this is wrong"},
    {"id": "D", "text": "Option D", "isCorrect": false, "explanation": "Why this is wrong"}
  ],
  "correctAnswer": "B",
  "hasError": false
}
`;
    } else if (format === 'true-false') {
      prompt = `
For this problem: ${problemResult.problem}

Generate 5 true/false statements for Grade ${request.grade} students:

Requirements:
- Create 5 true/false statements
- Mix true and false statements (60% true, 40% false)
- Make false statements contain common misconceptions for Grade ${request.grade} level
- Each statement should test understanding of the specific topic
- Use simple, age-appropriate language
- Provide explanations for why each statement is true or false

Respond in JSON format:
{
  "options": [
    {"id": "1", "text": "Statement 1", "isCorrect": true, "explanation": "Why this is true"},
    {"id": "2", "text": "Statement 2", "isCorrect": false, "explanation": "Why this is false"},
    {"id": "3", "text": "Statement 3", "isCorrect": true, "explanation": "Why this is true"},
    {"id": "4", "text": "Statement 4", "isCorrect": false, "explanation": "Why this is false"},
    {"id": "5", "text": "Statement 5", "isCorrect": true, "explanation": "Why this is true"}
  ],
  "correctAnswer": "TTFTT",
  "hasError": false
}
`;
    } else if (format === 'fill-blank') {
      prompt = `
For this problem: ${problemResult.problem}

Generate fill-in-the-blank questions for Grade ${request.grade} students:

Requirements:
- Create 3-5 blanks in a paragraph or sentence
- Focus on key vocabulary and concepts from the topic
- Provide word bank with extra options to increase difficulty
- Make blanks test understanding, not just memorization
- Use simple, age-appropriate language
- Include the correct answers

Respond in JSON format:
{
  "blanks": ["word1", "word2", "word3"],
  "correctAnswer": "word1,word2,word3",
  "hasError": false
}
`;
    } else if (format === 'matching') {
      prompt = `
For this problem: ${problemResult.problem}

Generate matching pairs for Grade ${request.grade} students:

Requirements:
- Create 5-7 pairs of related items
- Mix easy and challenging matches
- Include one extra item to make it more challenging
- Focus on relationships and connections within the topic
- Use simple, age-appropriate language
- Include the correct matching

Respond in JSON format:
{
  "matchingPairs": [
    {"question": "Item 1", "answer": "Match A"},
    {"question": "Item 2", "answer": "Match B"},
    {"question": "Item 3", "answer": "Match C"}
  ],
  "correctAnswer": "1A,2B,3C",
  "hasError": false
}
`;
    } else if (format === 'ordering') {
      prompt = `
For this problem: ${problemResult.problem}

Generate ordering items for Grade ${request.grade} students:

Requirements:
- Create 4-6 items that need to be put in correct sequence
- Could be steps in a process, chronological order, or logical sequence
- Make the order meaningful to the topic being studied
- Use simple, age-appropriate language
- Include the correct order

Respond in JSON format:
{
  "orderingItems": ["First step", "Second step", "Third step", "Fourth step"],
  "correctAnswer": "1,2,3,4",
  "hasError": false
}
`;
    }

    const response = await this.makeAPIRequest(prompt);
    return JSON.parse(response);
  }

  private async generateExplanation(request: QuestionRequest, problemResult: ProblemGenerationResult, solutionResult: SolutionGenerationResult): Promise<ExplanationGenerationResult> {
    const characterContext = this.getCharacterContext(request.opponentId || 'iron-man');
    const ageAppropriate = request.grade <= 3 ? 'Use very simple language that a young child can understand. Keep sentences short and clear.' : 'Use age-appropriate language and explanations.';
    
    const prompt = `
For this problem: ${problemResult.problem}
Solution: ${solutionResult.steps?.join('\n') || 'No steps provided'}
Correct Answer: ${solutionResult.correctAnswer}

Generate an educational explanation appropriate for Grade ${request.grade} students:

${ageAppropriate}

${solutionResult.hasError ? `
If the solution was INCORRECT:
- Clearly identify which step contained the error
- Explain why that step was wrong in simple terms
- Show the correct way to do that step
- Provide the correct final answer
- Keep explanation at Grade ${request.grade} reading level
` : `
If the solution was CORRECT:
- Praise the accurate problem-solving approach
- Briefly explain why each major step was correct
- Reinforce the key concept being taught
- Encourage continued learning
`}

Character Voice: Write the explanation as if ${characterContext.character} is helping the student understand, using encouraging language appropriate to that character.

Respond in JSON format:
{
  "explanation": "The educational explanation",
  "characterVoice": "How the character would explain this",
  "educationalValue": "Key learning points"
}
`;

    const response = await this.makeAPIRequest(prompt);
    return JSON.parse(response);
  }

  private async generateHints(request: QuestionRequest, problemResult: ProblemGenerationResult, solutionResult: SolutionGenerationResult): Promise<HintGenerationResult> {
    const characterContext = this.getCharacterContext(request.opponentId || 'iron-man');
    
    const prompt = `
For this problem: ${problemResult.problem}
With this solution showing: ${solutionResult.steps?.join('\n') || 'No steps provided'}

Generate a helpful hint for a Grade ${request.grade} student that:
- Doesn't give away the answer
- Points them toward the error (if there is one) without being too obvious
- Uses ${characterContext.character}'s voice and encouragement
- Matches Grade ${request.grade} comprehension level
- Provides just enough guidance to help them think critically

Respond in JSON format:
{
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "characterEncouragement": "Encouraging message from the character"
}
`;

    const response = await this.makeAPIRequest(prompt);
    return JSON.parse(response);
  }

  private combineResults(
    request: QuestionRequest, 
    problemResult: ProblemGenerationResult, 
    solutionResult: SolutionGenerationResult, 
    explanationResult: ExplanationGenerationResult, 
    hintResult: HintGenerationResult
  ): GeneratedQuestion {
    const format = request.format || 'catch-mistake';
    
    const baseQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: problemResult.problem,
      subject: request.subject,
      grade: request.grade,
      topic: problemResult.topic,
      format: format as any,
      correctAnswer: solutionResult.correctAnswer,
      hasError: solutionResult.hasError,
      errorStep: solutionResult.errorStep,
      explanation: explanationResult.explanation,
      difficulty: request.difficulty,
      storyContext: problemResult.storyContext,
      hints: hintResult.hints
    };

    // Add format-specific fields
    if (format === 'catch-mistake') {
      return {
        ...baseQuestion,
        steps: solutionResult.steps
      };
    } else if (format === 'multiple-choice' || format === 'true-false') {
      return {
        ...baseQuestion,
        options: solutionResult.options
      };
    } else if (format === 'fill-blank') {
      return {
        ...baseQuestion,
        blanks: solutionResult.blanks
      };
    } else if (format === 'matching') {
      return {
        ...baseQuestion,
        matchingPairs: solutionResult.matchingPairs
      };
    } else if (format === 'ordering') {
      return {
        ...baseQuestion,
        orderingItems: solutionResult.orderingItems
      };
    }

    return baseQuestion;
  }

  private getCharacterSpecificGuidelines(opponentId: string): string {
    const guidelines = {
      'iron-man': 'Use simple counting, building things, helping people, flying, making things work, fixing problems',
      'spider-man': 'Use simple counting, helping people, swinging around, catching bad guys, being a hero',
      'batman': 'Use simple counting, helping people, solving problems, being smart, protecting the city',
      'wonder-woman': 'Use simple counting, helping people, being strong, being kind, protecting others',
      'hulk': 'Use simple counting, being strong, helping people, fixing things, solving problems',
      'captain-america': 'Use simple counting, helping people, being brave, working with friends, protecting others',
      'doctor-strange': 'Use simple counting, helping people, solving puzzles, being smart, making things better',
      'thanos': 'Use simple counting, collecting things, solving problems, being strong, making decisions'
    };

    return guidelines[opponentId as keyof typeof guidelines] || guidelines['iron-man'];
  }

  private getErrorRateByDifficulty(difficulty: string): number {
    const rates = {
      easy: 0.8,    // 80% problems have obvious mistakes
      normal: 0.6,  // 60% problems have mistakes
      hard: 0.5,    // 50% problems have mistakes
      expert: 0.4   // 40% problems have mistakes (making correct recognition harder)
    };

    return rates[difficulty as keyof typeof rates] || 0.6;
  }

  private getMistakeTypeByDifficulty(difficulty: string): string {
    const types = {
      easy: 'obvious arithmetic errors, wrong basic operations',
      normal: 'moderate errors in multi-step problems, order of operations mistakes',
      hard: 'subtle calculation errors, conceptual misunderstandings',
      expert: 'very sneaky errors that look almost correct, advanced concept mistakes'
    };

    return types[difficulty as keyof typeof types] || types.normal;
  }

  private async makeAPIRequest(prompt: string): Promise<string> {
    try {
      console.log('🤖 Generating AI question...');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator who generates engaging, grade-appropriate problems with intentional mistakes for students to catch. Always respond in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ OpenAI API authentication failed. Please check your API key configuration.');
          console.log('📋 Instructions:');
          console.log('1. Get your API key from https://platform.openai.com/api-keys');
          console.log('2. Update your .env file with: VITE_REACT_APP_OPENAI_API_KEY=your-real-key');
          console.log('3. Restart the development server');
          throw new Error('OpenAI API authentication failed - Invalid or missing API key');
        }
        
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error('Invalid API response: missing choices array');
      }
      
      if (!data.choices[0].message || !data.choices[0].message.content) {
        throw new Error('Invalid API response: missing message content');
      }
      
      // Clean markdown code block delimiters from the response
      let content = data.choices[0].message.content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return content;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private buildPrompt(request: QuestionRequest): string {
    const gradeContext = this.getGradeContext(request.grade, request.subject);
    const difficultyContext = this.getDifficultyContext(request.difficulty);
    const characterContext = this.getCharacterContext(request.opponentId || 'iron-man');
    const textbookTopics = this.getTextbookTopics(request.grade, request.subject);
    const format = request.format || 'catch-mistake';
    const topic = request.topic || 'a random topic from the list';
    
    const formatInstructions = this.getFormatInstructions(format, request.grade, request.subject);
    
    return `
Generate a ${request.difficulty} ${request.subject} problem for grade ${request.grade} students in Battle Mode.

BATTLE MODE CONTEXT: Students need to engage with educational content in various formats.
- Make questions engaging and grade-appropriate
- Include realistic scenarios and superhero themes
- Provide clear explanations and learning opportunities

GRADE ${request.grade} TEXTBOOK TOPICS: ${textbookTopics}
FOCUS TOPIC: ${topic}
GRADE CONTEXT: ${gradeContext}
DIFFICULTY: ${difficultyContext}
CHARACTER: ${characterContext.character}
QUESTION FORMAT: ${format.toUpperCase()}

REQUIREMENTS:
1. Create an exciting story context featuring ${characterContext.character} and their world: ${characterContext.world}
2. Focus specifically on the topic: ${topic}
3. Use the ${format} format with clear, grade-appropriate content
4. Make the question engaging and educational
5. Use fun, engaging language featuring ${characterContext.character}
6. Include encouraging explanations that reference the specific topic being tested

AVOID these previous topics: ${request.previousQuestions?.join(', ') || 'none'}

${formatInstructions}

OUTPUT FORMAT (JSON):
${this.getOutputFormat(format)}
`;
  }

  private getFormatInstructions(format: string, grade: number, subject: string): string {
    switch (format) {
      case 'multiple-choice':
        return `
MULTIPLE CHOICE FORMAT:
- Create 4 options (A, B, C, D)
- Only ONE correct answer
- Make distractors realistic but clearly wrong
- Include explanations for why each option is correct/incorrect
- Focus on testing understanding of the specific topic
- Use superhero scenarios to make it engaging`;
      
      case 'true-false':
        return `
TRUE/FALSE FORMAT:
- Create 5-7 true/false statements
- Mix true and false statements (60% true, 40% false)
- Make false statements contain common misconceptions
- Each statement should test understanding of the specific topic
- Use superhero scenarios to make it engaging
- Provide explanations for why each statement is true or false`;
      
      case 'fill-blank':
        return `
FILL-IN-THE-BLANK FORMAT:
- Create 3-5 blanks in a paragraph or sentence
- Focus on key vocabulary and concepts from the topic
- Provide word bank with extra options to increase difficulty
- Make blanks test understanding, not just memorization
- Use superhero story context throughout`;
      
      case 'matching':
        return `
MATCHING FORMAT:
- Create 5-7 pairs of related items
- Mix easy and challenging matches
- Include one extra item to make it more challenging
- Focus on relationships and connections within the topic
- Use superhero-themed examples`;
      
      case 'ordering':
        return `
ORDERING FORMAT:
- Create 4-6 items that need to be put in correct sequence
- Could be steps in a process, chronological order, or logical sequence
- Make the order meaningful to the topic being studied
- Use superhero scenarios to make it engaging
- Provide explanations for the correct order`;
      
      case 'catch-mistake':
      default:
        return `
CATCH MISTAKE FORMAT:
- 70% of problems should contain intentional mistakes for students to catch
- 30% should be completely correct to keep students alert
- Make mistakes realistic (common student errors, not obvious blunders)
- Provide 3-4 step solution that either:
  - Contains ONE realistic mistake (calculation error, wrong formula, logic error)
  - Is completely correct (to test if students can recognize good work)
- Make mistakes subtle but catchable by grade-level students

MISTAKE TYPES by difficulty:
- Easy: Obvious calculation errors, wrong operations, basic concept confusion
- Normal: Sign errors, unit mistakes, skipped steps, formula misapplication
- Hard: Formula confusion, logic errors, subtle calculation mistakes, advanced concept errors
- Expert: Complex reasoning errors, advanced concept misapplication, multi-step logic errors`;
    }
  }

  private getOutputFormat(format: string): string {
    switch (format) {
      case 'multiple-choice':
        return `{
  "question": "Create an engaging question about the specific topic",
  "topic": "specific topic name",
  "format": "multiple-choice",
  "options": [
    {"id": "A", "text": "Option A", "isCorrect": false, "explanation": "Why this is wrong"},
    {"id": "B", "text": "Option B", "isCorrect": true, "explanation": "Why this is correct"},
    {"id": "C", "text": "Option C", "isCorrect": false, "explanation": "Why this is wrong"},
    {"id": "D", "text": "Option D", "isCorrect": false, "explanation": "Why this is wrong"}
  ],
  "correctAnswer": "B",
  "explanation": "Detailed explanation of the correct answer and why it's right"
}`;
      
      case 'true-false':
        return `{
  "question": "Read each statement and determine if it's true or false about the specific topic",
  "topic": "specific topic name",
  "format": "true-false",
  "options": [
    {"id": "1", "text": "Statement 1", "isCorrect": true, "explanation": "Why this is true"},
    {"id": "2", "text": "Statement 2", "isCorrect": false, "explanation": "Why this is false"},
    {"id": "3", "text": "Statement 3", "isCorrect": true, "explanation": "Why this is true"},
    {"id": "4", "text": "Statement 4", "isCorrect": false, "explanation": "Why this is false"},
    {"id": "5", "text": "Statement 5", "isCorrect": true, "explanation": "Why this is true"}
  ],
  "correctAnswer": "TTFTT",
  "explanation": "Summary of the key concepts tested"
}`;
      
      case 'fill-blank':
        return `{
  "question": "Fill in the blanks using the word bank provided",
  "topic": "specific topic name",
  "format": "fill-blank",
  "blanks": ["word1", "word2", "word3"],
  "correctAnswer": "word1,word2,word3",
  "explanation": "Explanation of each blank and why those words are correct"
}`;
      
      case 'matching':
        return `{
  "question": "Match each item on the left with its correct pair on the right",
  "topic": "specific topic name",
  "format": "matching",
  "matchingPairs": [
    {"question": "Item 1", "answer": "Match A"},
    {"question": "Item 2", "answer": "Match B"},
    {"question": "Item 3", "answer": "Match C"}
  ],
  "correctAnswer": "1A,2B,3C",
  "explanation": "Explanation of each matching pair and their relationship"
}`;
      
      case 'ordering':
        return `{
  "question": "Put the following items in the correct order",
  "topic": "specific topic name",
  "format": "ordering",
  "orderingItems": ["First step", "Second step", "Third step", "Fourth step"],
  "correctAnswer": "1,2,3,4",
  "explanation": "Explanation of why this order is correct and the logical sequence"
}`;
      
      case 'catch-mistake':
      default:
        return `{
  "question": "Create a unique question about the specific topic",
  "topic": "specific topic name",
  "format": "catch-mistake",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "hasError": true,
  "errorStep": 1,
  "correctAnswer": 120,
  "explanation": "Great catch! The character made a mistake with [specific topic]. The correct approach is..."
}`;
    }
  }

  private getGradeContext(grade: number, subject: string): string {
    const contexts = {
      1: {
        math: 'Simple addition/subtraction up to 20, basic counting, shapes',
        science: 'Animals, plants, weather, five senses',
        english: 'Letter recognition, phonics, simple sentences',
        social_studies: 'Community helpers, basic geography, family roles'
      },
      2: {
        math: 'Addition/subtraction up to 100, basic multiplication, time',
        science: 'Life cycles, habitats, matter states',
        english: 'Long vowels, blends, compound words',
        social_studies: 'Maps, landforms, communities'
      },
      3: {
        math: 'Multiplication tables, division, fractions, area/perimeter',
        science: 'Forces, magnets, rocks, ecosystems',
        english: 'Parts of speech, compound sentences, prefixes',
        social_studies: 'Geography, government, historical events'
      },
      4: {
        math: 'Multi-digit operations, decimals, measurement',
        science: 'Energy, electricity, human body, solar system',
        english: 'Complex sentences, figurative language, research',
        social_studies: 'U.S. regions, government, historical periods'
      },
      5: {
        math: 'Fractions operations, geometry, data analysis',
        science: 'Chemical reactions, cells, earth processes',
        english: 'Advanced grammar, literary analysis, writing genres',
        social_studies: 'U.S. history, world geography, economic systems'
      },
      6: {
        math: 'Ratios, percentages, integers, basic algebra',
        science: 'Genetics, plate tectonics, atomic structure',
        english: 'Advanced grammar, literary analysis, text structures',
        social_studies: 'Ancient civilizations, world history, government systems'
      },
      7: {
        math: 'Linear equations, probability, surface area/volume',
        science: 'Chemistry basics, evolution, climate',
        english: 'Complex sentence structures, advanced analysis',
        social_studies: 'World history, geography, economic systems'
      },
      8: {
        math: 'Functions, systems of equations, Pythagorean theorem',
        science: 'Physics concepts, advanced chemistry, genetics',
        english: 'Advanced grammar, complex analysis, research skills',
        social_studies: 'World history, government systems, global perspectives'
      }
    };

    return contexts[grade as keyof typeof contexts]?.[subject as keyof typeof contexts[1]] || 'General concepts';
  }

  private getCharacterContext(opponentId?: string): any {
    const contexts = {
      'iron-man': {
        character: 'Tony Stark (Iron Man)',
        world: 'Stark Industries, arc reactor technology, high-tech gadgets',
        example: '⚡ Tony Stark needs to calculate power for his new arc reactor!'
      },
      'spider-man': {
        character: 'Peter Parker (Spider-Man)',
        world: 'web-slinging, New York City, spider powers',
        example: '🕸️ Spider-Man swings between buildings!'
      },
      'batman': {
        character: 'Bruce Wayne (Batman)',
        world: 'Gotham City, Wayne Enterprises, detective work',
        example: '🦇 Batman analyzes crime patterns in Gotham!'
      },
      'wonder-woman': {
        character: 'Diana Prince (Wonder Woman)',
        world: 'Themyscira, Amazonian warriors, ancient powers',
        example: '⚔️ Wonder Woman trains with Amazon warriors!'
      },
      'hulk': {
        character: 'Bruce Banner (Hulk)',
        world: 'gamma radiation, scientific research, transformation',
        example: '💚 Dr. Banner measures gamma radiation levels!'
      },
      'captain-america': {
        character: 'Steve Rogers (Captain America)',
        world: 'shield throwing, super soldier serum, 1940s values',
        example: '🛡️ Captain America throws his shield!'
      },
      'doctor-strange': {
        character: 'Stephen Strange (Doctor Strange)',
        world: 'mystic arts, dimensions, magical calculations',
        example: '🔮 Doctor Strange opens portals to different dimensions!'
      },
      'thanos': {
        character: 'Thanos',
        world: 'infinity stones, cosmic balance, universal power',
        example: '💜 Thanos collects infinity stones!'
      }
    };

    return contexts[opponentId as keyof typeof contexts] || contexts['iron-man'];
  }

  private getFallbackQuestion(request: QuestionRequest): GeneratedQuestion {
    const characterContext = this.getCharacterContext(request.opponentId || 'iron-man');
    
    // Expanded fallback questions with more variety and grade-appropriate content
    const fallbacks: Record<string, any[]> = {
      'iron-man-math-1': [
        {
          question: "⚡ Tony Stark builds 5 arc reactors, then 3 more. How many reactors total?",
          steps: ["Step 1: First reactors = 5", "Step 2: More reactors = 3", "Step 3: Total = 5 + 3 = 8"],
          hasError: false,
          correctAnswer: 8,
          explanation: "Perfect! Tony Stark built 8 arc reactors total!"
        },
        {
          question: "⚡ Iron Man has 7 repulsors but 2 malfunction. How many work?",
          steps: ["Step 1: Start with 7 repulsors", "Step 2: 2 malfunction", "Step 3: Working = 7 - 2 = 5"],
          hasError: false,
          correctAnswer: 5,
          explanation: "Correct! Tony has 5 working repulsors!"
        }
      ],
      'iron-man-math-2': [
        {
          question: "⚡ Tony Stark needs 12 energy cells for his suit. He has 8 cells. How many more does he need?",
          steps: ["Step 1: Need 12 cells", "Step 2: Have 8 cells", "Step 3: Need = 12 - 8 = 4"],
          hasError: false,
          correctAnswer: 4,
          explanation: "Great! Tony needs 4 more energy cells!"
        },
        {
          question: "⚡ Iron Man flies 15 miles north, then 8 miles east. How far did he travel total?",
          steps: ["Step 1: North distance = 15 miles", "Step 2: East distance = 8 miles", "Step 3: Total = 15 + 8 = 23 miles"],
          hasError: false,
          correctAnswer: 23,
          explanation: "Excellent! Iron Man traveled 23 miles total!"
        }
      ],
      'iron-man-math-3': [
        {
          question: "⚡ Tony Stark's arc reactor has 24 energy cores. He uses 2/3 of them to power his suit. How many cores are left?",
          steps: ["Step 1: Find 2/3 of 24 cores", "Step 2: 2/3 × 24 = 16 cores used", "Step 3: Cores left = 24 - 16 = 8"],
          hasError: false,
          correctAnswer: 8,
          explanation: "Perfect! Tony has 8 energy cores remaining for his arc reactor."
        },
        {
          question: "⚡ Iron Man's suit uses 3 energy units per minute. How many units in 7 minutes?",
          steps: ["Step 1: Units per minute = 3", "Step 2: Time = 7 minutes", "Step 3: Total = 3 × 7 = 21 units"],
          hasError: false,
          correctAnswer: 21,
          explanation: "Correct! The suit uses 21 energy units in 7 minutes."
        }
      ]
    };

    const key = `${request.opponentId || 'iron-man'}-${request.subject}-${request.grade}`;
    const questionArray = fallbacks[key] || fallbacks['iron-man-math-1'];
    
    // Randomly select a question from the array to avoid repetition
    const randomIndex = Math.floor(Math.random() * questionArray.length);
    const fallback = questionArray[randomIndex];

    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      grade: request.grade,
      subject: request.subject,
      topic: request.topic || 'Basic operations',
      format: request.format || 'catch-mistake',
      difficulty: request.difficulty,
      ...fallback,
      hints: ["Think about the problem step by step", "Check your calculations carefully", "Make sure you understand what's being asked"],
      storyContext: `${characterContext.character} needs your help with this problem!`
    };
  }

  private getFormatInstructions(format: string, grade: number): string {
    const ageAppropriate = grade <= 3 ? 'Use very simple language and concepts that young children can understand.' : 'Use age-appropriate language and concepts.';
    
    switch (format) {
      case 'multiple-choice':
        return `Create a multiple choice question with 4 options (A, B, C, D). ${ageAppropriate} Make it fun and engaging for the character.`;
      
      case 'true-false':
        return `Create 5 true/false statements about the topic. ${ageAppropriate} Mix true and false statements to test understanding.`;
      
      case 'fill-blank':
        return `Create a fill-in-the-blank question with 3-5 blanks. ${ageAppropriate} Focus on key vocabulary and concepts.`;
      
      case 'matching':
        return `Create 5-7 matching pairs of related items. ${ageAppropriate} Include one extra item to make it challenging.`;
      
      case 'ordering':
        return `Create 4-6 items that need to be put in correct order. ${ageAppropriate} Could be steps, sequence, or logical order.`;
      
      case 'catch-mistake':
      default:
        return `Create a problem with a step-by-step solution. ${ageAppropriate} The solution should either be correct or contain one mistake for students to find.`;
    }
  }

  async generateQuestionSet(request: QuestionRequest, count: number = 5): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const question = await this.generateQuestion(request);
        questions.push(question);
      } catch (error) {
        console.error(`Failed to generate question ${i + 1}:`, error);
        questions.push(this.getFallbackQuestion(request));
      }
    }
    
    return questions;
  }
}

export default QuestionGenerator;