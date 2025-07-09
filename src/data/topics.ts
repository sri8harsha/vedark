// Define Topic interface locally
interface Topic {
  id: string;
  name: string;
  description: string;
  grade: number;
  subject: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  examples: string[];
}

export const topics: Topic[] = [
  // Grade 1 Math Topics
  {
    id: 'math-1-addition',
    name: 'Addition Facts (0-20)',
    description: 'Learn to add numbers up to 20 with superhero help!',
    grade: 1,
    subject: 'math',
    difficulty: 'easy',
    examples: ['Iron Man adds arc reactor parts', 'Spider-Man counts web cartridges']
  },
  {
    id: 'math-1-subtraction',
    name: 'Subtraction Facts (0-20)',
    description: 'Practice subtracting numbers up to 20',
    grade: 1,
    subject: 'math',
    difficulty: 'easy',
    examples: ['Batman subtracts batarangs used', 'Hulk counts remaining gamma containers']
  },
  {
    id: 'math-1-counting',
    name: 'Counting by 2s, 5s, 10s',
    description: 'Skip counting with superhero patterns',
    grade: 1,
    subject: 'math',
    difficulty: 'easy',
    examples: ['Captain America counts shield throws', 'Wonder Woman counts Amazon warriors']
  },
  {
    id: 'math-1-shapes',
    name: 'Basic Shapes',
    description: 'Identify circles, squares, triangles, rectangles',
    grade: 1,
    subject: 'math',
    difficulty: 'easy',
    examples: ['Iron Man\'s arc reactor shapes', 'Spider-Man\'s web patterns']
  },
  {
    id: 'math-1-money',
    name: 'Money (Pennies, Nickels, Dimes)',
    description: 'Learn about coins and their values',
    grade: 1,
    subject: 'math',
    difficulty: 'easy',
    examples: ['Batman counts his fortune', 'Tony Stark\'s coin collection']
  },

  // Grade 2 Math Topics
  {
    id: 'math-2-addition-100',
    name: 'Addition and Subtraction (0-100)',
    description: 'Work with larger numbers up to 100',
    grade: 2,
    subject: 'math',
    difficulty: 'normal',
    examples: ['Iron Man calculates suit energy', 'Spider-Man adds up crime statistics']
  },
  {
    id: 'math-2-multiplication',
    name: 'Basic Multiplication (0-5)',
    description: 'Learn multiplication tables for numbers 0-5',
    grade: 2,
    subject: 'math',
    difficulty: 'normal',
    examples: ['Hulk smashes multiple objects', 'Captain America throws multiple shields']
  },
  {
    id: 'math-2-time',
    name: 'Time (Hours, Half-hours, Quarter-hours)',
    description: 'Tell time on analog and digital clocks',
    grade: 2,
    subject: 'math',
    difficulty: 'normal',
    examples: ['Batman\'s patrol schedule', 'Spider-Man\'s school day timing']
  },
  {
    id: 'math-2-fractions',
    name: 'Simple Fractions (1/2, 1/3, 1/4)',
    description: 'Understand basic fractions',
    grade: 2,
    subject: 'math',
    difficulty: 'normal',
    examples: ['Wonder Woman divides Amazon forces', 'Iron Man splits arc reactor power']
  },

  // Grade 3 Math Topics
  {
    id: 'math-3-multiplication-tables',
    name: 'Multiplication Tables (0-10)',
    description: 'Master multiplication facts 0-10',
    grade: 3,
    subject: 'math',
    difficulty: 'normal',
    examples: ['Hulk smashes groups of objects', 'Spider-Man multiplies web cartridges']
  },
  {
    id: 'math-3-division',
    name: 'Division Facts',
    description: 'Learn division as sharing and grouping',
    grade: 3,
    subject: 'math',
    difficulty: 'normal',
    examples: ['Captain America divides shield throws', 'Batman shares batarangs']
  },
  {
    id: 'math-3-area-perimeter',
    name: 'Area and Perimeter',
    description: 'Calculate area and perimeter of rectangles',
    grade: 3,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Iron Man\'s workshop dimensions', 'Spider-Man\'s web area calculations']
  },
  {
    id: 'math-3-fractions',
    name: 'Fractions (Numerator, Denominator)',
    description: 'Understand fraction parts and relationships',
    grade: 3,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Wonder Woman\'s battle formations', 'Hulk\'s strength fractions']
  },

  // Grade 4 Math Topics
  {
    id: 'math-4-multi-digit',
    name: 'Multi-digit Multiplication',
    description: 'Multiply larger numbers using standard algorithm',
    grade: 4,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Iron Man\'s factory production', 'Spider-Man\'s city calculations']
  },
  {
    id: 'math-4-long-division',
    name: 'Long Division',
    description: 'Divide larger numbers with remainders',
    grade: 4,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Batman\'s resource distribution', 'Captain America\'s team divisions']
  },
  {
    id: 'math-4-decimals',
    name: 'Decimals (Tenths, Hundredths)',
    description: 'Work with decimal numbers',
    grade: 4,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Iron Man\'s precision measurements', 'Spider-Man\'s web strength decimals']
  },
  {
    id: 'math-4-measurement',
    name: 'Measurement (Metric and Customary)',
    description: 'Convert between different units of measurement',
    grade: 4,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Hulk\'s size measurements', 'Wonder Woman\'s distance calculations']
  },

  // Grade 5 Math Topics
  {
    id: 'math-5-fractions-operations',
    name: 'Fractions (All Operations)',
    description: 'Add, subtract, multiply, and divide fractions',
    grade: 5,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Iron Man\'s power calculations', 'Spider-Man\'s web strength ratios']
  },
  {
    id: 'math-5-decimals-operations',
    name: 'Decimals (All Operations)',
    description: 'Perform all operations with decimal numbers',
    grade: 5,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Batman\'s financial calculations', 'Captain America\'s strategy planning']
  },
  {
    id: 'math-5-geometry',
    name: 'Geometry (Angles, Polygons, Area, Volume)',
    description: 'Explore geometric shapes and their properties',
    grade: 5,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Iron Man\'s suit geometry', 'Wonder Woman\'s shield patterns']
  },
  {
    id: 'math-5-data-analysis',
    name: 'Data Analysis (Mean, Median, Mode)',
    description: 'Analyze and interpret data sets',
    grade: 5,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Spider-Man\'s crime statistics', 'Batman\'s detective data']
  },

  // Grade 1 Science Topics
  {
    id: 'science-1-living-nonliving',
    name: 'Living vs Non-living Things',
    description: 'Identify characteristics of living and non-living things',
    grade: 1,
    subject: 'science',
    difficulty: 'easy',
    examples: ['Spider-Man studies city life', 'Iron Man examines his robots']
  },
  {
    id: 'science-1-plants',
    name: 'Parts of Plants',
    description: 'Learn about roots, stem, leaves, and flowers',
    grade: 1,
    subject: 'science',
    difficulty: 'easy',
    examples: ['Wonder Woman\'s Amazonian plants', 'Hulk\'s forest exploration']
  },
  {
    id: 'science-1-animals',
    name: 'Animal Habitats',
    description: 'Explore where different animals live',
    grade: 1,
    subject: 'science',
    difficulty: 'easy',
    examples: ['Spider-Man discovers city animals', 'Batman studies Gotham wildlife']
  },
  {
    id: 'science-1-senses',
    name: 'Five Senses',
    description: 'Learn about sight, hearing, touch, taste, and smell',
    grade: 1,
    subject: 'science',
    difficulty: 'easy',
    examples: ['Spider-Man\'s enhanced senses', 'Iron Man\'s sensor technology']
  },

  // Grade 2 Science Topics
  {
    id: 'science-2-life-cycles',
    name: 'Life Cycles',
    description: 'Study how living things grow and change',
    grade: 2,
    subject: 'science',
    difficulty: 'normal',
    examples: ['Spider-Man\'s transformation', 'Hulk\'s metamorphosis']
  },
  {
    id: 'science-2-adaptations',
    name: 'Animal Adaptations',
    description: 'Learn how animals survive in their environments',
    grade: 2,
    subject: 'science',
    difficulty: 'normal',
    examples: ['Spider-Man\'s spider abilities', 'Batman\'s bat-like skills']
  },
  {
    id: 'science-2-food-chains',
    name: 'Food Chains',
    description: 'Understand how energy flows through ecosystems',
    grade: 2,
    subject: 'science',
    difficulty: 'normal',
    examples: ['Spider-Man\'s web food chain', 'Hulk\'s ecosystem impact']
  },
  {
    id: 'science-2-matter',
    name: 'Matter Properties',
    description: 'Explore color, shape, size, and texture of materials',
    grade: 2,
    subject: 'science',
    difficulty: 'normal',
    examples: ['Iron Man\'s suit materials', 'Wonder Woman\'s magical objects']
  },

  // Grade 3 Science Topics
  {
    id: 'science-3-forces',
    name: 'Forces and Motion',
    description: 'Learn about pushes, pulls, and how things move',
    grade: 3,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Hulk\'s incredible strength', 'Spider-Man\'s web physics']
  },
  {
    id: 'science-3-simple-machines',
    name: 'Simple Machines',
    description: 'Study levers, pulleys, and other simple machines',
    grade: 3,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Iron Man\'s suit mechanisms', 'Batman\'s crime-fighting tools']
  },
  {
    id: 'science-3-energy',
    name: 'Energy (Light, Sound, Heat)',
    description: 'Explore different forms of energy',
    grade: 3,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Iron Man\'s arc reactor energy', 'Spider-Man\'s kinetic energy']
  },
  {
    id: 'science-3-ecosystems',
    name: 'Ecosystems',
    description: 'Study how living things interact with their environment',
    grade: 3,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Spider-Man\'s city ecosystem', 'Wonder Woman\'s island environment']
  },

  // Grade 4 Science Topics
  {
    id: 'science-4-energy-types',
    name: 'Energy (Kinetic, Potential)',
    description: 'Understand different types of energy',
    grade: 4,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Spider-Man\'s swinging energy', 'Hulk\'s transformation energy']
  },
  {
    id: 'science-4-electricity',
    name: 'Electricity and Circuits',
    description: 'Learn about electrical circuits and conductivity',
    grade: 4,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Iron Man\'s electrical systems', 'Spider-Man\'s web conductivity']
  },
  {
    id: 'science-4-human-body',
    name: 'Human Body Systems',
    description: 'Study how body systems work together',
    grade: 4,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Captain America\'s enhanced body', 'Hulk\'s transformed physiology']
  },
  {
    id: 'science-4-solar-system',
    name: 'Solar System',
    description: 'Explore planets, stars, and space',
    grade: 4,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Iron Man\'s space missions', 'Thor\'s cosmic adventures']
  },

  // Grade 5 Science Topics
  {
    id: 'science-5-chemical-reactions',
    name: 'Chemical Reactions',
    description: 'Learn about how substances change',
    grade: 5,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Iron Man\'s suit chemistry', 'Hulk\'s gamma radiation reactions']
  },
  {
    id: 'science-5-cells',
    name: 'Cells and Cell Structure',
    description: 'Study the building blocks of life',
    grade: 5,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Spider-Man\'s cellular changes', 'Hulk\'s cell transformation']
  },
  {
    id: 'science-5-earth-processes',
    name: 'Earth Processes',
    description: 'Learn about weathering, erosion, and deposition',
    grade: 5,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Hulk\'s environmental impact', 'Wonder Woman\'s earth powers']
  },
  {
    id: 'science-5-ecosystems',
    name: 'Ecosystems and Energy Transfer',
    description: 'Study how energy moves through living systems',
    grade: 5,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Spider-Man\'s web ecosystem', 'Batman\'s Gotham environment']
  },

  // Grade 1 English Topics
  {
    id: 'english-1-letters',
    name: 'Letter Recognition (A-Z)',
    description: 'Identify and write all letters of the alphabet',
    grade: 1,
    subject: 'english',
    difficulty: 'easy',
    examples: ['Iron Man\'s alphabet technology', 'Spider-Man\'s letter learning']
  },
  {
    id: 'english-1-phonics',
    name: 'Phonics (Consonant Sounds, Short Vowels)',
    description: 'Learn letter sounds and blending',
    grade: 1,
    subject: 'english',
    difficulty: 'easy',
    examples: ['Batman\'s detective phonics', 'Wonder Woman\'s Amazonian words']
  },
  {
    id: 'english-1-sight-words',
    name: 'Sight Words',
    description: 'Recognize common words instantly',
    grade: 1,
    subject: 'english',
    difficulty: 'easy',
    examples: ['Spider-Man\'s web words', 'Iron Man\'s tech vocabulary']
  },
  {
    id: 'english-1-sentences',
    name: 'Simple Sentences',
    description: 'Write and read basic sentences',
    grade: 1,
    subject: 'english',
    difficulty: 'easy',
    examples: ['Captain America\'s simple commands', 'Hulk\'s basic statements']
  },

  // Grade 2 English Topics
  {
    id: 'english-2-long-vowels',
    name: 'Long Vowel Sounds',
    description: 'Learn long vowel patterns and sounds',
    grade: 2,
    subject: 'english',
    difficulty: 'normal',
    examples: ['Iron Man\'s advanced words', 'Spider-Man\'s expanded vocabulary']
  },
  {
    id: 'english-2-blends',
    name: 'Blends and Digraphs',
    description: 'Practice consonant blends and digraphs',
    grade: 2,
    subject: 'english',
    difficulty: 'normal',
    examples: ['Batman\'s detective words', 'Wonder Woman\'s magical language']
  },
  {
    id: 'english-2-compound-words',
    name: 'Compound Words',
    description: 'Combine words to make new meanings',
    grade: 2,
    subject: 'english',
    difficulty: 'normal',
    examples: ['Spider-Man\'s web-related terms', 'Iron Man\'s compound tech words']
  },
  {
    id: 'english-2-contractions',
    name: 'Contractions',
    description: 'Learn to combine words with apostrophes',
    grade: 2,
    subject: 'english',
    difficulty: 'normal',
    examples: ['Captain America\'s speech patterns', 'Hulk\'s simple contractions']
  },

  // Grade 3 English Topics
  {
    id: 'english-3-parts-speech',
    name: 'Parts of Speech',
    description: 'Identify nouns, verbs, adjectives, and adverbs',
    grade: 3,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man\'s technical descriptions', 'Spider-Man\'s action words']
  },
  {
    id: 'english-3-subject-verb',
    name: 'Subject-Verb Agreement',
    description: 'Match subjects and verbs correctly',
    grade: 3,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Batman\'s detective reports', 'Wonder Woman\'s Amazonian speech']
  },
  {
    id: 'english-3-compound-sentences',
    name: 'Compound Sentences',
    description: 'Combine simple sentences with conjunctions',
    grade: 3,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Captain America\'s complex commands', 'Hulk\'s detailed explanations']
  },
  {
    id: 'english-3-prefixes-suffixes',
    name: 'Prefixes and Suffixes',
    description: 'Learn word parts that change meaning',
    grade: 3,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man\'s technical prefixes', 'Spider-Man\'s web-related suffixes']
  },

  // Grade 4 English Topics
  {
    id: 'english-4-complex-sentences',
    name: 'Complex Sentences',
    description: 'Create sentences with dependent and independent clauses',
    grade: 4,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Batman\'s detailed analysis', 'Wonder Woman\'s diplomatic speech']
  },
  {
    id: 'english-4-figurative-language',
    name: 'Figurative Language (Similes, Metaphors)',
    description: 'Use creative language to make comparisons',
    grade: 4,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man\'s poetic descriptions', 'Spider-Man\'s web metaphors']
  },
  {
    id: 'english-4-reading-strategies',
    name: 'Reading Comprehension Strategies',
    description: 'Use strategies to understand what you read',
    grade: 4,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Captain America\'s battle analysis', 'Hulk\'s scientific reading']
  },
  {
    id: 'english-4-writing-process',
    name: 'Writing Process',
    description: 'Plan, draft, revise, and edit your writing',
    grade: 4,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man\'s technical writing', 'Spider-Man\'s journal entries']
  },

  // Grade 5 English Topics
  {
    id: 'english-5-parts-speech-mastery',
    name: 'Parts of Speech Mastery',
    description: 'Master all parts of speech and their functions',
    grade: 5,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Batman\'s sophisticated language', 'Wonder Woman\'s diplomatic speech']
  },
  {
    id: 'english-5-complex-sentences',
    name: 'Complex Sentence Structures',
    description: 'Create sophisticated sentence patterns',
    grade: 5,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man\'s technical explanations', 'Spider-Man\'s detailed reports']
  },
  {
    id: 'english-5-literary-analysis',
    name: 'Literary Analysis',
    description: 'Analyze characters, plot, and themes in stories',
    grade: 5,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Captain America\'s story analysis', 'Hulk\'s character development']
  },
  {
    id: 'english-5-research-skills',
    name: 'Research Skills',
    description: 'Find, evaluate, and use information from sources',
    grade: 5,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man\'s scientific research', 'Batman\'s detective investigation']
  },

  // Grade 6 Math Topics
  {
    id: 'math-6-ratios',
    name: 'Ratios and Proportions',
    description: 'Understand and solve problems involving ratios and proportions',
    grade: 6,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Iron Man calculates gear ratios', 'Spider-Man compares web strengths']
  },
  {
    id: 'math-6-percentages',
    name: 'Percentages',
    description: 'Work with percentages in real-world contexts',
    grade: 6,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Batman analyzes crime statistics', 'Wonder Woman calculates success rates']
  },
  {
    id: 'math-6-integers',
    name: 'Integers (Positive & Negative Numbers)',
    description: 'Add, subtract, multiply, and divide integers',
    grade: 6,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Hulk smashes negative numbers', 'Iron Man balances equations']
  },
  {
    id: 'math-6-algebra',
    name: 'Basic Algebra',
    description: 'Solve simple equations with variables',
    grade: 6,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Spider-Man solves for x', 'Batman uses algebra in detective work']
  },
  {
    id: 'math-6-geometry',
    name: 'Geometry (Area, Volume, Surface Area)',
    description: 'Calculate area, volume, and surface area of shapes',
    grade: 6,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Iron Man designs suit parts', 'Wonder Woman measures shield area']
  },
  {
    id: 'math-6-data',
    name: 'Data Analysis',
    description: 'Interpret and analyze data sets',
    grade: 6,
    subject: 'math',
    difficulty: 'hard',
    examples: ['Batman reviews Batcave data', 'Spider-Man tracks villain patterns']
  },

  // Grade 7 Math Topics
  {
    id: 'math-7-linear-equations',
    name: 'Linear Equations',
    description: 'Solve and graph linear equations',
    grade: 7,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Iron Man programs suit trajectories', 'Spider-Man plots web lines']
  },
  {
    id: 'math-7-probability',
    name: 'Probability',
    description: 'Calculate probability of events',
    grade: 7,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Batman predicts outcomes', 'Wonder Woman calculates odds in battle']
  },
  {
    id: 'math-7-surface-area',
    name: 'Surface Area and Volume',
    description: 'Find surface area and volume of 3D shapes',
    grade: 7,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Iron Man measures armor', 'Hulk smashes cubes']
  },
  {
    id: 'math-7-algebra-basics',
    name: 'Algebra Basics',
    description: 'Work with variables and expressions',
    grade: 7,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Spider-Man solves for unknowns', 'Batman deciphers clues']
  },
  {
    id: 'math-7-geometry',
    name: 'Geometry (Angles, Triangles, Circles)',
    description: 'Explore properties of angles, triangles, and circles',
    grade: 7,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Wonder Woman studies shield geometry', 'Iron Man designs gadgets']
  },
  {
    id: 'math-7-statistics',
    name: 'Statistics',
    description: 'Analyze and interpret statistical data',
    grade: 7,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Batman reviews crime stats', 'Spider-Man analyzes web patterns']
  },

  // Grade 8 Math Topics
  {
    id: 'math-8-functions',
    name: 'Functions',
    description: 'Understand and use functions in math',
    grade: 8,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Iron Man programs suit functions', 'Spider-Man models web strength']
  },
  {
    id: 'math-8-systems',
    name: 'Systems of Equations',
    description: 'Solve systems of linear equations',
    grade: 8,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Batman coordinates Batcave systems', 'Wonder Woman solves puzzles']
  },
  {
    id: 'math-8-pythagorean',
    name: 'Pythagorean Theorem',
    description: 'Apply the Pythagorean theorem to solve problems',
    grade: 8,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Spider-Man swings across right triangles', 'Iron Man calculates distances']
  },
  {
    id: 'math-8-algebra',
    name: 'Algebra (Advanced)',
    description: 'Work with exponents, polynomials, and quadratic equations',
    grade: 8,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Iron Man optimizes suit power', 'Batman solves advanced riddles']
  },
  {
    id: 'math-8-geometry',
    name: 'Geometry (Transformations, Similarity)',
    description: 'Explore transformations and similarity in geometry',
    grade: 8,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Wonder Woman studies shield transformations', 'Spider-Man maps city blocks']
  },
  {
    id: 'math-8-statistics',
    name: 'Statistics and Probability',
    description: 'Analyze data and calculate probability',
    grade: 8,
    subject: 'math',
    difficulty: 'expert',
    examples: ['Batman predicts outcomes', 'Iron Man reviews mission data']
  },

  // Grade 6 Science Topics
  {
    id: 'science-6-genetics',
    name: 'Genetics and Heredity',
    description: 'Study genes, traits, and heredity',
    grade: 6,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Spider-Man explores spider DNA', 'Hulk studies gamma mutations']
  },
  {
    id: 'science-6-plate-tectonics',
    name: 'Plate Tectonics',
    description: 'Learn about Earth’s moving plates',
    grade: 6,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Wonder Woman studies earthquakes', 'Iron Man maps continents']
  },
  {
    id: 'science-6-atoms',
    name: 'Atomic Structure',
    description: 'Explore atoms, elements, and molecules',
    grade: 6,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Iron Man analyzes arc reactor', 'Hulk smashes atoms']
  },
  {
    id: 'science-6-ecosystems',
    name: 'Ecosystems',
    description: 'Study living and nonliving things in environments',
    grade: 6,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Spider-Man explores city ecosystems', 'Wonder Woman protects forests']
  },
  {
    id: 'science-6-energy',
    name: 'Energy and Matter',
    description: 'Understand energy transfer and matter changes',
    grade: 6,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Iron Man powers up', 'Hulk transforms energy']
  },
  {
    id: 'science-6-earth-science',
    name: 'Earth Science',
    description: 'Study weather, rocks, and natural resources',
    grade: 6,
    subject: 'science',
    difficulty: 'hard',
    examples: ['Batman investigates minerals', 'Wonder Woman studies weather']
  },

  // Grade 7 Science Topics
  {
    id: 'science-7-chemistry',
    name: 'Chemistry Basics',
    description: 'Learn about elements, compounds, and reactions',
    grade: 7,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Iron Man mixes chemicals', 'Hulk studies reactions']
  },
  {
    id: 'science-7-evolution',
    name: 'Evolution',
    description: 'Understand natural selection and adaptation',
    grade: 7,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Spider-Man adapts to new powers', 'Wonder Woman studies ancient species']
  },
  {
    id: 'science-7-climate',
    name: 'Climate and Weather',
    description: 'Explore climate zones and weather patterns',
    grade: 7,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Batman tracks storms', 'Iron Man monitors climate']
  },
  {
    id: 'science-7-energy',
    name: 'Energy and Matter',
    description: 'Study energy transfer and matter changes',
    grade: 7,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Hulk transforms energy', 'Iron Man powers up']
  },
  {
    id: 'science-7-ecosystems',
    name: 'Ecosystems',
    description: 'Study living and nonliving things in environments',
    grade: 7,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Spider-Man explores city ecosystems', 'Wonder Woman protects forests']
  },
  {
    id: 'science-7-earth-science',
    name: 'Earth Science',
    description: 'Study rocks, minerals, and natural resources',
    grade: 7,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Batman investigates minerals', 'Wonder Woman studies weather']
  },

  // Grade 8 Science Topics
  {
    id: 'science-8-physics',
    name: 'Physics Concepts',
    description: 'Explore motion, forces, and energy',
    grade: 8,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Iron Man tests flight', 'Hulk smashes with force']
  },
  {
    id: 'science-8-chemistry',
    name: 'Advanced Chemistry',
    description: 'Study chemical reactions and equations',
    grade: 8,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Iron Man mixes chemicals', 'Hulk studies reactions']
  },
  {
    id: 'science-8-genetics',
    name: 'Genetics',
    description: 'Learn about genes, DNA, and heredity',
    grade: 8,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Spider-Man explores spider DNA', 'Hulk studies gamma mutations']
  },
  {
    id: 'science-8-energy',
    name: 'Energy and Matter',
    description: 'Understand energy transfer and matter changes',
    grade: 8,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Iron Man powers up', 'Hulk transforms energy']
  },
  {
    id: 'science-8-ecosystems',
    name: 'Ecosystems',
    description: 'Study living and nonliving things in environments',
    grade: 8,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Spider-Man explores city ecosystems', 'Wonder Woman protects forests']
  },
  {
    id: 'science-8-earth-science',
    name: 'Earth Science',
    description: 'Study rocks, minerals, and natural resources',
    grade: 8,
    subject: 'science',
    difficulty: 'expert',
    examples: ['Batman investigates minerals', 'Wonder Woman studies weather']
  },

  // Grade 6 English Topics
  {
    id: 'english-6-grammar',
    name: 'Advanced Grammar',
    description: 'Master advanced grammar rules and usage',
    grade: 6,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man writes technical reports', 'Spider-Man edits web articles']
  },
  {
    id: 'english-6-literary-analysis',
    name: 'Literary Analysis',
    description: 'Analyze characters, plot, and themes in stories',
    grade: 6,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Batman reviews detective novels', 'Wonder Woman studies myths']
  },
  {
    id: 'english-6-reading',
    name: 'Reading Comprehension',
    description: 'Use strategies to understand complex texts',
    grade: 6,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Captain America reads history', 'Hulk studies science books']
  },
  {
    id: 'english-6-writing',
    name: 'Writing Process',
    description: 'Plan, draft, revise, and edit writing',
    grade: 6,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man drafts blueprints', 'Spider-Man writes news stories']
  },
  {
    id: 'english-6-vocabulary',
    name: 'Vocabulary Development',
    description: 'Expand vocabulary and word usage',
    grade: 6,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Wonder Woman learns new languages', 'Batman studies word origins']
  },
  {
    id: 'english-6-text-analysis',
    name: 'Text Analysis',
    description: 'Analyze and interpret different types of texts',
    grade: 6,
    subject: 'english',
    difficulty: 'hard',
    examples: ['Iron Man deciphers codes', 'Spider-Man interprets clues']
  },

  // Grade 7 English Topics
  {
    id: 'english-7-grammar',
    name: 'Advanced Grammar and Usage',
    description: 'Master advanced grammar and sentence structures',
    grade: 7,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man writes technical manuals', 'Spider-Man edits web content']
  },
  {
    id: 'english-7-literary-analysis',
    name: 'Literary Analysis',
    description: 'Analyze literature and themes',
    grade: 7,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Batman reviews detective novels', 'Wonder Woman studies myths']
  },
  {
    id: 'english-7-reading',
    name: 'Reading Comprehension',
    description: 'Understand and analyze complex texts',
    grade: 7,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Captain America reads history', 'Hulk studies science books']
  },
  {
    id: 'english-7-writing',
    name: 'Writing Process',
    description: 'Plan, draft, revise, and edit writing',
    grade: 7,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man drafts blueprints', 'Spider-Man writes news stories']
  },
  {
    id: 'english-7-vocabulary',
    name: 'Vocabulary Development',
    description: 'Expand vocabulary and word usage',
    grade: 7,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Wonder Woman learns new languages', 'Batman studies word origins']
  },
  {
    id: 'english-7-text-analysis',
    name: 'Text Analysis',
    description: 'Analyze and interpret different types of texts',
    grade: 7,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man deciphers codes', 'Spider-Man interprets clues']
  },

  // Grade 8 English Topics
  {
    id: 'english-8-grammar',
    name: 'Advanced Grammar and Usage',
    description: 'Master advanced grammar and sentence structures',
    grade: 8,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man writes technical manuals', 'Spider-Man edits web content']
  },
  {
    id: 'english-8-literary-analysis',
    name: 'Literary Analysis',
    description: 'Analyze literature and themes',
    grade: 8,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Batman reviews detective novels', 'Wonder Woman studies myths']
  },
  {
    id: 'english-8-reading',
    name: 'Reading Comprehension',
    description: 'Understand and analyze complex texts',
    grade: 8,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Captain America reads history', 'Hulk studies science books']
  },
  {
    id: 'english-8-writing',
    name: 'Writing Process',
    description: 'Plan, draft, revise, and edit writing',
    grade: 8,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man drafts blueprints', 'Spider-Man writes news stories']
  },
  {
    id: 'english-8-vocabulary',
    name: 'Vocabulary Development',
    description: 'Expand vocabulary and word usage',
    grade: 8,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Wonder Woman learns new languages', 'Batman studies word origins']
  },
  {
    id: 'english-8-text-analysis',
    name: 'Text Analysis',
    description: 'Analyze and interpret different types of texts',
    grade: 8,
    subject: 'english',
    difficulty: 'expert',
    examples: ['Iron Man deciphers codes', 'Spider-Man interprets clues']
  },

  // Grade 1 Social Studies Topics
  {
    id: 'social-1-community-helpers',
    name: 'Community Helpers',
    description: 'Learn about people who help in the community',
    grade: 1,
    subject: 'social_studies',
    difficulty: 'easy',
    examples: ['Spider-Man helps neighbors', 'Iron Man supports the city']
  },
  {
    id: 'social-1-geography',
    name: 'Basic Geography',
    description: 'Identify land and water on maps',
    grade: 1,
    subject: 'social_studies',
    difficulty: 'easy',
    examples: ['Wonder Woman explores islands', 'Batman maps Gotham']
  },
  {
    id: 'social-1-family',
    name: 'Family Roles',
    description: 'Understand different family roles',
    grade: 1,
    subject: 'social_studies',
    difficulty: 'easy',
    examples: ['Iron Man and Pepper', 'Spider-Man and Aunt May']
  },
  {
    id: 'social-1-school-rules',
    name: 'School Rules',
    description: 'Learn about rules at school',
    grade: 1,
    subject: 'social_studies',
    difficulty: 'easy',
    examples: ['Batman follows Batcave rules', 'Wonder Woman teaches Amazon rules']
  },
  {
    id: 'social-1-holidays',
    name: 'Holidays and Celebrations',
    description: 'Explore different holidays',
    grade: 1,
    subject: 'social_studies',
    difficulty: 'easy',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },
  {
    id: 'social-1-maps',
    name: 'Maps and Globes',
    description: 'Learn about maps and globes',
    grade: 1,
    subject: 'social_studies',
    difficulty: 'easy',
    examples: ['Batman uses Batcave map', 'Wonder Woman explores the world']
  },

  // Grade 2 Social Studies Topics
  {
    id: 'social-2-maps',
    name: 'Maps and Map Symbols',
    description: 'Learn about different map symbols',
    grade: 2,
    subject: 'social_studies',
    difficulty: 'normal',
    examples: ['Spider-Man reads city maps', 'Iron Man uses GPS']
  },
  {
    id: 'social-2-landforms',
    name: 'Landforms',
    description: 'Identify mountains, rivers, and oceans',
    grade: 2,
    subject: 'social_studies',
    difficulty: 'normal',
    examples: ['Wonder Woman explores islands', 'Batman maps Gotham']
  },
  {
    id: 'social-2-communities',
    name: 'Communities',
    description: 'Compare urban, suburban, and rural communities',
    grade: 2,
    subject: 'social_studies',
    difficulty: 'normal',
    examples: ['Iron Man in the city', 'Spider-Man in Queens']
  },
  {
    id: 'social-2-government',
    name: 'Government Basics',
    description: 'Learn about local government',
    grade: 2,
    subject: 'social_studies',
    difficulty: 'normal',
    examples: ['Batman meets the mayor', 'Wonder Woman visits city hall']
  },
  {
    id: 'social-2-historical-figures',
    name: 'Historical Figures',
    description: 'Learn about important people in history',
    grade: 2,
    subject: 'social_studies',
    difficulty: 'normal',
    examples: ['Iron Man studies inventors', 'Spider-Man learns about heroes']
  },
  {
    id: 'social-2-economics',
    name: 'Economics Basics',
    description: 'Understand goods and services',
    grade: 2,
    subject: 'social_studies',
    difficulty: 'normal',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },

  // Grade 3 Social Studies Topics
  {
    id: 'social-3-geography',
    name: 'Geography',
    description: 'Learn about continents, oceans, and countries',
    grade: 3,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Wonder Woman explores the world', 'Batman maps Gotham']
  },
  {
    id: 'social-3-government',
    name: 'Government Branches',
    description: 'Understand the three branches of government',
    grade: 3,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Iron Man meets the president', 'Spider-Man learns about laws']
  },
  {
    id: 'social-3-history',
    name: 'Historical Events',
    description: 'Study important events in history',
    grade: 3,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Batman studies Gotham history', 'Wonder Woman learns about wars']
  },
  {
    id: 'social-3-culture',
    name: 'Cultural Celebrations',
    description: 'Explore different cultures and their celebrations',
    grade: 3,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },
  {
    id: 'social-3-economics',
    name: 'Economics',
    description: 'Learn about supply and demand',
    grade: 3,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },
  {
    id: 'social-3-native-americans',
    name: 'Native American Cultures',
    description: 'Study Native American history and culture',
    grade: 3,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Wonder Woman learns about tribes', 'Batman studies ancient cultures']
  },

  // Grade 4 Social Studies Topics
  {
    id: 'social-4-us-regions',
    name: 'U.S. Regions',
    description: 'Learn about different regions of the United States',
    grade: 4,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Iron Man visits the Midwest', 'Spider-Man explores the Northeast']
  },
  {
    id: 'social-4-state-geography',
    name: 'State Geography',
    description: 'Study the geography of your state',
    grade: 4,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Batman maps Gotham', 'Wonder Woman explores Themyscira']
  },
  {
    id: 'social-4-government',
    name: 'Government (Local, State, Federal)',
    description: 'Understand different levels of government',
    grade: 4,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Iron Man meets the governor', 'Spider-Man learns about city councils']
  },
  {
    id: 'social-4-history',
    name: 'Historical Periods',
    description: 'Study different periods in history',
    grade: 4,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Batman studies Gotham history', 'Wonder Woman learns about ancient times']
  },
  {
    id: 'social-4-culture',
    name: 'Cultural Diversity',
    description: 'Explore diverse cultures in society',
    grade: 4,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },
  {
    id: 'social-4-economics',
    name: 'Economics (Trade, Resources)',
    description: 'Learn about trade and natural resources',
    grade: 4,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },

  // Grade 5 Social Studies Topics
  {
    id: 'social-5-us-history',
    name: 'U.S. History',
    description: 'Study U.S. history from pre-Columbian to Civil War',
    grade: 5,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Iron Man studies American history', 'Spider-Man learns about presidents']
  },
  {
    id: 'social-5-world-geography',
    name: 'World Geography',
    description: 'Explore world geography and continents',
    grade: 5,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Wonder Woman explores the world', 'Batman maps Gotham']
  },
  {
    id: 'social-5-government',
    name: 'Government Systems',
    description: 'Learn about different government systems',
    grade: 5,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Iron Man meets world leaders', 'Spider-Man learns about laws']
  },
  {
    id: 'social-5-economics',
    name: 'Economic Systems',
    description: 'Understand different economic systems',
    grade: 5,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },
  {
    id: 'social-5-culture',
    name: 'Cultural Studies',
    description: 'Explore cultures around the world',
    grade: 5,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },
  {
    id: 'social-5-history',
    name: 'Historical Analysis',
    description: 'Analyze historical events and their impact',
    grade: 5,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Batman studies Gotham history', 'Wonder Woman learns about ancient times']
  },

  // Grade 6 Social Studies Topics
  {
    id: 'social-6-ancient-civilizations',
    name: 'Ancient Civilizations',
    description: 'Study ancient cultures and societies',
    grade: 6,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Wonder Woman explores ancient Greece', 'Batman studies Egypt']
  },
  {
    id: 'social-6-world-history',
    name: 'World History',
    description: 'Learn about major world events and eras',
    grade: 6,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Iron Man reviews inventions', 'Spider-Man learns about explorers']
  },
  {
    id: 'social-6-geography',
    name: 'Geography',
    description: 'Study continents, countries, and regions',
    grade: 6,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Wonder Woman explores the world', 'Batman maps Gotham']
  },
  {
    id: 'social-6-government',
    name: 'Government Systems',
    description: 'Understand different forms of government',
    grade: 6,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Iron Man meets world leaders', 'Spider-Man learns about laws']
  },
  {
    id: 'social-6-economics',
    name: 'Economic Systems',
    description: 'Learn about trade, resources, and economies',
    grade: 6,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },
  {
    id: 'social-6-culture',
    name: 'Cultural Studies',
    description: 'Explore cultures and traditions',
    grade: 6,
    subject: 'social_studies',
    difficulty: 'hard',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },

  // Grade 7 Social Studies Topics
  {
    id: 'social-7-world-history',
    name: 'World History',
    description: 'Study major world events and civilizations',
    grade: 7,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Wonder Woman explores ancient Greece', 'Batman studies Egypt']
  },
  {
    id: 'social-7-geography',
    name: 'Geography',
    description: 'Study continents, countries, and regions',
    grade: 7,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Wonder Woman explores the world', 'Batman maps Gotham']
  },
  {
    id: 'social-7-government',
    name: 'Government Systems',
    description: 'Understand different forms of government',
    grade: 7,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Iron Man meets world leaders', 'Spider-Man learns about laws']
  },
  {
    id: 'social-7-economics',
    name: 'Economic Systems',
    description: 'Learn about trade, resources, and economies',
    grade: 7,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },
  {
    id: 'social-7-culture',
    name: 'Cultural Studies',
    description: 'Explore cultures and traditions',
    grade: 7,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },
  {
    id: 'social-7-historical-analysis',
    name: 'Historical Analysis',
    description: 'Analyze historical events and their impact',
    grade: 7,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Batman studies Gotham history', 'Wonder Woman learns about ancient times']
  },

  // Grade 8 Social Studies Topics
  {
    id: 'social-8-world-history',
    name: 'World History',
    description: 'Study major world events and civilizations',
    grade: 8,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Wonder Woman explores ancient Greece', 'Batman studies Egypt']
  },
  {
    id: 'social-8-geography',
    name: 'Geography',
    description: 'Study continents, countries, and regions',
    grade: 8,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Wonder Woman explores the world', 'Batman maps Gotham']
  },
  {
    id: 'social-8-government',
    name: 'Government Systems',
    description: 'Understand different forms of government',
    grade: 8,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Iron Man meets world leaders', 'Spider-Man learns about laws']
  },
  {
    id: 'social-8-economics',
    name: 'Economic Systems',
    description: 'Learn about trade, resources, and economies',
    grade: 8,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Batman runs Wayne Enterprises', 'Wonder Woman trades in Themyscira']
  },
  {
    id: 'social-8-culture',
    name: 'Cultural Studies',
    description: 'Explore cultures and traditions',
    grade: 8,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Spider-Man celebrates with friends', 'Iron Man hosts parties']
  },
  {
    id: 'social-8-historical-analysis',
    name: 'Historical Analysis',
    description: 'Analyze historical events and their impact',
    grade: 8,
    subject: 'social_studies',
    difficulty: 'expert',
    examples: ['Batman studies Gotham history', 'Wonder Woman learns about ancient times']
  }
];

export const getTopicsByGradeAndSubject = (grade: number, subject: string): Topic[] => {
  return topics.filter(topic => topic.grade === grade && topic.subject === subject);
};

export const getTopicsByDifficulty = (difficulty: string): Topic[] => {
  return topics.filter(topic => topic.difficulty === difficulty);
};

export const getRandomTopic = (grade: number, subject: string): Topic => {
  const availableTopics = getTopicsByGradeAndSubject(grade, subject);
  return availableTopics[Math.floor(Math.random() * availableTopics.length)];
}; 