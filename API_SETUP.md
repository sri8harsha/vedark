# VEDARK API Setup Guide

## OpenAI API Configuration

To enable dynamic, grade-appropriate question generation based on user preferences (grade, subject, topic, difficulty), you need to configure your OpenAI API key.

### Step 1: Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated API key (it starts with "sk-")

### Step 2: Configure the API Key
1. Create a `.env` file in the root directory of your project
2. Add the following line:
   ```
   VITE_REACT_APP_OPENAI_API_KEY=your-actual-api-key-here
   ```
3. Replace `your-actual-api-key-here` with your real API key (starts with "sk-")
4. Restart your development server

### Step 3: Important Security Notes
- Never commit your API key to version control
- Keep your API key private and secure
- The `.env` file should be in your `.gitignore`
- Monitor your API usage at https://platform.openai.com/usage

### Step 4: Verify Configuration
- Open the browser console (F12)
- Look for: `✅ OpenAI API configured - Dynamic questions enabled`
- If you see: `⚠️ OpenAI API not configured - Using fallback questions`, check your `.env` file

### Step 5: Test Question Generation
1. Go to Battle Mode
2. Select your grade, subject, and difficulty
3. Questions should be generated based on your exact preferences
4. Check the console for generation status messages

## Current Question Generation Prompts

### System Prompt
```
You are an expert educational content creator who generates engaging, grade-appropriate problems with intentional mistakes for students to catch.
```

### Main Prompt Structure
The system generates questions using this comprehensive prompt:

```
Generate a [difficulty] [subject] problem for grade [grade] students in Battle Mode.

BATTLE MODE CONTEXT: Students need to identify if the AI's solution contains a mistake or is correct.
- 70% of problems should contain intentional mistakes for students to catch
- 30% should be completely correct to keep students alert
- Make mistakes realistic (common student errors, not obvious blunders)

GRADE [grade] TEXTBOOK TOPICS: [comprehensive list of grade-appropriate topics]
GRADE CONTEXT: [grade-specific learning objectives]
DIFFICULTY: [difficulty-specific instructions]
CHARACTER: [superhero character and their world]

REQUIREMENTS:
1. Create an exciting story context featuring [character] and their world
2. Focus on ONE specific textbook topic from the list above
3. Include a clear, grade-appropriate problem that tests understanding of that topic
4. Provide 3-4 step solution that either:
   - Contains ONE realistic mistake (calculation error, wrong formula, logic error)
   - Is completely correct (to test if students can recognize good work)
5. Make mistakes subtle but catchable by grade-level students
6. Use fun, engaging language featuring [character]
7. Include encouraging explanations that reference the specific topic being tested

AVOID these previous topics: [list of previously used topics]

MISTAKE TYPES by difficulty:
- Easy: Obvious calculation errors, wrong operations, basic concept confusion
- Normal: Sign errors, unit mistakes, skipped steps, formula misapplication
- Hard: Formula confusion, logic errors, subtle calculation mistakes, advanced concept errors
- Expert: Complex reasoning errors, advanced concept misapplication, multi-step logic errors

OUTPUT FORMAT (JSON):
{
  "question": "Create a unique question about a specific textbook topic",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "hasError": true,
  "errorStep": 1,
  "correctAnswer": 120,
  "explanation": "Great catch! [character] made a mistake with [specific topic]. The correct approach is..."
}
```

### Textbook Topics by Grade

#### Grade 1
- **Math**: Addition facts (0-20), Subtraction facts (0-20), Counting by 2s, 5s, 10s, Basic shapes, Simple word problems, Number patterns, Place value, Money
- **Science**: Living vs non-living things, Parts of plants, Animal habitats, Five senses, Weather, Basic needs of living things, Simple machines, States of matter
- **English**: Letter recognition, Phonics, Sight words, Simple sentences, Capitalization rules, Punctuation, Rhyming words, Story elements
- **Social Studies**: Community helpers, Basic geography, Family roles, School rules, Holidays and celebrations, Maps and globes, Basic history, Cultural diversity

#### Grade 2
- **Math**: Addition and subtraction (0-100), Skip counting, Basic multiplication (0-5), Time, Money, Measurement, Simple fractions, Word problems, Number patterns, Place value
- **Science**: Life cycles, Animal adaptations, Food chains, Matter properties, Forces, Magnets, Weather patterns, Seasons, Plant parts and functions, Simple experiments
- **English**: Long vowel sounds, Blends and digraphs, Compound words, Contractions, Plural nouns, Adjectives, Simple sentences, Reading comprehension, Writing process, Story sequencing
- **Social Studies**: Maps and map symbols, Landforms, Communities, Government basics, Historical figures, Cultural traditions, Economics basics, Citizenship

#### Grade 3
- **Math**: Multiplication tables (0-10), Division facts, Fractions, Area and perimeter, Rounding numbers, Estimation, Word problems, Number patterns, Place value, Time, Money, Data and graphs
- **Science**: Forces and motion, Simple machines, Energy, Ecosystems, Food webs, Animal classification, Plant life cycles, Weather and climate, Earth materials, Scientific method, Simple experiments
- **English**: Parts of speech, Subject-verb agreement, Compound sentences, Prefixes and suffixes, Context clues, Reading strategies, Writing genres, Editing and revising
- **Social Studies**: Geography, Government branches, Historical events, Cultural celebrations, Economics, Native American cultures, Colonial America, Map skills

