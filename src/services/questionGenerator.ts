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

class QuestionGenerator {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateQuestion(request: QuestionRequest): Promise<GeneratedQuestion> {
    const prompt = this.buildPrompt(request);
    
    return this.makeAPIRequestWithRetry(prompt, request);
  }

  private async makeAPIRequestWithRetry(prompt: string, request: QuestionRequest, maxRetries: number = 3): Promise<GeneratedQuestion> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeAPIRequest(prompt, request);
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a rate limit error (429)
        if (error instanceof Error && error.message.includes('status 429')) {
          if (attempt < maxRetries) {
            // Exponential backoff: wait 1s, 2s, 4s for attempts 0, 1, 2
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // For non-429 errors or if we've exhausted retries, break and return fallback
        break;
      }
    }
    
    console.error('Question generation failed after retries:', lastError);
    return this.getFallbackQuestion(request);
  }

  private async makeAPIRequest(prompt: string, request: QuestionRequest): Promise<GeneratedQuestion> {
    try {
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
              content: 'You are an expert educational content creator who generates engaging, grade-appropriate problems with intentional mistakes for students to catch.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 800
        })
      });

      if (!response.ok) {
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
      
      const generatedContent = JSON.parse(content);
      
      return {
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...generatedContent,
        grade: request.grade,
        subject: request.subject,
        difficulty: request.difficulty
      };
    } catch (error) {
      console.error('Question generation failed:', error);
      return this.getFallbackQuestion(request);
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
        science: 'Animals, plants, weather, five senses'
      },
      2: {
        math: 'Addition/subtraction up to 100, basic multiplication, time',
        science: 'Life cycles, habitats, matter states'
      },
      3: {
        math: 'Multiplication tables, division, fractions, area/perimeter',
        science: 'Forces, magnets, rocks, ecosystems'
      },
      4: {
        math: 'Multi-digit operations, decimals, measurement',
        science: 'Energy, electricity, human body, solar system'
      },
      5: {
        math: 'Fractions operations, geometry, data analysis',
        science: 'Chemical reactions, cells, earth processes'
      },
      6: {
        math: 'Ratios, percentages, integers, basic algebra',
        science: 'Genetics, plate tectonics, atomic structure'
      },
      7: {
        math: 'Linear equations, probability, surface area/volume',
        science: 'Chemistry basics, evolution, climate'
      },
      8: {
        math: 'Functions, systems of equations, Pythagorean theorem',
        science: 'Physics concepts, advanced chemistry, genetics'
      }
    };

    return contexts[grade as keyof typeof contexts]?.[subject as keyof typeof contexts[1]] || 'General concepts';
  }

  private getDifficultyContext(difficulty: string): string {
    const contexts = {
      easy: 'Straightforward problems with obvious mistakes, clear steps',
      normal: 'Moderate complexity with subtle mistakes, multiple steps',
      hard: 'Complex problems with tricky mistakes, advanced concepts',
      expert: 'Very challenging with sophisticated mistakes, multi-step reasoning'
    };

    return contexts[difficulty as keyof typeof contexts];
  }

  private getCharacterContext(opponentId?: string): any {
    const contexts = {
      'iron-man': {
        character: 'Tony Stark (Iron Man)',
        world: 'Stark Industries, arc reactor technology, high-tech gadgets',
        example: '⚡ Tony Stark needs to calculate power for his new arc reactor! If each arc reactor produces 8 terawatts and he needs 3 reactors, how much total power?'
      },
      'spider-man': {
        character: 'Peter Parker (Spider-Man)',
        world: 'web-slinging, New York City, spider powers',
        example: '🕸️ Spider-Man swings between buildings! If he swings 12 blocks north and 5 blocks east, how far is he from his starting point?'
      },
      'batman': {
        character: 'Bruce Wayne (Batman)',
        world: 'Gotham City, Wayne Enterprises, detective work',
        example: '🦇 Batman analyzes crime patterns in Gotham! If there were 15 crimes on Monday and 8 on Tuesday, what\'s the total?'
      },
      'wonder-woman': {
        character: 'Diana Prince (Wonder Woman)',
        world: 'Themyscira, Amazonian warriors, ancient powers',
        example: '⚔️ Wonder Woman trains with 20 Amazon warriors. If 3/4 of them use swords, how many warriors use swords?'
      },
      'hulk': {
        character: 'Bruce Banner (Hulk)',
        world: 'gamma radiation, scientific research, transformation',
        example: '💚 Dr. Banner measures gamma radiation levels! The reading shows 45 units in the morning and 67 units at night. What\'s the increase?'
      },
      'captain-america': {
        character: 'Steve Rogers (Captain America)',
        world: 'shield throwing, super soldier serum, 1940s values',
        example: '🛡️ Captain America throws his shield 8 times, hitting 3 targets each throw. How many total hits?'
      },
      'doctor-strange': {
        character: 'Stephen Strange (Doctor Strange)',
        world: 'mystic arts, dimensions, magical calculations',
        example: '🔮 Doctor Strange opens 6 portals to different dimensions. If each portal uses 4 mystic energy units, how much total energy?'
      },
      'thanos': {
        character: 'Thanos',
        world: 'infinity stones, cosmic balance, universal power',
        example: '💜 Thanos collects infinity stones! He has 4 stones and needs 6 total. How many more stones does he need?'
      }
    };

    return contexts[opponentId as keyof typeof contexts] || contexts['iron-man'];
  }

  private getTextbookTopics(grade: number, subject: string): string {
    const topics = {
      1: {
        math: 'Addition facts (0-20), Subtraction facts (0-20), Counting by 2s, 5s, 10s, Basic shapes (circle, square, triangle, rectangle), Simple word problems, Number patterns, Place value (ones, tens), Money (pennies, nickels, dimes)',
        science: 'Living vs non-living things, Parts of plants (roots, stem, leaves, flowers), Animal habitats, Five senses (sight, hearing, touch, taste, smell), Weather (sunny, rainy, cloudy, snowy), Basic needs of living things (food, water, shelter), Simple machines (lever, pulley), States of matter (solid, liquid, gas)',
        english: 'Letter recognition (A-Z), Phonics (consonant sounds, short vowel sounds), Sight words, Simple sentences, Capitalization rules, Punctuation (period, question mark), Rhyming words, Story elements (character, setting, plot)',
        social_studies: 'Community helpers (police, firefighter, teacher, doctor), Basic geography (land, water), Family roles, School rules, Holidays and celebrations, Maps and globes, Basic history (past, present, future), Cultural diversity'
      },
      2: {
        math: 'Addition and subtraction (0-100), Skip counting by 2s, 5s, 10s, 25s, Basic multiplication (0-5), Time (hours, half-hours, quarter-hours), Money (quarters, dollars), Measurement (inches, feet, yards), Simple fractions (1/2, 1/3, 1/4), Word problems, Number patterns, Place value (hundreds)',
        science: 'Life cycles (butterfly, frog, plant), Animal adaptations, Food chains, Matter properties (color, shape, size, texture), Forces (push, pull), Magnets (attract, repel), Weather patterns, Seasons, Plant parts and functions, Simple experiments',
        english: 'Long vowel sounds, Blends and digraphs, Compound words, Contractions, Plural nouns, Adjectives, Simple sentences, Reading comprehension, Writing process, Story sequencing',
        social_studies: 'Maps and map symbols, Landforms (mountains, rivers, oceans), Communities (urban, suburban, rural), Government basics, Historical figures, Cultural traditions, Economics basics (goods, services), Citizenship'
      },
      3: {
        math: 'Multiplication tables (0-10), Division facts, Fractions (numerator, denominator), Area and perimeter, Rounding numbers, Estimation, Word problems, Number patterns, Place value (thousands), Time (minutes, hours, days), Money (making change), Data and graphs',
        science: 'Forces and motion, Simple machines, Energy (light, sound, heat), Ecosystems, Food webs, Animal classification, Plant life cycles, Weather and climate, Earth materials (rocks, soil), Scientific method, Simple experiments',
        english: 'Parts of speech (nouns, verbs, adjectives, adverbs), Subject-verb agreement, Compound sentences, Prefixes and suffixes, Context clues, Reading strategies, Writing genres (narrative, informative), Editing and revising',
        social_studies: 'Geography (continents, oceans, countries), Government branches, Historical events, Cultural celebrations, Economics (supply, demand), Native American cultures, Colonial America, Map skills'
      },
      4: {
        math: 'Multi-digit multiplication, Long division, Decimals (tenths, hundredths), Fractions (equivalent, comparing, adding, subtracting), Measurement (metric and customary), Area and perimeter, Word problems, Number patterns, Place value (millions), Time (elapsed time), Money (budgeting), Data analysis',
        science: 'Energy (kinetic, potential), Electricity and circuits, Human body systems, Solar system, Weather patterns, Ecosystems, Food chains and webs, Plant and animal adaptations, Scientific method, Simple experiments, Matter (states, properties)',
        english: 'Parts of speech (all), Complex sentences, Figurative language (similes, metaphors), Reading comprehension strategies, Writing process, Research skills, Grammar rules, Vocabulary development, Literary elements',
        social_studies: 'U.S. regions, State geography, Government (local, state, federal), Historical periods, Cultural diversity, Economics (trade, resources), Native American history, Colonial period, Revolutionary War, Map skills'
      },
      5: {
        math: 'Fractions (all operations), Decimals (all operations), Geometry (angles, polygons, area, volume), Data analysis (mean, median, mode), Word problems, Number patterns, Place value, Measurement conversions, Time, Money, Probability',
        science: 'Chemical reactions, Cells and cell structure, Earth processes (weathering, erosion), Ecosystems, Energy transfer, Force and motion, Scientific method, Experiments, Matter and energy, Living systems',
        english: 'Parts of speech mastery, Complex sentences, Figurative language, Reading comprehension, Writing genres, Research skills, Grammar and usage, Vocabulary, Literary analysis, Text structures',
        social_studies: 'U.S. history (pre-Columbian to Civil War), World geography, Government systems, Economic systems, Cultural studies, Historical analysis, Map skills, Research methods, Current events, Civic engagement'
      },
      6: {
        math: 'Ratios and proportions, Percentages, Integers (positive, negative), Basic algebra (variables, equations), Geometry (area, volume, surface area), Data analysis, Word problems, Number patterns, Fractions and decimals, Measurement, Probability',
        science: 'Genetics and heredity, Plate tectonics, Atomic structure, Energy and matter, Ecosystems, Scientific method, Experiments, Data analysis, Scientific inquiry, Living systems, Earth science',
        english: 'Advanced grammar, Complex sentences, Literary analysis, Reading comprehension, Writing process, Research skills, Vocabulary development, Text analysis, Writing genres, Language conventions',
        social_studies: 'Ancient civilizations, World history, Geography, Government systems, Economic systems, Cultural studies, Historical analysis, Research skills, Current events, Global perspectives'
      },
      7: {
        math: 'Linear equations, Probability, Surface area and volume, Data analysis, Word problems, Number patterns, Algebra basics, Geometry, Fractions and decimals, Measurement, Statistics',
        science: 'Chemistry basics, Evolution, Climate and weather, Energy and matter, Ecosystems, Scientific method, Experiments, Data analysis, Scientific inquiry, Living systems, Earth science',
        english: 'Advanced grammar and usage, Complex sentence structures, Literary analysis, Reading comprehension, Writing process, Research skills, Vocabulary, Text analysis, Writing genres, Language conventions',
        social_studies: 'World history, Geography, Government systems, Economic systems, Cultural studies, Historical analysis, Research skills, Current events, Global perspectives, Civic engagement'
      },
      8: {
        math: 'Functions, Systems of equations, Pythagorean theorem, Geometry, Data analysis, Word problems, Number patterns, Algebra, Statistics, Probability, Measurement',
        science: 'Physics concepts, Advanced chemistry, Genetics, Energy and matter, Ecosystems, Scientific method, Experiments, Data analysis, Scientific inquiry, Living systems, Earth science',
        english: 'Advanced grammar and usage, Complex sentence structures, Literary analysis, Reading comprehension, Writing process, Research skills, Vocabulary, Text analysis, Writing genres, Language conventions',
        social_studies: 'World history, Geography, Government systems, Economic systems, Cultural studies, Historical analysis, Research skills, Current events, Global perspectives, Civic engagement'
      }
    };

    return topics[grade as keyof typeof topics]?.[subject as keyof typeof topics[1]] || 'General concepts appropriate for this grade level';
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
      ],
      'spider-man-math-1': [
        {
          question: "🕸️ Spider-Man swings past 5 buildings, then 3 more. How many buildings total?",
          steps: ["Step 1: First buildings = 5", "Step 2: More buildings = 3", "Step 3: Total = 5 + 3 = 8"],
          hasError: false,
          correctAnswer: 8,
          explanation: "Perfect! Spider-Man swung past 8 buildings total!"
        },
        {
          question: "🕸️ Spider-Man catches 4 criminals in the morning and 6 at night. How many total?",
          steps: ["Step 1: Morning criminals = 4", "Step 2: Night criminals = 6", "Step 3: Total = 4 + 6 = 10"],
          hasError: false,
          correctAnswer: 10,
          explanation: "Great! Spider-Man caught 10 criminals total!"
        }
      ],
      'spider-man-math-2': [
        {
          question: "🕸️ Spider-Man has 12 web cartridges but uses 7 during a fight. How many are left?",
          steps: ["Step 1: Start with 12 cartridges", "Step 2: Uses 7 cartridges", "Step 3: Left = 12 - 7 = 5"],
          hasError: false,
          correctAnswer: 5,
          explanation: "Great! Spider-Man has 5 web cartridges remaining!"
        },
        {
          question: "🕸️ Spider-Man swings 18 blocks north and 9 blocks east. How far did he travel?",
          steps: ["Step 1: North distance = 18 blocks", "Step 2: East distance = 9 blocks", "Step 3: Total = 18 + 9 = 27 blocks"],
          hasError: false,
          correctAnswer: 27,
          explanation: "Excellent! Spider-Man traveled 27 blocks total!"
        }
      ],
      'spider-man-math-3': [
        {
          question: "🕸️ Spider-Man swings past 18 buildings. He stops at 1/3 of them to help people. How many buildings did he stop at?",
          steps: ["Step 1: Find 1/3 of 18 buildings", "Step 2: 1/3 × 18 = 6 buildings", "Step 3: Spider-Man stopped at 6 buildings"],
          hasError: false,
          correctAnswer: 6,
          explanation: "Great job! Spider-Man stopped at 6 buildings to help people."
        },
        {
          question: "🕸️ Spider-Man's web can hold 24 pounds. He needs to rescue 3 people weighing 8 pounds each. Can his web hold them?",
          steps: ["Step 1: Weight per person = 8 pounds", "Step 2: Total weight = 8 × 3 = 24 pounds", "Step 3: Web capacity = 24 pounds, so YES!"],
          hasError: false,
          correctAnswer: "Yes",
          explanation: "Perfect! Spider-Man's web can hold exactly 24 pounds, which is the total weight of the 3 people."
        }
      ],
      'batman-math-1': [
        {
          question: "🦇 Batman catches 12 criminals in Gotham at night and 8 during the day. How many total?",
          steps: ["Step 1: Night criminals = 12", "Step 2: Day criminals = 8", "Step 3: Total = 12 + 8 = 20"],
          hasError: false,
          correctAnswer: 20,
          explanation: "Excellent! Batman caught 20 villains total!"
        }
      ],
      'batman-math-2': [
        {
          question: "🦇 Batman has 15 batarangs but loses 6 during a chase. How many does he have left?",
          steps: ["Step 1: Start with 15 batarangs", "Step 2: Loses 6 batarangs", "Step 3: Left = 15 - 6 = 9"],
          hasError: false,
          correctAnswer: 9,
          explanation: "Great! Batman has 9 batarangs remaining!"
        }
      ],
      'batman-math-3': [
        {
          question: "🦇 Batman investigates 21 crime scenes. He solves 2/3 of them. How many crimes did he solve?",
          steps: ["Step 1: Find 2/3 of 21 crimes", "Step 2: 2/3 × 21 = 14 crimes", "Step 3: Batman solved 14 crimes"],
          hasError: false,
          correctAnswer: 14,
          explanation: "Perfect! Batman solved 14 out of 21 crimes!"
        }
      ],
      'hulk-math-1': [
        {
          question: "💚 Hulk smashes 6 gamma machines, each with 4 parts. How many parts total?",
          steps: ["Step 1: Machines = 6", "Step 2: Parts each = 4", "Step 3: Total parts = 6 × 4 = 24"],
          hasError: false,
          correctAnswer: 24,
          explanation: "HULK SMASH CORRECTLY! 24 parts total!"
        }
      ],
      'hulk-math-2': [
        {
          question: "💚 Hulk has 20 gamma containers but breaks 8 of them. How many are left?",
          steps: ["Step 1: Start with 20 containers", "Step 2: Breaks 8 containers", "Step 3: Left = 20 - 8 = 12"],
          hasError: false,
          correctAnswer: 12,
          explanation: "HULK SMASH! 12 containers remaining!"
        }
      ],
      'hulk-math-3': [
        {
          question: "💚 Hulk destroys 16 buildings. He smashes 3/4 of them completely. How many buildings were completely destroyed?",
          steps: ["Step 1: Find 3/4 of 16 buildings", "Step 2: 3/4 × 16 = 12 buildings", "Step 3: 12 buildings completely destroyed"],
          hasError: false,
          correctAnswer: 12,
          explanation: "HULK SMASH! 12 buildings completely destroyed!"
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
      difficulty: request.difficulty,
      ...fallback
    };
  }

  // Generate multiple questions for a session
  async generateQuestionSet(request: QuestionRequest, count: number = 5): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    const usedTopics: string[] = [];

    for (let i = 0; i < count; i++) {
      const questionRequest = {
        ...request,
        previousQuestions: usedTopics
      };

      const question = await this.generateQuestion(questionRequest);
      questions.push(question);
      usedTopics.push(question.question);

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return questions;
  }
}

export default QuestionGenerator;