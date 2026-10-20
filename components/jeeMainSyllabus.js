// components/jeeMainSyllabus.js
// Source: user-uploaded syllabus-jee-main-2027.pdf
// The source PDF says its syllabus tables use the 2026 syllabus
// because a separate official 2027 syllabus was not yet released.

export const JEE_MAIN_SYLLABUS_UNITS = [
  // MATHEMATICS — 14 units
  {
    id: "math-01",
    subject: "Mathematics",
    unit: 1,
    title: "Sets, Relations and Functions",
    topics:
      "Sets and their representation, union, intersection and complement of sets and their algebraic properties, power set, relations, types of relations, equivalence relations, functions, one-one, into and onto functions, composition of functions",
  },
  {
    id: "math-02",
    subject: "Mathematics",
    unit: 2,
    title: "Complex Numbers and Quadratic Equations",
    topics:
      "Complex numbers as ordered pairs of reals, representation in a + ib form and in a plane, Argand diagram, algebra of complex numbers, modulus and argument, quadratic equations in real and complex number systems, relations between roots and coefficients, nature of roots, formation of equations with given roots",
  },
  {
    id: "math-03",
    subject: "Mathematics",
    unit: 3,
    title: "Matrices and Determinants",
    topics:
      "Matrices, algebra of matrices, types of matrices, determinants and matrices of order two and three, evaluation of determinants, area of triangles using determinants, adjoint and inverse of a square matrix, consistency of simultaneous linear equations, solutions of equations in two or three variables using matrices",
  },
  {
    id: "math-04",
    subject: "Mathematics",
    unit: 4,
    title: "Permutations and Combinations",
    topics:
      "Fundamental principle of counting, permutations and combinations, meaning of P(n, r) and C(n, r), simple applications",
  },
  {
    id: "math-05",
    subject: "Mathematics",
    unit: 5,
    title: "Binomial Theorem and Its Simple Applications",
    topics:
      "Binomial theorem for a positive integral index, general term, middle term, simple applications",
  },
  {
    id: "math-06",
    subject: "Mathematics",
    unit: 6,
    title: "Sequence and Series",
    topics:
      "Arithmetic progression, geometric progression, insertion of arithmetic mean and geometric mean between two numbers, relation between A.M. and G.M.",
  },
  {
    id: "math-07",
    subject: "Mathematics",
    unit: 7,
    title: "Limit, Continuity and Differentiability",
    topics:
      "Real-valued functions, algebra of functions, polynomial, rational, trigonometric, logarithmic and exponential functions, inverse functions, graphs of simple functions, limits, continuity and differentiability, differentiation of sum, difference, product and quotient, derivatives of trigonometric, inverse trigonometric, logarithmic, exponential, composite and implicit functions, derivatives up to order two, rate of change, increasing and decreasing functions, maxima and minima of functions of one variable",
  },
  {
    id: "math-08",
    subject: "Mathematics",
    unit: 8,
    title: "Integral Calculus",
    topics:
      "Integral as an anti-derivative, fundamental integrals involving algebraic, trigonometric, exponential and logarithmic functions, integration by substitution, parts and partial fractions, integration using trigonometric identities, fundamental theorem of calculus, properties of definite integrals, evaluation of definite integrals, areas bounded by simple curves in standard forms",
  },
  {
    id: "math-09",
    subject: "Mathematics",
    unit: 9,
    title: "Differential Equations",
    topics:
      "Ordinary differential equations, order and degree, solution by separation of variables, homogeneous and linear differential equations of the type dy/dx + P(x)y = Q(x)",
  },
  {
    id: "math-10",
    subject: "Mathematics",
    unit: 10,
    title: "Coordinate Geometry",
    topics:
      "Cartesian coordinates in a plane, distance formula, section formula, locus and its equation, slope of a line, parallel and perpendicular lines, intercepts, equations of a straight line, intersection of lines, angle between two lines, concurrence of three lines, distance of a point from a line, centroid, orthocentre and circumcentre of a triangle, circle equations, radius and centre, circle with endpoints of diameter given, line-circle intersections, conic sections, parabola, ellipse and hyperbola in standard forms",
  },
  {
    id: "math-11",
    subject: "Mathematics",
    unit: 11,
    title: "Three Dimensional Geometry",
    topics:
      "Coordinates of a point in space, distance between two points, section formula, direction ratios, direction cosines, angle between intersecting lines, equation of a line, skew lines, shortest distance between skew lines and its equation",
  },
  {
    id: "math-12",
    subject: "Mathematics",
    unit: 12,
    title: "Vector Algebra",
    topics:
      "Vectors and scalars, addition of vectors, components in two dimensions and three-dimensional space, scalar product, vector product",
  },
  {
    id: "math-13",
    subject: "Mathematics",
    unit: 13,
    title: "Statistics and Probability",
    topics:
      "Measures of dispersion, mean, median and mode of grouped and ungrouped data, standard deviation, variance and mean deviation, probability of an event, addition and multiplication theorems of probability, Bayes theorem, probability distribution of a random variable",
  },
  {
    id: "math-14",
    subject: "Mathematics",
    unit: 14,
    title: "Trigonometry",
    topics:
      "Trigonometrical identities, trigonometrical functions, inverse trigonometrical functions and their properties",
  },

  // PHYSICS — 19 units
  {
    id: "physics-01",
    subject: "Physics",
    unit: 1,
    title: "Units and Measurements",
    topics:
      "Units of measurement, system of units, SI units, fundamental and derived units, least count, significant figures, errors in measurements, dimensions of physical quantities, dimensional analysis and applications",
  },
  {
    id: "physics-02",
    subject: "Physics",
    unit: 2,
    title: "Kinematics",
    topics:
      "Frame of reference, motion in a straight line, speed and velocity, uniform and non-uniform motion, average speed, instantaneous velocity, uniformly accelerated motion, velocity-time and position-time graphs, equations of uniformly accelerated motion, relative velocity, motion in a plane, projectile motion, uniform circular motion",
  },
  {
    id: "physics-03",
    subject: "Physics",
    unit: 3,
    title: "Laws of Motion",
    topics:
      "Force and inertia, Newton's first law, momentum, Newton's second law, impulse, Newton's third law, conservation of linear momentum and applications, equilibrium of concurrent forces, static and kinetic friction, laws of friction, rolling friction, dynamics of uniform circular motion, centripetal force, vehicle on a level circular road, vehicle on a banked road",
  },
  {
    id: "physics-04",
    subject: "Physics",
    unit: 4,
    title: "Work, Energy and Power",
    topics:
      "Work done by constant and variable forces, kinetic and potential energies, work-energy theorem, power, potential energy of a spring, conservation of mechanical energy, conservative and non-conservative forces, motion in a vertical circle, elastic and inelastic collisions in one and two dimensions",
  },
  {
    id: "physics-05",
    subject: "Physics",
    unit: 5,
    title: "Rotational Motion",
    topics:
      "Centre of mass of a two-particle system and rigid body, basic rotational motion, moment of force, torque, angular momentum, conservation of angular momentum and applications, moment of inertia, radius of gyration, moment of inertia of simple geometrical objects, parallel and perpendicular axes theorems, equilibrium of rigid bodies, rigid body rotation, equations of rotational motion, comparison of linear and rotational motion",
  },
  {
    id: "physics-06",
    subject: "Physics",
    unit: 6,
    title: "Gravitation",
    topics:
      "Universal law of gravitation, acceleration due to gravity and its variation with altitude and depth, Kepler's laws, gravitational potential energy, gravitational potential, escape velocity, motion of a satellite, orbital velocity, time period and energy of a satellite",
  },
  {
    id: "physics-07",
    subject: "Physics",
    unit: 7,
    title: "Properties of Solids and Liquids",
    topics:
      "Elastic behaviour, stress-strain relationship, Hooke's law, Young's modulus, bulk modulus, modulus of rigidity, pressure due to a fluid column, Pascal's law, fluid pressure under gravity, viscosity, Stoke's law, terminal velocity, streamline and turbulent flow, critical velocity, Bernoulli's principle, surface energy, surface tension, angle of contact, excess pressure across a curved surface, drops, bubbles, capillary rise, heat and temperature, thermal expansion, specific heat capacity, calorimetry, change of state, latent heat, conduction, convection and radiation",
  },
  {
    id: "physics-08",
    subject: "Physics",
    unit: 8,
    title: "Thermodynamics",
    topics:
      "Thermal equilibrium, temperature, zeroth law of thermodynamics, heat, work and internal energy, first law of thermodynamics, isothermal and adiabatic processes, second law of thermodynamics, reversible and irreversible processes",
  },
  {
    id: "physics-09",
    subject: "Physics",
    unit: 9,
    title: "Kinetic Theory of Gases",
    topics:
      "Equation of state of a perfect gas, work done on compressing a gas, kinetic theory of gases and assumptions, concept of pressure, kinetic interpretation of temperature, RMS speed, degrees of freedom, law of equipartition of energy and applications to specific heat capacities, mean free path, Avogadro's number",
  },
  {
    id: "physics-10",
    subject: "Physics",
    unit: 10,
    title: "Oscillations and Waves",
    topics:
      "Oscillations and periodic motion, time period, frequency, displacement as a function of time, periodic functions, simple harmonic motion and equation, phase, oscillations of a spring, restoring force and force constant, energy in SHM, kinetic and potential energy, simple pendulum and time period, wave motion, longitudinal and transverse waves, speed of travelling waves, progressive wave equation, superposition principle, reflection of waves, standing waves in strings and organ pipes, fundamental mode and harmonics, beats",
  },
  {
    id: "physics-11",
    subject: "Physics",
    unit: 11,
    title: "Electrostatics",
    topics:
      "Electric charges, conservation of charge, Coulomb's law, forces between point charges, superposition principle, continuous charge distribution, electric field and field lines, field due to a point charge and dipole, torque on a dipole in a uniform field, electric flux, Gauss's law and applications to an infinite charged wire, infinite plane sheet and thin spherical shell, electric potential, potential difference, equipotential surfaces, electrical potential energy, conductors and insulators, dielectrics, electric polarization, capacitors, capacitance, capacitors in series and parallel, parallel plate capacitor with and without dielectric, energy stored in a capacitor",
  },
  {
    id: "physics-12",
    subject: "Physics",
    unit: 12,
    title: "Current Electricity",
    topics:
      "Electric current, drift velocity, mobility, Ohm's law, electrical resistance, I-V characteristics, electrical energy and power, resistivity and conductivity, series and parallel combinations of resistors, temperature dependence of resistance, internal resistance, potential difference and EMF of a cell, cells in series and parallel, Kirchhoff's laws, Wheatstone bridge, metre bridge",
  },
  {
    id: "physics-13",
    subject: "Physics",
    unit: 13,
    title: "Magnetic Effects of Current and Magnetism",
    topics:
      "Biot-Savart law and circular loop, Ampere's law, magnetic field of a long straight wire and solenoid, force on moving charge in magnetic and electric fields, force on a current-carrying conductor, force between parallel current-carrying conductors, definition of ampere, torque on a current loop, moving coil galvanometer, sensitivity and conversion to ammeter and voltmeter, current loop as a magnetic dipole, magnetic dipole moment, bar magnet as equivalent solenoid, magnetic field lines, field due to magnetic dipole along and perpendicular to its axis, torque on magnetic dipole, para-, dia- and ferromagnetic substances, temperature effects on magnetic properties",
  },
  {
    id: "physics-14",
    subject: "Physics",
    unit: 14,
    title: "Electromagnetic Induction and Alternating Currents",
    topics:
      "Electromagnetic induction, Faraday's law, induced EMF and current, Lenz's law, eddy currents, self and mutual inductance, alternating currents, peak and RMS values, reactance and impedance, LCR series circuit, resonance, power in AC circuits, wattless current, AC generator, transformer",
  },
  {
    id: "physics-15",
    subject: "Physics",
    unit: 15,
    title: "Electromagnetic Waves",
    topics:
      "Displacement current, electromagnetic waves and characteristics, transverse nature, electromagnetic spectrum, radio waves, microwaves, infrared, visible, ultraviolet, X-rays and gamma rays, applications of electromagnetic waves",
  },
  {
    id: "physics-16",
    subject: "Physics",
    unit: 16,
    title: "Optics",
    topics:
      "Reflection of light, spherical mirrors, mirror formula, refraction at plane and spherical surfaces, thin lens formula, lens maker formula, total internal reflection and applications, magnification, power of a lens, combination of thin lenses, refraction through a prism, microscope and astronomical telescope, wave optics, wavefront, Huygens' principle, reflection and refraction using Huygens' principle, interference, Young's double-slit experiment, fringe width, coherent sources, sustained interference, single-slit diffraction, central maximum width, polarization, Brewster's law, plane-polarized light, Polaroid",
  },
  {
    id: "physics-17",
    subject: "Physics",
    unit: 17,
    title: "Dual Nature of Matter and Radiation",
    topics:
      "Dual nature of radiation, photoelectric effect, Hertz and Lenard observations, Einstein's photoelectric equation, particle nature of light, matter waves, wave nature of particles, de Broglie relation",
  },
  {
    id: "physics-18",
    subject: "Physics",
    unit: 18,
    title: "Atoms and Nuclei",
    topics:
      "Alpha-particle scattering experiment, Rutherford's model, Bohr model, energy levels, hydrogen spectrum, composition and size of nucleus, atomic masses, mass-energy relation, mass defect, binding energy per nucleon and variation with mass number, nuclear fission and fusion",
  },
  {
    id: "physics-19",
    subject: "Physics",
    unit: 19,
    title: "Electronic Devices",
    topics:
      "Semiconductors, semiconductor diode, I-V characteristics in forward and reverse bias, diode as rectifier, I-V characteristics of LED, photodiode, solar cell, Zener diode, Zener diode as voltage regulator, logic gates including OR, AND, NOT, NAND and NOR",
  },

  // CHEMISTRY — 19 units
  {
    id: "chemistry-01",
    subject: "Chemistry",
    unit: 1,
    title: "Some Basic Concepts in Chemistry",
    topics:
      "Matter and its nature, Dalton's atomic theory, atom, molecule, element and compound, laws of chemical combination, atomic and molecular masses, mole concept, molar mass, percentage composition, empirical and molecular formulae, chemical equations, stoichiometry",
  },
  {
    id: "chemistry-02",
    subject: "Chemistry",
    unit: 2,
    title: "Atomic Structure",
    topics:
      "Nature of electromagnetic radiation, photoelectric effect, hydrogen spectrum, Bohr model of hydrogen atom, energy and radius of orbits, limitations of Bohr model, dual nature of matter, de Broglie relationship, Heisenberg uncertainty principle, elementary quantum mechanics, quantum mechanical model of atom, atomic orbitals, radial variation of psi and psi squared for 1s and 2s, quantum numbers, shapes of s, p and d orbitals, electron spin, Aufbau principle, Pauli exclusion principle, Hund's rule, electronic configuration, stability of half-filled and completely filled orbitals",
  },
  {
    id: "chemistry-03",
    subject: "Chemistry",
    unit: 3,
    title: "Chemical Bonding and Molecular Structure",
    topics:
      "Kossel-Lewis approach, ionic and covalent bonds, ionic bond formation, lattice enthalpy, electronegativity, Fajans' rule, dipole moment, VSEPR theory, shapes of molecules, valence bond theory, hybridization involving s, p and d orbitals, resonance, molecular orbital theory, LCAO, bonding and antibonding orbitals, sigma and pi bonds, molecular orbital configuration of homonuclear diatomic molecules, bond order, bond length, bond energy, metallic bonding, hydrogen bonding and applications",
  },
  {
    id: "chemistry-04",
    subject: "Chemistry",
    unit: 4,
    title: "Chemical Thermodynamics",
    topics:
      "System and surroundings, extensive and intensive properties, state functions, entropy, types of processes, first law of thermodynamics, work, heat, internal energy, enthalpy, heat capacity, molar heat capacity, Hess's law, enthalpies of bond dissociation, combustion, formation, atomization, sublimation, phase transition, hydration, ionization and solution, second law of thermodynamics, spontaneity, entropy change of universe, Gibbs energy, standard Gibbs energy change and equilibrium constant",
  },
  {
    id: "chemistry-05",
    subject: "Chemistry",
    unit: 5,
    title: "Solutions",
    topics:
      "Concentration terms including molality, molarity, mole fraction, percentage by volume and mass, vapour pressure of solutions, Raoult's law, ideal and non-ideal solutions, vapour pressure-composition plots, colligative properties, relative lowering of vapour pressure, depression of freezing point, elevation of boiling point, osmotic pressure, molecular mass determination, abnormal molar mass, van't Hoff factor and significance",
  },
  {
    id: "chemistry-06",
    subject: "Chemistry",
    unit: 6,
    title: "Equilibrium",
    topics:
      "Dynamic equilibrium, physical equilibria, solid-liquid, liquid-gas, gas-gas and solid-gas equilibria, Henry's law, chemical equilibrium, equilibrium constants Kp and Kc, significance of Gibbs energy, concentration, pressure, temperature and catalyst effects, Le Chatelier's principle, ionic equilibrium, weak and strong electrolytes, ionization, Arrhenius, Bronsted-Lowry and Lewis acid-base concepts, acid-base equilibria, ionization constants, ionization of water, pH scale, common ion effect, hydrolysis of salts, solubility of sparingly soluble salts, solubility product and buffer solutions",
  },
  {
    id: "chemistry-07",
    subject: "Chemistry",
    unit: 7,
    title: "Redox Reactions and Electrochemistry",
    topics:
      "Electronic concepts of oxidation and reduction, redox reactions, oxidation number, rules for assigning oxidation number, balancing redox reactions, electrolytic and metallic conduction, conductance in electrolytic solutions, molar conductivity and concentration variation, Kohlrausch's law, electrolytic and galvanic cells, types of electrodes, electrode potentials, standard electrode potential, half-cell and cell reactions, EMF measurement, Nernst equation, cell potential and Gibbs energy relationship, dry cell, lead accumulator, fuel cells",
  },
  {
    id: "chemistry-08",
    subject: "Chemistry",
    unit: 8,
    title: "Chemical Kinetics",
    topics:
      "Rate of chemical reaction, concentration, temperature, pressure and catalyst effects, elementary and complex reactions, order and molecularity, rate law, rate constant and units, differential and integral forms of zero and first-order reactions, characteristics and half-life, Arrhenius theory, activation energy and calculation, collision theory of bimolecular gaseous reactions",
  },
  {
    id: "chemistry-09",
    subject: "Chemistry",
    unit: 9,
    title: "Classification of Elements and Periodicity in Properties",
    topics:
      "Modern periodic law, present form of periodic table, s, p, d and f block elements, periodic trends in atomic and ionic radii, ionisation enthalpy, electron gain enthalpy, valence, oxidation states and chemical reactivity",
  },
  {
    id: "chemistry-10",
    subject: "Chemistry",
    unit: 10,
    title: "p-Block Elements",
    topics:
      "Group 13 to Group 18 elements, electronic configuration, general trends in physical and chemical properties across periods and down groups, unique behaviour of the first element in each group",
  },
  {
    id: "chemistry-11",
    subject: "Chemistry",
    unit: 11,
    title: "d- and f-Block Elements",
    topics:
      "Transition elements, electronic configuration, occurrence, characteristics, trends in physical properties, ionization enthalpy, oxidation states, atomic radii, colour, catalytic behaviour, magnetic properties, complex formation, interstitial compounds, alloy formation, preparation, properties and uses of K2Cr2O7 and KMnO4, lanthanoids, electronic configuration, oxidation states, lanthanoid contraction, actinoids, electronic configuration and oxidation states",
  },
  {
    id: "chemistry-12",
    subject: "Chemistry",
    unit: 12,
    title: "Coordination Compounds",
    topics:
      "Introduction to coordination compounds, Werner's theory, ligands, coordination number, denticity, chelation, IUPAC nomenclature, isomerism, valence bond approach, basic crystal field theory, colour and magnetic properties, qualitative analysis, extraction of metals, biological systems",
  },
  {
    id: "chemistry-13",
    subject: "Chemistry",
    unit: 13,
    title: "Purification and Characterisation of Organic Compounds",
    topics:
      "Purification by crystallisation, sublimation, distillation, differential extraction and chromatography, principles and applications, qualitative analysis for nitrogen, sulphur, phosphorus and halogens, quantitative analysis, estimation of carbon, hydrogen, nitrogen, halogens, sulphur and phosphorus, empirical and molecular formula calculations, quantitative analysis numerical problems",
  },
  {
    id: "chemistry-14",
    subject: "Chemistry",
    unit: 14,
    title: "Some Basic Principles of Organic Chemistry",
    topics:
      "Tetravalency of carbon, shapes of simple molecules, hybridization involving s and p orbitals, classification by functional groups, compounds containing halogens, oxygen, nitrogen and sulphur, homologous series, structural and stereoisomerism, trivial and IUPAC nomenclature, homolytic and heterolytic cleavage, free radicals, carbocations, carbanions, stability of intermediates, electrophiles, nucleophiles, inductive effect, electromeric effect, resonance, hyperconjugation, substitution, addition, elimination and rearrangement reactions",
  },
  {
    id: "chemistry-15",
    subject: "Chemistry",
    unit: 15,
    title: "Hydrocarbons",
    topics:
      "Classification, isomerism, IUPAC nomenclature, preparation, properties and reactions, alkanes, Sawhorse and Newman projections of ethane, halogenation mechanism, alkenes, geometrical isomerism, electrophilic addition, addition of hydrogen, halogens, water and hydrogen halides, Markovnikov and peroxide effects, ozonolysis, polymerization, alkynes, acidic character, aromatic hydrocarbons, benzene structure and aromaticity, electrophilic substitution, halogenation, nitration, Friedel-Crafts alkylation and acylation, directing influence of functional groups",
  },
  {
    id: "chemistry-16",
    subject: "Chemistry",
    unit: 16,
    title: "Organic Compounds Containing Halogens",
    topics:
      "General methods of preparation, properties and reactions, nature of C-X bond, substitution reaction mechanisms, uses and environmental effects of chloroform, iodoform, freons and DDT",
  },
  {
    id: "chemistry-17",
    subject: "Chemistry",
    unit: 17,
    title: "Organic Compounds Containing Oxygen",
    topics:
      "Preparation, properties and reactions, alcohols, phenols and ethers, identification of primary, secondary and tertiary alcohols, dehydration mechanism, acidic nature of phenols, electrophilic substitution, halogenation, nitration and sulphonation, Reimer-Tiemann reaction, ethers and their structure, aldehydes and ketones, carbonyl group, nucleophilic addition to C=O, relative reactivities, addition of HCN, NH3 and derivatives, Grignard reagent, oxidation, reduction by Wolff-Kishner and Clemmensen methods, alpha-hydrogen acidity, aldol condensation, Cannizzaro reaction, haloform reaction, chemical tests, carboxylic acids, acidic strength and factors",
  },
  {
    id: "chemistry-18",
    subject: "Chemistry",
    unit: 18,
    title: "Organic Compounds Containing Nitrogen",
    topics:
      "Preparation, properties, reactions and uses, amines, nomenclature, classification, structure, basic character, identification of primary, secondary and tertiary amines, diazonium salts and their importance in synthetic organic chemistry",
  },
  {
    id: "chemistry-19",
    subject: "Chemistry",
    unit: 19,
    title: "Biomolecules",
    topics:
      "Introduction and importance of biomolecules, carbohydrates, classification, aldoses and ketoses, glucose and fructose, constituent monosaccharides of sucrose, lactose and maltose, proteins, alpha-amino acids, peptide bond, polypeptides, protein structures, denaturation, enzymes, vitamins, classification and functions, nucleic acids, constitution of DNA and RNA, biological functions of nucleic acids, hormones",
  },
];

export const JEE_MAIN_SUBJECT_ORDER = ["Physics", "Chemistry", "Mathematics"];

export const JEE_MAIN_SUBJECT_ACCENTS = {
  Physics: "#8b5cf6",
  Chemistry: "#14b8a6",
  Mathematics: "#f59e0b",
};

// The supplied document presents topics as continuous text rather than
// a separate bullet list. Split on commas but preserve commas inside
// notation such as P(n, r) and C(n, r).
export function splitSyllabusTopics(text = "") {
  return String(text)
    .split(/,(?![^()]*\))/)
    .map((item) => item.trim().replace(/[.;]$/, ""))
    .filter(Boolean);
}

export const SYLLABUS_TOPICS = JEE_MAIN_SYLLABUS_UNITS.flatMap((unit) =>
  splitSyllabusTopics(unit.topics).map((title, index) => ({
    id: `${unit.id}-topic-${index + 1}`,
    subject: unit.subject,
    unitId: unit.id,
    unitNumber: unit.unit,
    unitTitle: unit.title,
    title,
  })),
);