#### Grade 4
- **Math**: Multi-digit multiplication, Long division, Decimals, Fractions, Measurement, Area and perimeter, Word problems, Number patterns, Place value, Time, Money, Data analysis
- **Science**: Energy, Electricity and circuits, Human body systems, Solar system, Weather patterns, Ecosystems, Food chains and webs, Plant and animal adaptations, Scientific method, Simple experiments, Matter
- **English**: Parts of speech, Complex sentences, Figurative language, Reading comprehension strategies, Writing process, Research skills, Grammar rules, Vocabulary development, Literary elements
- **Social Studies**: U.S. regions, State geography, Government, Historical periods, Cultural diversity, Economics, Native American history, Colonial period, Revolutionary War, Map skills

#### Grade 5
- **Math**: Fractions (all operations), Decimals (all operations), Geometry, Data analysis, Word problems, Number patterns, Place value, Measurement conversions, Time, Money, Probability
- **Science**: Chemical reactions, Cells and cell structure, Earth processes, Ecosystems, Energy transfer, Force and motion, Scientific method, Experiments, Matter and energy, Living systems
- **English**: Parts of speech mastery, Complex sentences, Figurative language, Reading comprehension, Writing genres, Research skills, Grammar and usage, Vocabulary, Literary analysis, Text structures
- **Social Studies**: U.S. history, World geography, Government systems, Economic systems, Cultural studies, Historical analysis, Map skills, Research methods, Current events, Civic engagement

#### Grade 6
- **Math**: Ratios and proportions, Percentages, Integers, Basic algebra, Geometry, Data analysis, Word problems, Number patterns, Fractions and decimals, Measurement, Probability
- **Science**: Genetics and heredity, Plate tectonics, Atomic structure, Energy and matter, Ecosystems, Scientific method, Experiments, Data analysis, Scientific inquiry, Living systems, Earth science
- **English**: Advanced grammar, Complex sentences, Literary analysis, Reading comprehension, Writing process, Research skills, Vocabulary development, Text analysis, Writing genres, Language conventions
- **Social Studies**: Ancient civilizations, World history, Geography, Government systems, Economic systems, Cultural studies, Historical analysis, Research skills, Current events, Global perspectives

#### Grade 7
- **Math**: Linear equations, Probability, Surface area and volume, Data analysis, Word problems, Number patterns, Algebra basics, Geometry, Fractions and decimals, Measurement, Statistics
- **Science**: Chemistry basics, Evolution, Climate and weather, Energy and matter, Ecosystems, Scientific method, Experiments, Data analysis, Scientific inquiry, Living systems, Earth science
- **English**: Advanced grammar and usage, Complex sentence structures, Literary analysis, Reading comprehension, Writing process, Research skills, Vocabulary, Text analysis, Writing genres, Language conventions
- **Social Studies**: World history, Geography, Government systems, Economic systems, Cultural studies, Historical analysis, Research skills, Current events, Global perspectives, Civic engagement

#### Grade 8
- **Math**: Functions, Systems of equations, Pythagorean theorem, Geometry, Data analysis, Word problems, Number patterns, Algebra, Statistics, Probability, Measurement
- **Science**: Physics concepts, Advanced chemistry, Genetics, Energy and matter, Ecosystems, Scientific method, Experiments, Data analysis, Scientific inquiry, Living systems, Earth science
- **English**: Advanced grammar and usage, Complex sentence structures, Literary analysis, Reading comprehension, Writing process, Research skills, Vocabulary, Text analysis, Writing genres, Language conventions
- **Social Studies**: World history, Geography, Government systems, Economic systems, Cultural studies, Historical analysis, Research skills, Current events, Global perspectives, Civic engagement

## Character Integration

Each superhero character has their own theme and world:
- **Iron Man**: Stark Industries, arc reactor technology, high-tech gadgets
- **Spider-Man**: Web-slinging, New York City, spider powers
- **Batman**: Gotham City, Wayne Enterprises, detective work
- **Wonder Woman**: Themyscira, Amazonian warriors, ancient powers
- **Hulk**: Gamma radiation, scientific research, transformation
- **Captain America**: Shield throwing, super soldier serum, 1940s values
- **Doctor Strange**: Mystic arts, dimensions, magical calculations
- **Thanos**: Infinity stones, cosmic balance, universal power

## Fallback System

When the API is not available or fails, the system uses an expanded bank of pre-written questions that:
- Are grade-appropriate and subject-specific
- Include character themes
- Have realistic mistakes or correct solutions
- Provide educational explanations
- Are randomly selected to avoid repetition

## Troubleshooting

### Common Issues
1. **Questions repeating**: Check if API key is configured properly
2. **API errors**: Verify your API key is valid and has credits
3. **Rate limiting**: The system includes automatic retry with exponential backoff
4. **Fallback questions**: If you see fallback questions, check the console for API status

### Console Messages
- `✅ OpenAI API configured - Dynamic questions enabled` - API working
- `⚠️ OpenAI API not configured - Using fallback questions` - API not configured
- `🤖 Generating AI question for Grade X Y (Z)` - AI generation in progress
- `✅ AI question generated successfully` - AI generation successful
- `❌ Failed to generate AI question` - AI generation failed, using fallback
- `📚 Using fallback questions` - Using pre-written questions 