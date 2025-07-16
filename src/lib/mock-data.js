// Remove TypeScript interface, use JSDoc for type hinting

/**
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} login
 * @property {number} level
 * @property {number} correctionPoints
 * @property {number} wallet
 * @property {string} avatar
 * @property {string} campus
 * @property {number} campusId
 * @property {number} entryYear
 */

export const campuses = [
  { id: 21, name: "Benguerir" },
  { id: 33, name: "Rabat" },
  { id: 49, name: "Tétouan" },
  { id: 53, name: "Khouribga" }
];

export const entryYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Generate realistic 1337 student data
const generateStudents = () => {
  const firstNames = [
    'ael-khou', 'aabounak', 'aanghass', 'abenaiss', 'aben-dhi', 'aboulhol', 'abouyous', 'abouda',
    'aelguind', 'afoulqui', 'akharraz', 'alaassir', 'alhadjel', 'amaalouf', 'amaaroufi', 'amalki',
    'anajjar', 'aqarmoum', 'asbaai', 'atassi', 'ayoussfi', 'azegrour', 'belangue', 'bfatmi',
    'brahim', 'celalame', 'chelali', 'dhakama', 'efaiz', 'elasri', 'elbouhad', 'elguezaz',
    'elharrak', 'elkourty', 'elmoutaw', 'eloutifa', 'fakour', 'fbenyahm', 'hait-tam', 'hhirchi',
    'hkeddour', 'hmandour', 'ibenkhay', 'kait-idr', 'karrach', 'khabachi', 'khalil', 'kmaalouf',
    'laasri', 'lbenali', 'mbouzid', 'melyazid', 'mkazmi', 'mlaayoun', 'mmounaji', 'mouatass'
  ];

  return Array.from({ length: 400 }, (_, index) => {
    const login = firstNames[Math.floor(Math.random() * firstNames.length)];
    const level = Math.round((Math.random() * 21 + Math.random() * 5) * 10) / 10;
    const correctionPoints = Math.floor(Math.random() * 50) + Math.floor(Math.random() * 30);
    const wallet = Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 500);
    const campus = campuses[Math.floor(Math.random() * campuses.length)];
    const entryYear = entryYears[Math.floor(Math.random() * entryYears.length)];
    
    return {
      id: index + 1,
      login: `${login}${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`,
      level,
      correctionPoints,
      wallet,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${login}${index}`,
      campus: campus.name,
      campusId: campus.id,
      entryYear
    };
  }).sort((a, b) => b.level - a.level || b.correctionPoints - b.correctionPoints);
};

export const mockStudents = generateStudents();