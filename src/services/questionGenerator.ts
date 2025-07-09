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
  steps: string[];
  hasError: boolean;
  errorStep?: number;
  correctAnswer: number | string | boolean;
  mistakeType?: string;
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
    
    const prompt = `
You are creating an educational problem for a Grade ${request.grade} student studying ${request.subject}. 

Character Context: The problem should be presented as if ${characterContext.character} needs help solving it. Use ${characterContext.character}'s world and scenarios but keep the academic content appropriate for Grade ${request.grade}.

Requirements:
- Grade Level: Strictly Grade ${request.grade} curriculum level - not easier, not harder
- Subject: ${request.subject} (follow standard Grade ${request.grade} ${request.subject} textbook topics)
- Difficulty: ${request.difficulty.toUpperCase()} complexity for Grade ${request.grade} level
- Character Theme: Frame the problem as ${characterContext.character} asking for help
- Topic Focus: ${topic}

Character-Specific Guidelines:
${this.getCharacterSpecificGuidelines(request.opponentId || 'iron-man')}

Generate a single problem that ${characterContext.character} would realistically need help with.

Example Format:
"${characterContext.character} is [doing character-appropriate activity] and needs to [solve specific problem]. Help [him/her] calculate..."

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
    
    const prompt = `
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

    const response = await this.makeAPIRequest(prompt);
    return JSON.parse(response);
  }

  private async generateExplanation(request: QuestionRequest, problemResult: ProblemGenerationResult, solutionResult: SolutionGenerationResult): Promise<ExplanationGenerationResult> {
    const characterContext = this.getCharacterContext(request.opponentId || 'iron-man');
    
    const prompt = `
For this problem and solution:
Problem: ${problemResult.problem}
Solution: ${solutionResult.steps.join('\n')}
Correct Answer: ${solutionResult.correctAnswer}

Generate an educational explanation appropriate for Grade ${request.grade} students:

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
With this solution showing: ${solutionResult.steps.join('\n')}

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
    return {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: problemResult.problem,
      subject: request.subject,
      grade: request.grade,
      topic: problemResult.topic,
      format: request.format || 'catch-mistake',
      steps: solutionResult.steps,
      correctAnswer: solutionResult.correctAnswer,
      hasError: solutionResult.hasError,
      errorStep: solutionResult.errorStep,
      explanation: explanationResult.explanation,
      difficulty: request.difficulty,
      storyContext: problemResult.storyContext,
      hints: hintResult.hints,
      characterVoice: explanationResult.characterVoice
    };
  }

  private getCharacterSpecificGuidelines(opponentId: string): string {
    const guidelines = {
      'iron-man': 'Use technology, engineering, workshop calculations, arc reactor scenarios, Stark Industries problems',
      'spider-man': 'Use physics, web mechanics, building heights, trajectory problems, New York City scenarios',
      'batman': 'Use detective work, crime analysis, Gotham City scenarios, logical deduction, Wayne Enterprises',
      'wonder-woman': 'Use ancient history, mythology, warrior training, Themyscira settings, Amazonian scenarios',
      'hulk': 'Use strength calculations, scientific transformations, anger management data, gamma radiation',
      'captain-america': 'Use historical events, shield physics, tactical planning, WWII scenarios, leadership',
      'doctor-strange': 'Use mystical dimensions, time calculations, magical formulas, dimensional travel',
      'thanos': 'Use cosmic scales, universal calculations, space scenarios, infinity stone problems'
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