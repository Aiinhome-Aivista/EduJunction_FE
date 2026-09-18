import { RunbookKGraphNode } from '../types';

export const INITIAL_RUNBOOKS: RunbookKGraphNode[] = [
  // Class 10 CBSE - Mathematics (Quadratic Equations & Trigonometry)
  {
    id: 'rb-cbse-10-math-01',
    board: 'CBSE',
    classGrade: 'Class 10',
    subject: 'Mathematics',
    chapterName: 'Quadratic Equations & Discriminant Analysis',
    coreConcepts: [
      'Standard form: ax² + bx + c = 0 (a ≠ 0)',
      'Discriminant D = b² - 4ac determines nature of roots',
      'D > 0: two distinct real roots; D = 0: two equal real roots; D < 0: no real roots',
      'Quadratic formula: x = (-b ± √D) / (2a)',
      'Word problems relating to speed-time-distance and consecutive integers'
    ],
    keyFormulasOrRules: [
      'D = b² - 4ac',
      'Sum of roots (α + β) = -b/a',
      'Product of roots (αβ) = c/a',
      'Formula: x = [-b ± √(b² - 4ac)] / 2a'
    ],
    commonTraps: [
      'Forgetting that a ≠ 0 in standard quadratic definitions',
      'Sign error when substituting negative b values into -b ± √D',
      'Missing the positive/negative square root in geometric distance word problems'
    ],
    curatedReferenceUrls: [
      {
        title: 'NCERT Class 10 Mathematics Chapter 4 - Official Text',
        source: 'NCERT Official Portal',
        url: 'https://ncert.nic.in/textbook.php?jemh1=4-15',
        description: 'Complete NCERT chapter on Quadratic Equations with derivations and exemplar problems.',
        type: 'official_syllabus'
      },
      {
        title: 'Khan Academy - Quadratic Equations and Complex Solutions',
        source: 'Khan Academy India',
        url: 'https://www.khanacademy.org/math/in-in-grade-10-ncert/x573d8ce2f0be0095:quadratic-equations',
        description: 'Interactive mastery exercises and video lessons on discriminant and word problems.',
        type: 'video'
      },
      {
        title: 'CBSE Academic Sample Question Papers & Marking Scheme',
        source: 'CBSE Academic',
        url: 'https://cbseacademic.nic.in/sqp_classx_2024.html',
        description: 'Official CBSE marking scheme rubrics for high-scoring step methods.',
        type: 'practice'
      }
    ],
    sampleQuestionArchetypes: [
      'If the quadratic equation 2x² - kx + 3 = 0 has equal real roots, find the value of k.',
      'A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less.',
      'Determine the nature of the roots of 3x² - 4√3x + 4 = 0.'
    ],
    difficultyCalibration: {
      simple: 'Direct calculation of discriminant and identification of root nature.',
      medium: 'Finding unknown parameter k for specified root conditions or factoring fractions.',
      hard: 'Complex rational algebraic fractions reducible to quadratics and non-linear speed-time modeling.'
    },
    lastUpdated: '2026-08-15'
  },

  // Class 12 NEET - Physics (Optics & Ray Diagram Wave Fronts)
  {
    id: 'rb-neet-12-phys-01',
    board: 'NEET',
    classGrade: 'Class 12',
    subject: 'Physics',
    chapterName: 'Ray Optics and Optical Instruments',
    coreConcepts: [
      'Snell’s Law: n₁ sin(θ₁) = n₂ sin(θ₂)',
      'Total Internal Reflection: critical angle sin(ic) = n₂ / n₁ (n₁ > n₂)',
      'Lens Maker Formula: 1/f = (μ - 1)[(1/R₁) - (1/R₂)]',
      'Compound Microscope & Astronomical Telescope magnifying power calculations',
      'Prism deviation formula: μ = sin((A + δm)/2) / sin(A/2)'
    ],
    keyFormulasOrRules: [
      '1/v - 1/u = 1/f (Lens equation with Cartesian sign convention)',
      'Power P = 1/f (in meters) = P₁ + P₂',
      'TIR Condition: Light travels from denser to rarer medium with angle of incidence > critical angle'
    ],
    commonTraps: [
      'Mixing sign convention rules between convex lens (positive f) and concave lens (negative f)',
      'Assuming minimum deviation occurs at any incidence angle instead of i = e',
      'Forgetting that refractive index depends inversely on wavelength (Cauchy’s dispersion)'
    ],
    curatedReferenceUrls: [
      {
        title: 'NTA NEET UG Official Physics Syllabus & Question Bank',
        source: 'National Testing Agency (NTA)',
        url: 'https://neet.nta.nic.in/syllabus/',
        description: 'Official NTA benchmark concepts for Ray and Wave Optics.',
        type: 'official_syllabus'
      },
      {
        title: 'Physics Classroom - Refraction, Lenses and Total Internal Reflection',
        source: 'The Physics Classroom',
        url: 'https://www.physicsclassroom.com/class/refrn',
        description: 'Visual interactive ray simulations and lens power diagnostics.',
        type: 'practice'
      },
      {
        title: 'NCERT Class 12 Physics Part II - Ray Optics Chapter 9',
        source: 'NCERT Online',
        url: 'https://ncert.nic.in/textbook.php?leph2=1-6',
        description: 'Exemplar numericals for combination of lenses and prism calculations.',
        type: 'article'
      }
    ],
    sampleQuestionArchetypes: [
      'Calculate the focal length of a biconvex lens of glass (μ = 1.5) having radii of curvature 20 cm and 30 cm.',
      'A ray of light traveling in water is incident on a glass plate. Find the critical angle if refractive indices are 4/3 and 3/2.',
      'An astronomical telescope has an objective of focal length 100 cm and eyepiece of 5 cm. Find magnifying power in normal adjustment.'
    ],
    difficultyCalibration: {
      simple: 'Standard focal length from power and single lens formula substitutions.',
      medium: 'Combination of thin lenses in contact and critical angle with varying media.',
      hard: 'Silvered lens system equivalent focal length and chromatic aberration multi-medium prisms.'
    },
    lastUpdated: '2026-08-20'
  },

  // Class 11 & 12 IIT JEE - Chemistry (Chemical Kinetics & Thermodynamics)
  {
    id: 'rb-iit-12-chem-01',
    board: 'IIT',
    classGrade: 'Class 12',
    subject: 'Chemistry',
    chapterName: 'Chemical Kinetics & Arrhenius Reaction Mechanisms',
    coreConcepts: [
      'Rate law, Order of reaction (differential & integrated rate laws for 0th, 1st, 2nd order)',
      'Half-life period t₁/₂ = 0.693 / k for first order reactions (independent of initial concentration)',
      'Arrhenius equation: k = A e^(-Ea / RT), ln(k₂/k₁) = (Ea / R) * [1/T₁ - 1/T₂]',
      'Collision Theory, steric factor, and activation energy barriers',
      'Steady-state approximation in multi-step reaction kinetics'
    ],
    keyFormulasOrRules: [
      'Zero order: [A] = [A]₀ - kt; t₁/₂ = [A]₀ / 2k',
      'First order: k = (2.303 / t) log([A]₀ / [A]); t₁/₂ = ln(2)/k',
      'Arrhenius: log(k) = log(A) - Ea / (2.303 RT)'
    ],
    commonTraps: [
      'Confusing molecularity (theoretical integer) with order of reaction (experimental, can be fractional or zero)',
      'Forgetting gas constant units (R = 8.314 J/mol·K vs 1.987 cal/mol·K) when computing Ea',
      'Overlooking stoichiometric coefficients when expressing rate of disappearance vs formation'
    ],
    curatedReferenceUrls: [
      {
        title: 'JEE Advanced Official Portal - Chemistry Archives & Syllabi',
        source: 'IIT JEE Apex Board',
        url: 'https://jeeadv.ac.in/syllabus.html',
        description: 'Official JEE Advanced syllabus and previous years diagnostic papers.',
        type: 'official_syllabus'
      },
      {
        title: 'LibreTexts Chemistry - Chemical Kinetics Integration & Rate Laws',
        source: 'Chemistry LibreTexts',
        url: 'https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry)/Kinetics',
        description: 'Comprehensive mathematical derivations of multi-step mechanism rate laws.',
        type: 'article'
      }
    ],
    sampleQuestionArchetypes: [
      'A first-order reaction is 50% completed in 20 minutes. Calculate the time required for 99.9% completion.',
      'The rate of a reaction triples when the temperature changes from 293 K to 313 K. Calculate the activation energy Ea.',
      'For 2A + B -> C, doubling [A] quadruples rate, doubling [B] has no effect. Find overall order.'
    ],
    difficultyCalibration: {
      simple: 'Calculating half life and standard first order rate constant from table data.',
      medium: 'Arrhenius activation energy temperature variance and pseudo first-order kinetics.',
      hard: 'Complex parallel and consecutive first-order reactions with steady-state kinetics.'
    },
    lastUpdated: '2026-08-22'
  },

  // Class 8 NCERT - Science (Force, Pressure & Cell Structure)
  {
    id: 'rb-ncert-8-sci-01',
    board: 'NCERT',
    classGrade: 'Class 8',
    subject: 'Science',
    chapterName: 'Force, Friction and Pressure Dynamics',
    coreConcepts: [
      'Force as a push or pull; contact vs non-contact forces (gravitational, electrostatic, magnetic)',
      'Pressure = Force / Area (measured in Pascals N/m²)',
      'Liquid pressure increases with depth and acts equally in all directions',
      'Atmospheric pressure and the Magdeburg hemisphere demonstration',
      'Friction as a necessary evil: static, sliding, and rolling friction'
    ],
    keyFormulasOrRules: [
      'P = F / A',
      'Liquid Pressure P = h · ρ · g',
      'Rolling friction < Sliding friction < Static friction'
    ],
    commonTraps: [
      'Confusing mass (scalar kg) with weight/force (vector Newton)',
      'Thinking smaller surface area creates smaller pressure (it creates higher pressure!)',
      'Assuming friction depends directly on the surface area of contact'
    ],
    curatedReferenceUrls: [
      {
        title: 'NCERT Class 8 Science Chapter 11 - Force and Pressure',
        source: 'NCERT Official',
        url: 'https://ncert.nic.in/textbook.php?hesc1=11-18',
        description: 'Official NCERT digital lesson with conceptual experiments.',
        type: 'official_syllabus'
      },
      {
        title: 'Khan Academy Middle School - Forces, Motion and Pressure',
        source: 'Khan Academy',
        url: 'https://www.khanacademy.org/science/in-in-class-8-science-cbse',
        description: 'Interactive simulations exploring fluid pressure and friction.',
        type: 'video'
      }
    ],
    sampleQuestionArchetypes: [
      'A force of 100 N is applied over an area of 2 m². Calculate the pressure produced.',
      'Why do camels walk easily in desert sand compared to horses with narrow hooves?',
      'Why are ball bearings used between the hub and axle of bicycle wheels?'
    ],
    difficultyCalibration: {
      simple: 'Direct definition of contact forces and basic P = F/A computation.',
      medium: 'Comparative reasoning between static/sliding friction and manometer fluid height calculations.',
      hard: 'Multi-step hydraulic jack force-area equilibrium and atmospheric barometric differential.'
    },
    lastUpdated: '2026-08-10'
  },

  // Class 9 ICSE - Mathematics & Commercial Arithmetic
  {
    id: 'rb-icse-9-math-01',
    board: 'ICSE',
    classGrade: 'Class 9',
    subject: 'Mathematics',
    chapterName: 'Compound Interest (Without Formula & With Formula) & Expansions',
    coreConcepts: [
      'Compound Interest computed yearly, half-yearly, and quarterly',
      'Difference between Simple Interest (SI) and Compound Interest (CI) over multiple periods',
      'Algebraic identities: (a ± b)³, (a + b + c)², (a³ ± b³)',
      'Depreciation and population growth models using A = P(1 - r/100)ⁿ'
    ],
    keyFormulasOrRules: [
      'A = P(1 + r/100)ⁿ',
      'CI = A - P = P[(1 + r/100)ⁿ - 1]',
      'For half-yearly compounding: r becomes r/2 and n becomes 2n'
    ],
    commonTraps: [
      'Forgetting to double the periods (2n) when rate is halved (r/2) for semi-annual compounding',
      'Subtracting principal P from final Amount A to get CI',
      'Sign mistakes in expansion of (a - b - c)²'
    ],
    curatedReferenceUrls: [
      {
        title: 'CISCE ICSE Class 9 Mathematics Regulations & Syllabi',
        source: 'CISCE Official',
        url: 'https://cisce.org/regulations-and-syllabuses-icse-class-ix/',
        description: 'Official ICSE curriculum guidelines and problem taxonomy.',
        type: 'official_syllabus'
      },
      {
        title: 'Khan Academy - Compound Interest and Financial Mathematics',
        source: 'Khan Academy',
        url: 'https://www.khanacademy.org/math/in-in-grade-9-ncert',
        description: 'Guided practice on compound interest and algebraic expansions.',
        type: 'practice'
      }
    ],
    sampleQuestionArchetypes: [
      'Calculate the compound interest on ₹12,000 for 2 years at 10% per annum compounded half-yearly.',
      'The difference between CI and SI on a certain sum of money for 2 years at 5% per annum is ₹25. Find the sum.',
      'If x + 1/x = 4, find the value of x³ + 1/x³.'
    ],
    difficultyCalibration: {
      simple: 'Yearly compounding interest calculation on round principal amounts.',
      medium: 'Semi-annual compounding with fraction rate or calculating principal from CI-SI difference.',
      hard: 'Multi-rate successive years compounding with depreciation salvage value.'
    },
    lastUpdated: '2026-08-18'
  },

  // Class 10 UK-Cambridge (IGCSE) - Biology / Science
  {
    id: 'rb-cambridge-10-bio-01',
    board: 'UK-Cambridge',
    classGrade: 'Class 10',
    subject: 'Biology',
    chapterName: 'Inheritance, Monohybrid Crosses & DNA Expression',
    coreConcepts: [
      'Chromosomes, genes, and alleles (dominant vs recessive, homozygous vs heterozygous)',
      'Monohybrid inheritance and Punnett square phenotypic ratios (3:1, 1:2:1)',
      'Codominance and ABO blood group alleles (Iᴬ, Iᴮ, Iᵒ)',
      'Sex determination (XX vs XY chromosomes) and sex-linked traits (color blindness, hemophilia)',
      'Protein synthesis: transcription of mRNA codon triplets to amino acid translation'
    ],
    keyFormulasOrRules: [
      'Phenotypic ratio in heterozygous monohybrid cross (Aa x Aa) = 3 Dominant : 1 Recessive',
      'Genotypic ratio = 1 AA : 2 Aa : 1 aa',
      'Codominant blood groups: IᴬIᴮ results in AB blood group'
    ],
    commonTraps: [
      'Confusing genotype (genetic makeup) with phenotype (observable trait)',
      'Misinterpreting probability per child as cumulative across family size',
      'Forgetting that males (XY) cannot be carriers for X-linked recessive traits'
    ],
    curatedReferenceUrls: [
      {
        title: 'Cambridge IGCSE Biology (0610) Learner Guide & Specimen Papers',
        source: 'Cambridge International Assessment (CIE)',
        url: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-biology-0610/',
        description: 'Official Cambridge IGCSE syllabus, command words, and specimen rubrics.',
        type: 'official_syllabus'
      },
      {
        title: 'Save My Exams - Cambridge IGCSE Inheritance & Genetics Notes',
        source: 'Save My Exams UK',
        url: 'https://www.savemyexams.com/igcse/biology/cie/23/revision-notes/17-inheritance/',
        description: 'Diagrammatic Punnett square workflows and examiner tips.',
        type: 'article'
      }
    ],
    sampleQuestionArchetypes: [
      'Draw a Punnett square to show the offspring genotypes when a heterozygous brown-eyed parent (Bb) crosses with a blue-eyed parent (bb).',
      'A man of blood group A and a woman of blood group B have a child with blood group O. State the parents genotypes.',
      'Explain why color blindness is significantly more prevalent in human males than females.'
    ],
    difficultyCalibration: {
      simple: 'Identifying dominant/recessive definitions and single Punnett square ratios.',
      medium: 'Blood group inheritance probabilities and pedigree chart decoding.',
      hard: 'Sex-linked multi-generation pedigree analysis and mutation frequency analysis.'
    },
    lastUpdated: '2026-08-21'
  },

  // Class 6 CBSE/NCERT - Mathematics & Integers
  {
    id: 'rb-cbse-6-math-01',
    board: 'CBSE',
    classGrade: 'Class 6',
    subject: 'Mathematics',
    chapterName: 'Integers, Number Line & Basic Fractions',
    coreConcepts: [
      'Representation of positive and negative integers on a number line',
      'Ordering and absolute values of integers',
      'Rules of integer addition and subtraction: negative + negative = negative, opposite signs subtract',
      'Proper, improper, and mixed fractions; equivalent fractions and simplification'
    ],
    keyFormulasOrRules: [
      '(-a) + (-b) = -(a + b)',
      'a - (-b) = a + b',
      'Multiplication rule: (-) × (-) = (+), (-) × (+) = (-)'
    ],
    commonTraps: [
      'Thinking -10 is greater than -2 because 10 is greater than 2',
      'Forgetting that subtraction of a negative number turns into addition',
      'Adding denominators directly when adding unlike fractions'
    ],
    curatedReferenceUrls: [
      {
        title: 'NCERT Class 6 Mathematics Chapter 6 - Integers',
        source: 'NCERT Textbooks',
        url: 'https://ncert.nic.in/textbook.php?femh1=6-14',
        description: 'Foundational concepts on integers with visual number line models.',
        type: 'official_syllabus'
      },
      {
        title: 'Khan Academy Class 6 - Negative Numbers & Fractions',
        source: 'Khan Academy India',
        url: 'https://www.khanacademy.org/math/in-in-grade-6-ncert',
        description: 'Interactive step-by-step game modules for integers and fractions.',
        type: 'practice'
      }
    ],
    sampleQuestionArchetypes: [
      'Evaluate: (-15) + (-20) - (-35).',
      'Represent -4 and +3 on a number line and find the distance between them.',
      'Which is greater: -12 or -7?'
    ],
    difficultyCalibration: {
      simple: 'Simple number line placement and comparing single digit integers.',
      medium: 'Two-step integer addition/subtraction with brackets.',
      hard: 'Real-world temperature elevation word problems and fraction conversions.'
    },
    lastUpdated: '2026-08-12'
  },

  // Class 11 ISC - Computer Science (Data Structures & Boolean Logic)
  {
    id: 'rb-isc-11-cs-01',
    board: 'ISC',
    classGrade: 'Class 11',
    subject: 'Computer Science',
    chapterName: 'Boolean Algebra, Logic Gates & Truth Tables',
    coreConcepts: [
      'Boolean operators: AND (·), OR (+), NOT (¯)',
      'Basic postulates: Identity, Null, Idempotent, Involution, Complementarity laws',
      'De Morgan’s Laws: (A + B)¯ = A¯ · B¯ and (A · B)¯ = A¯ + B¯',
      'Canonical forms: Sum of Products (SOP / Minterms) & Product of Sums (POS / Maxterms)',
      'Karnaugh Maps (K-Maps) 2-variable and 3-variable simplification'
    ],
    keyFormulasOrRules: [
      'De Morgan: (X + Y)\' = X\' · Y\'',
      'Absorption Law: A + AB = A; A(A + B) = A',
      'Consensus Theorem: AB + A\'C + BC = AB + A\'C'
    ],
    commonTraps: [
      'Mixing up minterm designations (m) with maxterm designations (M)',
      'Incorrect Gray code ordering (00, 01, 11, 10) in K-Map row/column headers',
      'Forgetting that 1 + A = 1 in Boolean algebra (unlike standard arithmetic)'
    ],
    curatedReferenceUrls: [
      {
        title: 'CISCE ISC Class 11 Computer Science Syllabus',
        source: 'CISCE Official',
        url: 'https://cisce.org/regulations-and-syllabuses-isc-class-xi/',
        description: 'Official CISCE syllabus for Boolean algebra and Java programming.',
        type: 'official_syllabus'
      },
      {
        title: 'GeeksforGeeks - Boolean Algebra & De Morgan Laws in Digital Logic',
        source: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/boolean-algebra/',
        description: 'Comprehensive tutorials on truth tables, logic gates and K-Map grouping.',
        type: 'article'
      }
    ],
    sampleQuestionArchetypes: [
      'Simplify using Boolean laws: F = A\'B\'C + A\'BC + AB\'C + ABC.',
      'State and verify De Morgan’s Second Law using a truth table for two variables.',
      'Write the dual of the Boolean expression: (A + B\') · (A\' + C) = AC + A\'B\'.'
    ],
    difficultyCalibration: {
      simple: 'Evaluating truth tables for standard logic gates and writing simple Boolean duals.',
      medium: 'Applying De Morgan laws to simplify 3-variable expressions.',
      hard: 'K-Map minimization with don’t care conditions and multi-gate circuit synthesis.'
    },
    lastUpdated: '2026-08-25'
  }
];
