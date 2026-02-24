/**
 * Names Module - Alive Life Simulator
 * Country-aware name generation for player and NPCs
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  function pickRandom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function normalizeGender(gender) {
    return gender === "F" ? "F" : "M";
  }

  const REGION = {
    CIS: "cis",
    EUROPE_WEST: "europe_west",
    EUROPE_EAST: "europe_east",
    NORTH_AMERICA: "north_america",
    LATIN_AMERICA: "latin_america",
    EAST_ASIA: "east_asia",
    SOUTH_ASIA: "south_asia",
    MIDDLE_EAST: "middle_east",
    AFRICA: "africa",
    GENERIC: "generic"
  };

  const countryToRegion = {
    // CIS (Kazakhstan, Russia, Ukraine, Belarus, etc.)
    kz: REGION.CIS,
    ru: REGION.CIS,
    ua: REGION.CIS,
    by: REGION.CIS,
    uz: REGION.CIS,
    kg: REGION.CIS,

    // Western Europe
    gb: REGION.EUROPE_WEST,
    uk: REGION.EUROPE_WEST,
    fr: REGION.EUROPE_WEST,
    de: REGION.EUROPE_WEST,
    it: REGION.EUROPE_WEST,
    es: REGION.EUROPE_WEST,
    pt: REGION.EUROPE_WEST,
    nl: REGION.EUROPE_WEST,
    be: REGION.EUROPE_WEST,
    ch: REGION.EUROPE_WEST,
    at: REGION.EUROPE_WEST,
    se: REGION.EUROPE_WEST,
    no: REGION.EUROPE_WEST,
    dk: REGION.EUROPE_WEST,
    fi: REGION.EUROPE_WEST,
    ie: REGION.EUROPE_WEST,

    // Eastern Europe
    pl: REGION.EUROPE_EAST,
    cz: REGION.EUROPE_EAST,
    hu: REGION.EUROPE_EAST,
    ro: REGION.EUROPE_EAST,
    bg: REGION.EUROPE_EAST,
    rs: REGION.EUROPE_EAST,
    hr: REGION.EUROPE_EAST,
    sk: REGION.EUROPE_EAST,

    // North America
    us: REGION.NORTH_AMERICA,
    ca: REGION.NORTH_AMERICA,

    // Latin America
    mx: REGION.LATIN_AMERICA,
    br: REGION.LATIN_AMERICA,
    ar: REGION.LATIN_AMERICA,
    co: REGION.LATIN_AMERICA,
    cl: REGION.LATIN_AMERICA,
    pe: REGION.LATIN_AMERICA,
    ve: REGION.LATIN_AMERICA,

    // East Asia
    cn: REGION.EAST_ASIA,
    jp: REGION.EAST_ASIA,
    kr: REGION.EAST_ASIA,
    tw: REGION.EAST_ASIA,
    hk: REGION.EAST_ASIA,
    sg: REGION.EAST_ASIA,

    // South Asia
    in: REGION.SOUTH_ASIA,
    pk: REGION.SOUTH_ASIA,
    bd: REGION.SOUTH_ASIA,
    lk: REGION.SOUTH_ASIA,
    np: REGION.SOUTH_ASIA,

    // Middle East
    ae: REGION.MIDDLE_EAST,
    sa: REGION.MIDDLE_EAST,
    qa: REGION.MIDDLE_EAST,
    kw: REGION.MIDDLE_EAST,
    bh: REGION.MIDDLE_EAST,
    om: REGION.MIDDLE_EAST,
    ir: REGION.MIDDLE_EAST,
    iq: REGION.MIDDLE_EAST,
    jo: REGION.MIDDLE_EAST,
    lb: REGION.MIDDLE_EAST,
    tr: REGION.MIDDLE_EAST,
    il: REGION.MIDDLE_EAST,
    eg: REGION.MIDDLE_EAST,

    // Africa
    za: REGION.AFRICA,
    ng: REGION.AFRICA,
    ke: REGION.AFRICA,
    gh: REGION.AFRICA,
    et: REGION.AFRICA,
    tz: REGION.AFRICA,
    ma: REGION.AFRICA,
    dz: REGION.AFRICA
  };

  const pools = {
    [REGION.CIS]: {
      maleNames: [
        "Ivan", "Dmitry", "Alexei", "Sergey", "Artem", "Maksim", "Kirill", "Nikolai", "Andrey", "Ilya",
        "Vladimir", "Pavel", "Roman", "Mikhail", "Oleg", "Viktor", "Yuri", "Boris", "Timur", "Ruslan",
        "Danil", "Egor", "Nikita", "Denis", "Anton", "Stanislav", "Evgeny", "Konstantin", "Grigory", "Fyodor",
        "Aibek", "Nurlan", "Askar", "Bekzat", "Daulet", "Erbol", "Zhanibek", "Kairat", "Marat", "Serik"
      ],
      femaleNames: [
        "Anna", "Olga", "Maria", "Elena", "Ekaterina", "Natalia", "Svetlana", "Irina", "Yulia", "Alina",
        "Tatiana", "Daria", "Anastasia", "Ksenia", "Polina", "Vera", "Valentina", "Lyudmila", "Galina", "Nina",
        "Sofia", "Victoria", "Alexandra", "Elizaveta", "Veronika", "Kristina", "Marina", "Larisa", "Yana", "Kira",
        "Aigerim", "Dinara", "Gulnara", "Madina", "Saule", "Zhanna", "Asel", "Kamila", "Leila", "Zarina"
      ],
      surnames: [
        "Ivanov", "Smirnov", "Kuznetsov", "Popov", "Sokolov", "Petrov", "Volkov", "Morozov", "Novikov", "Fedorov",
        "Kozlov", "Lebedev", "Orlov", "Nikolaev", "Andreev", "Pavlov", "Egorov", "Vasiliev", "Zakharov", "Mikhailov",
        "Nazarbayev", "Tokayev", "Satpayev", "Auezov", "Kunayev", "Abai", "Suleimenov", "Mukanov", "Zhunusov", "Omarov"
      ]
    },

    [REGION.EUROPE_WEST]: {
      maleNames: [
        "James", "William", "Oliver", "George", "Harry", "Thomas", "Charles", "Edward", "Henry", "Jack",
        "Louis", "Pierre", "Jean", "François", "Antoine", "Nicolas", "Philippe", "Julien", "Mathieu", "Luc",
        "Hans", "Klaus", "Wolfgang", "Stefan", "Markus", "Andreas", "Thomas", "Michael", "Christian", "Peter",
        "Marco", "Luca", "Alessandro", "Francesco", "Giuseppe", "Antonio", "Giovanni", "Roberto", "Andrea", "Matteo",
        "Erik", "Lars", "Sven", "Magnus", "Olaf", "Henrik", "Johan", "Anders", "Nils", "Bjorn"
      ],
      femaleNames: [
        "Emma", "Olivia", "Charlotte", "Amelia", "Sophia", "Isabella", "Mia", "Emily", "Grace", "Lily",
        "Marie", "Camille", "Léa", "Manon", "Chloé", "Inès", "Jade", "Louise", "Alice", "Juliette",
        "Anna", "Lena", "Sophie", "Julia", "Laura", "Sarah", "Lisa", "Hannah", "Leonie", "Marie",
        "Giulia", "Sofia", "Aurora", "Ginevra", "Beatrice", "Chiara", "Francesca", "Valentina", "Alessia", "Martina",
        "Astrid", "Ingrid", "Freya", "Sigrid", "Elsa", "Greta", "Maja", "Linnea", "Saga", "Ebba"
      ],
      surnames: [
        "Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson", "Evans", "Thomas", "Johnson",
        "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
        "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
        "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
        "Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson"
      ]
    },

    [REGION.EUROPE_EAST]: {
      maleNames: [
        "Jan", "Piotr", "Krzysztof", "Andrzej", "Tomasz", "Paweł", "Michał", "Marcin", "Marek", "Adam",
        "Jakub", "Petr", "Martin", "Tomáš", "Jan", "Lukáš", "Ondřej", "David", "Filip", "Vojtěch",
        "László", "István", "Gábor", "Zoltán", "Ferenc", "Péter", "Tamás", "Attila", "Balázs", "András",
        "Ion", "Andrei", "Alexandru", "Mihai", "Stefan", "Cristian", "Daniel", "Adrian", "Florin", "Marius"
      ],
      femaleNames: [
        "Anna", "Maria", "Katarzyna", "Agnieszka", "Barbara", "Ewa", "Magdalena", "Joanna", "Monika", "Dorota",
        "Tereza", "Lucie", "Kateřina", "Petra", "Jana", "Markéta", "Veronika", "Michaela", "Barbora", "Adéla",
        "Anna", "Katalin", "Erzsébet", "Mária", "Zsuzsanna", "Éva", "Ilona", "Judit", "Krisztina", "Gabriella",
        "Maria", "Elena", "Ana", "Ioana", "Andreea", "Cristina", "Mihaela", "Alexandra", "Gabriela", "Diana"
      ],
      surnames: [
        "Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kowalczyk", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak",
        "Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák", "Němec",
        "Nagy", "Kovács", "Tóth", "Szabó", "Horváth", "Varga", "Kiss", "Molnár", "Németh", "Farkas",
        "Popa", "Popescu", "Ionescu", "Dumitru", "Stan", "Stoica", "Gheorghe", "Rusu", "Munteanu", "Matei"
      ]
    },

    [REGION.NORTH_AMERICA]: {
      maleNames: [
        "Michael", "James", "David", "Daniel", "Ryan", "Andrew", "Ethan", "Noah", "Lucas", "Jacob",
        "William", "Benjamin", "Alexander", "Matthew", "Christopher", "Joshua", "Nathan", "Tyler", "Brandon", "Justin",
        "Liam", "Mason", "Logan", "Jackson", "Aiden", "Oliver", "Elijah", "Sebastian", "Henry", "Owen",
        "Dylan", "Connor", "Caleb", "Hunter", "Austin", "Jordan", "Cameron", "Evan", "Gavin", "Chase"
      ],
      femaleNames: [
        "Emily", "Olivia", "Sophia", "Ava", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Ella",
        "Emma", "Abigail", "Madison", "Elizabeth", "Chloe", "Grace", "Victoria", "Scarlett", "Zoey", "Lily",
        "Hannah", "Addison", "Natalie", "Leah", "Savannah", "Brooklyn", "Samantha", "Audrey", "Claire", "Bella",
        "Aria", "Riley", "Layla", "Zoe", "Penelope", "Nora", "Stella", "Hazel", "Aurora", "Luna"
      ],
      surnames: [
        "Smith", "Johnson", "Brown", "Williams", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor",
        "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson",
        "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "King", "Wright",
        "Scott", "Green", "Baker", "Adams", "Nelson", "Hill", "Campbell", "Mitchell", "Roberts", "Carter"
      ]
    },

    [REGION.LATIN_AMERICA]: {
      maleNames: [
        "Carlos", "Diego", "Mateo", "Juan", "Pedro", "Santiago", "Miguel", "Rafael", "Luis", "Gabriel",
        "José", "Antonio", "Fernando", "Ricardo", "Alejandro", "Eduardo", "Francisco", "Javier", "Andrés", "Pablo",
        "Sebastián", "Nicolás", "Daniel", "David", "Emiliano", "Leonardo", "Martín", "Tomás", "Lucas", "Joaquín",
        "Bruno", "Thiago", "Enzo", "Valentín", "Maximiliano", "Agustín", "Felipe", "Rodrigo", "Ignacio", "Manuel"
      ],
      femaleNames: [
        "Camila", "Sofia", "Valentina", "Isabella", "Lucia", "Maria", "Gabriela", "Daniela", "Ana", "Elena",
        "Mariana", "Paula", "Andrea", "Carolina", "Fernanda", "Natalia", "Victoria", "Alejandra", "Catalina", "Juliana",
        "Emma", "Mia", "Sara", "Laura", "Martina", "Antonella", "Emilia", "Renata", "Florencia", "Agustina",
        "Valeria", "Regina", "Ximena", "Jimena", "Abril", "Bianca", "Carla", "Diana", "Paola", "Adriana"
      ],
      surnames: [
        "Silva", "Santos", "Oliveira", "Costa", "Ferreira", "Almeida", "Pereira", "Rodrigues", "Lima", "Carvalho",
        "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez", "Sánchez", "Ramírez", "Torres",
        "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales", "Jiménez", "Ruiz", "Álvarez", "Romero",
        "Mendoza", "Vargas", "Castro", "Ortiz", "Ramos", "Guerrero", "Medina", "Aguilar", "Herrera", "Cruz"
      ]
    },

    [REGION.EAST_ASIA]: {
      maleNames: [
        "Hiro", "Kenji", "Takumi", "Haruto", "Ren", "Yuto", "Sota", "Kaito", "Riku", "Hayato",
        "Wei", "Jun", "Tao", "Hao", "Ming", "Chen", "Yang", "Lei", "Feng", "Long",
        "Min-jun", "Seo-jun", "Ji-ho", "Jun-seo", "Ye-jun", "Do-yun", "Si-woo", "Joon", "Hyun", "Sung",
        "Hiroshi", "Takeshi", "Akira", "Yuki", "Daiki", "Shota", "Kenta", "Ryota", "Naoki", "Tatsuya"
      ],
      femaleNames: [
        "Yuna", "Aiko", "Sakura", "Hana", "Mei", "Lin", "Xiu", "Ying", "Mina", "Aya",
        "Yui", "Hina", "Riko", "Mio", "Saki", "Rin", "Nanami", "Koharu", "Yuki", "Akari",
        "Xiao", "Yan", "Jing", "Hui", "Fang", "Ling", "Qian", "Yue", "Zhen", "Hong",
        "Ji-yeon", "Seo-yeon", "Min-ji", "Soo-jin", "Hye-jin", "Yeon", "Eun", "Ha-na", "Bo-ra", "Da-hye"
      ],
      surnames: [
        "Sato", "Tanaka", "Suzuki", "Watanabe", "Takahashi", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato",
        "Li", "Wang", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou",
        "Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim",
        "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamazaki"
      ]
    },

    [REGION.SOUTH_ASIA]: {
      maleNames: [
        "Arjun", "Aditya", "Rohan", "Rahul", "Vikram", "Amit", "Raj", "Sanjay", "Deepak", "Suresh",
        "Aarav", "Vihaan", "Vivaan", "Ananya", "Ishaan", "Reyansh", "Ayaan", "Krishna", "Shiv", "Aryan",
        "Mohammed", "Ali", "Hassan", "Ahmed", "Omar", "Imran", "Tariq", "Farhan", "Bilal", "Zain",
        "Pradeep", "Ramesh", "Sunil", "Anil", "Vijay", "Ravi", "Ashok", "Manoj", "Rajesh", "Srinivas"
      ],
      femaleNames: [
        "Priya", "Ananya", "Aisha", "Fatima", "Neha", "Pooja", "Shreya", "Divya", "Kavya", "Meera",
        "Aadhya", "Saanvi", "Aanya", "Pari", "Diya", "Anvi", "Myra", "Sara", "Ira", "Navya",
        "Ayesha", "Zara", "Hina", "Sana", "Nadia", "Amina", "Mariam", "Layla", "Yasmin", "Noor",
        "Lakshmi", "Radha", "Sita", "Gita", "Sunita", "Rekha", "Rani", "Padma", "Kamala", "Indira"
      ],
      surnames: [
        "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Mehta", "Joshi", "Rao",
        "Khan", "Ahmed", "Ali", "Hussain", "Sheikh", "Malik", "Syed", "Mirza", "Qureshi", "Ansari",
        "Reddy", "Nair", "Menon", "Pillai", "Iyer", "Iyengar", "Mukherjee", "Banerjee", "Chatterjee", "Das",
        "Agarwal", "Jain", "Kapoor", "Malhotra", "Khanna", "Chopra", "Bhatia", "Arora", "Sethi", "Kohli"
      ]
    },

    [REGION.MIDDLE_EAST]: {
      maleNames: [
        "Omar", "Ali", "Hassan", "Yusuf", "Khalid", "Saif", "Zayd", "Ibrahim", "Nasser", "Faisal",
        "Mohammed", "Ahmed", "Mahmoud", "Abdullah", "Mustafa", "Tariq", "Rashid", "Hamza", "Bilal", "Kareem",
        "Amir", "Rayan", "Adam", "Youssef", "Sami", "Karim", "Walid", "Hadi", "Ziad", "Nabil",
        "Mehmet", "Ahmet", "Mustafa", "Emre", "Burak", "Murat", "Cem", "Kemal", "Serkan", "Tolga"
      ],
      femaleNames: [
        "Amina", "Layla", "Noor", "Zahra", "Mariam", "Sara", "Huda", "Yasmin", "Fatima", "Rania",
        "Aisha", "Salma", "Dina", "Hana", "Lina", "Maya", "Nadia", "Rana", "Samira", "Zeinab",
        "Maryam", "Leila", "Noura", "Dalal", "Hessa", "Maha", "Reem", "Shaikha", "Latifa", "Mouza",
        "Elif", "Zeynep", "Defne", "Ecrin", "Yagmur", "Azra", "Nehir", "Asya", "Ela", "Mira"
      ],
      surnames: [
        "Al Farsi", "Al Mansouri", "Al Nahyan", "Al Rashid", "Al Maktoum", "Al Thani", "Al Sabah", "Al Khalifa", "Al Said", "Al Saud",
        "Haddad", "Nasser", "Saleh", "Khan", "Hamdan", "Farooq", "Mahmoud", "Hussein", "Abbas", "Bakr",
        "El-Amin", "El-Sayed", "Hassan", "Ibrahim", "Ismail", "Osman", "Rahman", "Sharif", "Youssef", "Zaki",
        "Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Yildiz", "Yildirim", "Ozturk", "Aydin", "Ozdemir"
      ]
    },

    [REGION.AFRICA]: {
      maleNames: [
        "Kwame", "Kofi", "Yaw", "Kwesi", "Kojo", "Kweku", "Akwasi", "Nana", "Osei", "Mensah",
        "Chidi", "Emeka", "Obinna", "Ikenna", "Nnamdi", "Uchenna", "Chibuzo", "Tochukwu", "Kelechi", "Ifeanyi",
        "Sipho", "Thabo", "Bongani", "Mandla", "Sibusiso", "Themba", "Mpho", "Tshepiso", "Kagiso", "Lesego",
        "Amara", "Jabari", "Zuberi", "Tendai", "Farai", "Tinashe", "Tafadzwa", "Tanaka", "Kudakwashe", "Tatenda"
      ],
      femaleNames: [
        "Ama", "Akua", "Abena", "Yaa", "Efua", "Adwoa", "Afia", "Akosua", "Adjoa", "Esi",
        "Adaeze", "Chidinma", "Ngozi", "Nneka", "Obiageli", "Adanna", "Chiamaka", "Ifeoma", "Uchenna", "Amaka",
        "Naledi", "Lerato", "Thandi", "Nomvula", "Lindiwe", "Zanele", "Nompumelelo", "Palesa", "Khanyi", "Ayanda",
        "Amara", "Zuri", "Imani", "Nia", "Sanaa", "Makena", "Wanjiku", "Akinyi", "Nyambura", "Njeri"
      ],
      surnames: [
        "Mensah", "Asante", "Osei", "Boateng", "Agyeman", "Owusu", "Appiah", "Amoah", "Adjei", "Frimpong",
        "Okonkwo", "Eze", "Nwosu", "Okoro", "Chukwu", "Ibe", "Obi", "Nwachukwu", "Onyeka", "Adeyemi",
        "Dlamini", "Nkosi", "Zulu", "Ndlovu", "Mthembu", "Khumalo", "Mokoena", "Molefe", "Mahlangu", "Sithole",
        "Kamau", "Mwangi", "Ochieng", "Otieno", "Wanjiru", "Njoroge", "Kimani", "Kariuki", "Mutua", "Maina"
      ]
    },

    [REGION.GENERIC]: {
      maleNames: [
        "Alex", "Max", "Leo", "John", "Mike", "Sam", "Tom", "Jake", "Ryan", "Chris",
        "Adam", "Ben", "Dan", "Eric", "Frank", "Gary", "Henry", "Ian", "Jack", "Kevin",
        "Luke", "Mark", "Nick", "Oscar", "Paul", "Quinn", "Rob", "Steve", "Tim", "Victor"
      ],
      femaleNames: [
        "Emma", "Mia", "Ava", "Lily", "Zoe", "Anna", "Sara", "Kate", "Ella", "Luna",
        "Amy", "Beth", "Claire", "Diana", "Eve", "Fiona", "Grace", "Holly", "Ivy", "Jane",
        "Kim", "Lisa", "Mary", "Nina", "Olive", "Pam", "Rose", "Sue", "Tina", "Uma"
      ],
      surnames: [
        "Stone", "Taylor", "Brown", "Fox", "Parker", "Walker", "King", "Reed", "Clark", "Young",
        "Adams", "Baker", "Cole", "Dean", "Ellis", "Ford", "Grant", "Hayes", "Irwin", "James",
        "Kane", "Lane", "Mason", "Nash", "Owen", "Price", "Quinn", "Ross", "Shaw", "Todd"
      ]
    }
  };

  function getRegionByCountryId(countryId) {
    const id = String(countryId || "").toLowerCase();
    return countryToRegion[id] || REGION.GENERIC;
  }

  function getPool(countryId) {
    const region = getRegionByCountryId(countryId);
    return pools[region] || pools[REGION.GENERIC];
  }

  function getFirstName(countryId, gender) {
    const g = normalizeGender(gender);
    const pool = getPool(countryId);
    const list = g === "F" ? pool.femaleNames : pool.maleNames;
    return pickRandom(list) || "Alex";
  }

  function getSurname(countryId) {
    const pool = getPool(countryId);
    return pickRandom(pool.surnames) || "Taylor";
  }

  function shouldUseSurname(countryId) {
    const region = getRegionByCountryId(countryId);
    if (region === REGION.EAST_ASIA) return Math.random() < 0.55;
    if (region === REGION.MIDDLE_EAST) return Math.random() < 0.65;
    return Math.random() < 0.75;
  }

  function getFullName(countryId, gender, options = {}) {
    const includeSurname = options.includeSurname !== undefined
      ? !!options.includeSurname
      : shouldUseSurname(countryId);

    const first = getFirstName(countryId, gender);
    if (!includeSurname) return first;

    const last = getSurname(countryId);
    return `${first} ${last}`.trim();
  }

  Alive.names = {
    REGION,
    getRegionByCountryId,
    getFirstName,
    getSurname,
    getFullName
  };
})(window);
