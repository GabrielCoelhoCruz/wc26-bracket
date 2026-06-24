import type { Player, TeamCode } from "@/types/wc26";

/**
 * WC26 draft player pool.
 * ~220 notable players across the 48 qualified teams.
 * Ratings are indicative overall strengths (1-99) for the draft game.
 */

function p(
  name: string,
  team: TeamCode,
  position: Player["position"],
  rating: number,
): Player {
  return { id: `${team}-${name.toLowerCase().replace(/\s+/g, "-")}`, name, team, position, rating };
}

export const players: readonly Player[] = [
  // Group A
  p("Jonathan David", "CAN", "ST", 82),
  p("Alphonso Davies", "CAN", "LB", 83),
  p("Cyle Larin", "CAN", "ST", 74),
  p("Stephen Eustaquio", "CAN", "CM", 75),
  p("Milan Borjan", "CAN", "GK", 73),

  p("Guillermo Ochoa", "MEX", "GK", 77),
  p("Santiago Gimenez", "MEX", "ST", 80),
  p("Edson Alvarez", "MEX", "DM", 78),
  p("Hirving Lozano", "MEX", "RW", 77),
  p("Luis Chavez", "MEX", "CM", 74),
  p("Cesar Montes", "MEX", "CB", 75),

  p("Christian Pulisic", "USA", "LW", 83),
  p("Giovanni Reyna", "USA", "AM", 79),
  p("Folarin Balogun", "USA", "ST", 77),
  p("Weston McKennie", "USA", "CM", 78),
  p("Tyler Adams", "USA", "DM", 76),
  p("Matt Turner", "USA", "GK", 76),
  p("Tim Weah", "USA", "RW", 75),
  p("Antonee Robinson", "USA", "LB", 77),
  p("Chris Richards", "USA", "CB", 74),

  // Group B
  p("Vinicius Junior", "BRA", "LW", 93),
  p("Rodrygo", "BRA", "RW", 88),
  p("Endrick", "BRA", "ST", 82),
  p("Raphinha", "BRA", "RW", 86),
  p("Bruno Guimaraes", "BRA", "CM", 86),
  p("Gabriel Martinelli", "BRA", "LW", 84),
  p("Marquinhos", "BRA", "CB", 86),
  p("Eder Militao", "BRA", "CB", 85),
  p("Alisson", "BRA", "GK", 89),
  p("Ederson", "BRA", "GK", 87),
  p("Lucas Paqueta", "BRA", "AM", 82),
  p("Joao Gomes", "BRA", "DM", 79),

  p("Federico Valverde", "URU", "CM", 88),
  p("Darwin Nunez", "URU", "ST", 82),
  p("Ronald Araujo", "URU", "CB", 85),
  p("Jose Maria Gimenez", "URU", "CB", 82),
  p("Manuel Ugarte", "URU", "DM", 80),
  p("Facundo Pellistri", "URU", "RW", 75),
  p("Sergio Rochet", "URU", "GK", 76),

  p("Julio Enciso", "PAR", "ST", 76),
  p("Miguel Almiron", "PAR", "RW", 76),
  p("Gustavo Gomez", "PAR", "CB", 75),
  p("Matias Rojas", "PAR", "AM", 73),
  p("Carlos Coronel", "PAR", "GK", 72),

  // Group C
  p("Lionel Messi", "ARG", "RW", 92),
  p("Julian Alvarez", "ARG", "ST", 86),
  p("Lautaro Martinez", "ARG", "ST", 87),
  p("Enzo Fernandez", "ARG", "CM", 85),
  p("Alexis Mac Allister", "ARG", "CM", 84),
  p("Rodrigo De Paul", "ARG", "CM", 84),
  p("Cristian Romero", "ARG", "CB", 85),
  p("Lisandro Martinez", "ARG", "CB", 84),
  p("Emiliano Martinez", "ARG", "GK", 87),
  p("Nicolas Otamendi", "ARG", "CB", 80),
  p("Angel Di Maria", "ARG", "RW", 81),
  p("Giovani Lo Celso", "ARG", "AM", 80),

  p("James Rodriguez", "COL", "AM", 79),
  p("Luis Diaz", "COL", "LW", 84),
  p("Jhon Duran", "COL", "ST", 80),
  p("Davinson Sanchez", "COL", "CB", 77),
  p("Jefferson Lerma", "COL", "DM", 77),
  p("Juan Cuadrado", "COL", "RW", 76),
  p("Camilo Vargas", "COL", "GK", 76),

  p("Paolo Guerrero", "PER", "ST", 72),
  p("Andre Carrillo", "PER", "RW", 74),
  p("Renato Tapia", "PER", "DM", 74),
  p("Pedro Gallese", "PER", "GK", 74),

  // Group D
  p("Kylian Mbappe", "FRA", "ST", 94),
  p("Ousmane Dembele", "FRA", "RW", 86),
  p("Antoine Griezmann", "FRA", "AM", 85),
  p("Eduardo Camavinga", "FRA", "CM", 84),
  p("Aurelien Tchouameni", "FRA", "DM", 85),
  p("William Saliba", "FRA", "CB", 87),
  p("Dayot Upamecano", "FRA", "CB", 84),
  p("Theo Hernandez", "FRA", "LB", 86),
  p("Jules Kounde", "FRA", "RB", 84),
  p("Mike Maignan", "FRA", "GK", 88),
  p("Randal Kolo Muani", "FRA", "ST", 81),
  p("Bradley Barcola", "FRA", "LW", 82),

  p("Virgil van Dijk", "NED", "CB", 87),
  p("Frenkie de Jong", "NED", "CM", 86),
  p("Cody Gakpo", "NED", "LW", 84),
  p("Memphis Depay", "NED", "ST", 80),
  p("Xavi Simons", "NED", "AM", 83),
  p("Nathan Ake", "NED", "CB", 82),
  p("Denzel Dumfries", "NED", "RB", 81),
  p("Bart Verbruggen", "NED", "GK", 79),

  p("Robert Lewandowski", "POL", "ST", 84),
  p("Piotr Zielinski", "POL", "AM", 80),
  p("Wojciech Szczesny", "POL", "GK", 80),
  p("Nicola Zalewski", "POL", "LW", 76),
  p("Jan Bednarek", "POL", "CB", 75),

  // Group E
  p("Jude Bellingham", "ENG", "AM", 90),
  p("Bukayo Saka", "ENG", "RW", 88),
  p("Phil Foden", "ENG", "LW", 87),
  p("Harry Kane", "ENG", "ST", 89),
  p("Declan Rice", "ENG", "DM", 87),
  p("Trent Alexander-Arnold", "ENG", "RB", 86),
  p("Kyle Walker", "ENG", "RB", 83),
  p("John Stones", "ENG", "CB", 84),
  p("Marc Guehi", "ENG", "CB", 82),
  p("Jordan Pickford", "ENG", "GK", 84),
  p("Cole Palmer", "ENG", "AM", 85),
  p("Ollie Watkins", "ENG", "ST", 82),

  p("Kevin De Bruyne", "BEL", "CM", 87),
  p("Romelu Lukaku", "BEL", "ST", 82),
  p("Jeremy Doku", "BEL", "LW", 84),
  p("Leandro Trossard", "BEL", "LW", 81),
  p("Amadou Onana", "BEL", "DM", 81),
  p("Youri Tielemans", "BEL", "CM", 80),
  p("Jan Vertonghen", "BEL", "CB", 76),
  p("Thibaut Courtois", "BEL", "GK", 87),
  p("Arthur Theate", "BEL", "CB", 79),

  p("Cristiano Ronaldo", "POR", "ST", 84),
  p("Bruno Fernandes", "POR", "AM", 87),
  p("Bernardo Silva", "POR", "RW", 87),
  p("Rafael Leao", "POR", "LW", 86),
  p("Joao Felix", "POR", "AM", 83),
  p("Ruben Dias", "POR", "CB", 86),
  p("Joao Cancelo", "POR", "LB", 84),
  p("Diogo Jota", "POR", "ST", 84),
  p("Pepe", "POR", "CB", 75),
  p("Diogo Costa", "POR", "GK", 84),
  p("Vitinha", "POR", "CM", 83),

  // Group F
  p("Lamine Yamal", "ESP", "RW", 88),
  p("Nico Williams", "ESP", "LW", 85),
  p("Pedri", "ESP", "CM", 88),
  p("Dani Olmo", "ESP", "AM", 84),
  p("Rodri", "ESP", "DM", 90),
  p("Fermin Lopez", "ESP", "AM", 81),
  p("Alvaro Morata", "ESP", "ST", 82),
  p("Aymeric Laporte", "ESP", "CB", 85),
  p("Dani Carvajal", "ESP", "RB", 84),
  p("Unai Simon", "ESP", "GK", 84),
  p("Gavi", "ESP", "CM", 84),
  p("Mikel Merino", "ESP", "CM", 82),

  p("Jamal Musiala", "GER", "AM", 89),
  p("Florian Wirtz", "GER", "AM", 88),
  p("Kai Havertz", "GER", "ST", 83),
  p("Ilkay Gundogan", "GER", "CM", 82),
  p("Joshua Kimmich", "GER", "DM", 87),
  p("Toni Kroos", "GER", "CM", 85),
  p("Antonio Rudiger", "GER", "CB", 86),
  p("Jonathan Tah", "GER", "CB", 84),
  p("Leroy Sane", "GER", "RW", 83),
  p("Serge Gnabry", "GER", "LW", 82),
  p("Manuel Neuer", "GER", "GK", 84),
  p("Marc-Andre ter Stegen", "GER", "GK", 85),

  p("Luka Modric", "CRO", "CM", 83),
  p("Mateo Kovacic", "CRO", "CM", 82),
  p("Marcelo Brozovic", "CRO", "DM", 81),
  p("Josko Gvardiol", "CRO", "CB", 85),
  p("Ivan Perisic", "CRO", "LW", 78),
  p("Andrej Kramaric", "CRO", "ST", 79),
  p("Dominik Livakovic", "CRO", "GK", 80),

  // Group G
  p("Gianluca Scamacca", "ITA", "ST", 81),
  p("Federico Chiesa", "ITA", "LW", 83),
  p("Nicolo Barella", "ITA", "CM", 86),
  p("Jorginho", "ITA", "DM", 81),
  p("Alessandro Bastoni", "ITA", "CB", 86),
  p("Gianluigi Donnarumma", "ITA", "GK", 87),
  p("Federico Dimarco", "ITA", "LB", 83),
  p("Davide Frattesi", "ITA", "CM", 80),
  p("Mateo Retegui", "ITA", "ST", 79),
  p("Giovanni Di Lorenzo", "ITA", "RB", 81),

  p("Granit Xhaka", "SUI", "DM", 82),
  p("Manuel Akanji", "SUI", "CB", 83),
  p("Breel Embolo", "SUI", "ST", 80),
  p("Xherdan Shaqiri", "SUI", "RW", 76),
  p("Ruben Vargas", "SUI", "LW", 77),
  p("Yann Sommer", "SUI", "GK", 82),

  p("Christian Eriksen", "DEN", "CM", 81),
  p("Pierre-Emile Hojbjerg", "DEN", "DM", 80),
  p("Rasmus Hojlund", "DEN", "ST", 80),
  p("Andreas Christensen", "DEN", "CB", 81),
  p("Joachim Andersen", "DEN", "CB", 79),
  p("Kasper Schmeichel", "DEN", "GK", 78),

  // Group H
  p("Achraf Hakimi", "MAR", "RB", 85),
  p("Yassine Bounou", "MAR", "GK", 83),
  p("Sofyan Amrabat", "MAR", "DM", 81),
  p("Hakim Ziyech", "MAR", "RW", 80),
  p("Youssef En-Nesyri", "MAR", "ST", 81),
  p("Noussair Mazraoui", "MAR", "LB", 81),
  p("Azzedine Ounahi", "MAR", "CM", 79),

  p("Sadio Mane", "SEN", "LW", 83),
  p("Kalidou Koulibaly", "SEN", "CB", 81),
  p("Ismaila Sarr", "SEN", "RW", 80),
  p("Idrissa Gueye", "SEN", "DM", 79),
  p("Edouard Mendy", "SEN", "GK", 80),
  p("Nicolas Jackson", "SEN", "ST", 79),

  p("Mohammed Kudus", "GHA", "AM", 80),
  p("Thomas Partey", "GHA", "DM", 81),
  p("Inaki Williams", "GHA", "RW", 79),
  p("Jordan Ayew", "GHA", "ST", 76),
  p("Andre Ayew", "GHA", "LW", 75),
  p("Richard Ofori", "GHA", "GK", 72),

  // Group I
  p("Victor Osimhen", "NGA", "ST", 85),
  p("Ademola Lookman", "NGA", "LW", 83),
  p("Alex Iwobi", "NGA", "AM", 79),
  p("Wilfred Ndidi", "NGA", "DM", 80),
  p("William Troost-Ekong", "NGA", "CB", 76),
  p("Stanley Nwabili", "NGA", "GK", 74),

  p("Andre Onana", "CMR", "GK", 82),
  p("Vincent Aboubakar", "CMR", "ST", 76),
  p("Bryan Mbeumo", "CMR", "RW", 80),
  p("Frank Anguissa", "CMR", "DM", 80),
  p("Karl Toko Ekambi", "CMR", "LW", 76),

  p("Ellyes Skhiri", "TUN", "DM", 76),
  p("Youssef Msakni", "TUN", "LW", 74),
  p("Wahbi Khazri", "TUN", "AM", 73),
  p("Bechir Ben Said", "TUN", "GK", 71),

  // Group J
  p("Riyad Mahrez", "ALG", "RW", 80),
  p("Youcef Atal", "ALG", "RB", 76),
  p("Sofiane Feghouli", "ALG", "AM", 75),
  p("Islam Slimani", "ALG", "ST", 74),
  p("Ramiz Zerrouki", "ALG", "DM", 75),

  p("Mohamed Salah", "EGY", "RW", 88),
  p("Omar Marmoush", "EGY", "ST", 82),
  p("Mohamed Elneny", "EGY", "DM", 76),
  p("Trézéguet", "EGY", "LW", 79),
  p("Ahmed Hegazi", "EGY", "CB", 76),
  p("Mohamed Abou Gabal", "EGY", "GK", 75),

  p("Percy Tau", "RSA", "RW", 75),
  p("Themba Zwane", "RSA", "AM", 73),
  p("Ronwen Williams", "RSA", "GK", 74),

  // Group K
  p("Takefusa Kubo", "JPN", "RW", 82),
  p("Kaoru Mitoma", "JPN", "LW", 83),
  p("Daichi Kamada", "JPN", "AM", 80),
  p("Wataru Endo", "JPN", "DM", 80),
  p("Maya Yoshida", "JPN", "CB", 76),
  p("Hiroki Ito", "JPN", "CB", 78),
  p("Ritsu Doan", "JPN", "RW", 79),
  p("Takumi Minamino", "JPN", "LW", 78),
  p("Shuichi Gonda", "JPN", "GK", 75),

  p("Son Heung-min", "KOR", "LW", 84),
  p("Lee Kang-in", "KOR", "AM", 81),
  p("Kim Min-jae", "KOR", "CB", 83),
  p("Hwang Hee-chan", "KOR", "RW", 79),
  p("Cho Gue-sung", "KOR", "ST", 77),
  p("Hwang In-beom", "KOR", "CM", 78),
  p("Jo Hyeon-woo", "KOR", "GK", 76),

  p("Mathew Ryan", "AUS", "GK", 75),
  p("Craig Goodwin", "AUS", "LW", 76),
  p("Ajdin Hrustic", "AUS", "AM", 75),
  p("Mitchell Duke", "AUS", "ST", 74),
  p("Jackson Irvine", "AUS", "CM", 75),

  // Group L
  p("Salem Al-Dawsari", "KSA", "LW", 77),
  p("Saud Abdulhamid", "KSA", "RB", 74),
  p("Saleh Al-Shehri", "KSA", "ST", 73),
  p("Mohamed Kanno", "KSA", "CM", 75),

  p("Mehdi Taremi", "IRN", "ST", 80),
  p("Sardar Azmoun", "IRN", "ST", 78),
  p("Alireza Jahanbakhsh", "IRN", "RW", 76),
  p("Alireza Beiranvand", "IRN", "GK", 74),

  p("Akram Afif", "QAT", "LW", 77),
  p("Almoez Ali", "QAT", "ST", 75),
  p("Hassan Al-Haydos", "QAT", "AM", 74),
  p("Boualem Khoukhi", "QAT", "CB", 73),

  // Group M
  p("Keylor Navas", "CRC", "GK", 78),
  p("Joel Campbell", "CRC", "RW", 75),
  p("Anthony Contreras", "CRC", "ST", 73),
  p("Bryan Oviedo", "CRC", "LB", 72),

  p("Leon Bailey", "JAM", "RW", 79),
  p("Michail Antonio", "JAM", "ST", 78),
  p("Demarai Gray", "JAM", "LW", 76),
  p("Andre Blake", "JAM", "GK", 76),

  p("Yoel Barcenas", "PAN", "RW", 72),
  p("Jose Fajardo", "PAN", "ST", 71),
  p("Anibal Godoy", "PAN", "DM", 73),

  // Group N
  p("Moises Caicedo", "ECU", "DM", 83),
  p("Pervis Estupinan", "ECU", "LB", 81),
  p("Enner Valencia", "ECU", "ST", 78),
  p("Gonzalo Plata", "ECU", "RW", 78),
  p("Piero Hincapie", "ECU", "CB", 79),

  p("Alexis Sanchez", "CHI", "ST", 76),
  p("Arturo Vidal", "CHI", "DM", 75),
  p("Gary Medel", "CHI", "CB", 72),
  p("Ben Brereton Diaz", "CHI", "LW", 75),

  p("Salomon Rondon", "VEN", "ST", 75),
  p("Josef Martinez", "VEN", "ST", 76),
  p("Yeferson Soteldo", "VEN", "LW", 76),

  // Group O
  p("Dusan Vlahovic", "SRB", "ST", 83),
  p("Aleksandar Mitrovic", "SRB", "ST", 81),
  p("Sergej Milinkovic-Savic", "SRB", "CM", 84),
  p("Dusan Tadic", "SRB", "AM", 81),
  p("Strahinja Pavlovic", "SRB", "CB", 78),
  p("Predrag Rajkovic", "SRB", "GK", 78),

  p("Victor Gyokeres", "SWE", "ST", 84),
  p("Dejan Kulusevski", "SWE", "RW", 82),
  p("Emil Forsberg", "SWE", "LW", 79),
  p("Alexander Isak", "SWE", "ST", 84),
  p("Ludwig Augustinsson", "SWE", "LB", 75),
  p("Robin Olsen", "SWE", "GK", 76),

  p("Erling Haaland", "NOR", "ST", 91),
  p("Martin Odegaard", "NOR", "AM", 88),
  p("Sander Berge", "NOR", "CM", 79),
  p("Jorgen Strand Larsen", "NOR", "ST", 78),
  p("Leo Ostigard", "NOR", "CB", 76),

  // Group P
  p("Artem Dovbyk", "UKR", "ST", 82),
  p("Mykhailo Mudryk", "UKR", "LW", 81),
  p("Oleksandr Zinchenko", "UKR", "LB", 81),
  p("Andriy Yarmolenko", "UKR", "RW", 77),
  p("Illya Zabarnyi", "UKR", "CB", 80),
  p("Anatoliy Trubin", "UKR", "GK", 78),

  p("Chris Wood", "NZL", "ST", 77),
  p("Marco Rojas", "NZL", "AM", 73),
  p("Liberato Cacace", "NZL", "LB", 74),

  p("Mohanad Ali", "IRQ", "ST", 73),
  p("Aymen Hussein", "IRQ", "ST", 74),
  p("Amjad Attwan", "IRQ", "CM", 72),
];

export function getPlayersByTeam(team: TeamCode): readonly Player[] {
  return players.filter((p) => p.team === team);
}

export function getPlayerById(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}
