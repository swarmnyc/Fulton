import { Category } from '../entities/category';
import { Customer } from '../entities/customer';
import { Employee } from '../entities/employee';
import { ObjectId } from 'bson';
import { Territory } from '../entities/territory';
import { Type } from '../../src/types';

function NumberInt(value: number): number {
	return value;
}

function ISODate(value: string): Date {
	return new Date(value);
}

export interface DataMap {
	type: Type,
	data: any[]
}

export interface SampleData {
	categories?: DataMap;
	customers?: DataMap;
	employees?: DataMap;
	territories?: DataMap;
}

export const sampleData: SampleData = {}

sampleData.categories = {
	type: Category,
	data: [
		{
			"_id": new ObjectId("000000000000000000000001"),
			"categoryName": "Beverages",
			"description": "Soft drinks coffees teas beers and ales"
		},
		{
			"_id": new ObjectId("000000000000000000000002"),
			"categoryName": "Confections",
			"description": "Desserts candies and sweet breads"
		},
		{
			"_id": new ObjectId("000000000000000000000003"),
			"categoryName": "Condiments",
			"description": "Sweet and savory sauces relishes spreads and seasonings"
		},
		{
			"_id": new ObjectId("000000000000000000000004"),
			"categoryName": "Grains/Cereals",
			"description": "Breads crackers pasta and cereal"
		},
		{
			"_id": new ObjectId("000000000000000000000005"),
			"categoryName": "Dairy Products",
			"description": "Cheeses"
		},
		{
			"_id": new ObjectId("000000000000000000000006"),
			"categoryName": "Meat/Poultry",
			"description": "Prepared meats"
		},
		{
			"_id": new ObjectId("000000000000000000000007"),
			"categoryName": "Seafood",
			"description": "Seaweed and fish"
		},
		{
			"_id": new ObjectId("000000000000000000000008"),
			"categoryName": "Produce",
			"description": "Dried fruit and bean curd"
		}
	]
}

sampleData.customers = {
	type: Customer,
	data: [
		{
			"_id": "ALFKI",
			"companyName": "Alfreds Futterkiste",
			"contactName": "Maria Anders",
			"contactTitle": "Sales Representative",
			"address": "Obere Str. 57",
			"city": "Berlin",
			"region": "NULL",
			"postalCode": NumberInt(12209),
			"country": "Germany",
			"phone": "030-0074321",
			"fax": "030-0076545"
		},
		{
			"_id": "ANATR",
			"companyName": "Ana Trujillo Emparedados y helados",
			"contactName": "Ana Trujillo",
			"contactTitle": "Owner",
			"address": "Avda. de la Constitución 2222",
			"city": "México D.F.",
			"region": "NULL",
			"postalCode": NumberInt(5021),
			"country": "Mexico",
			"phone": "(5) 555-4729",
			"fax": "(5) 555-3745"
		},
		{
			"_id": "ANTON",
			"companyName": "Antonio Moreno Taquería",
			"contactName": "Antonio Moreno",
			"contactTitle": "Owner",
			"address": "Mataderos  2312",
			"city": "México D.F.",
			"region": "NULL",
			"postalCode": NumberInt(5023),
			"country": "Mexico",
			"phone": "(5) 555-3932",
			"fax": "NULL"
		},
		{
			"_id": "AROUT",
			"companyName": "Around the Horn",
			"contactName": "Thomas Hardy",
			"contactTitle": "Sales Representative",
			"address": "120 Hanover Sq.",
			"city": "London",
			"region": "NULL",
			"postalCode": "WA1 1DP",
			"country": "UK",
			"phone": "(171) 555-7788",
			"fax": "(171) 555-6750"
		},
		{
			"_id": "BERGS",
			"companyName": "Berglunds snabbköp",
			"contactName": "Christina Berglund",
			"contactTitle": "Order Administrator",
			"address": "Berguvsvägen  8",
			"city": "Luleå",
			"region": "NULL",
			"postalCode": "S-958 22",
			"country": "Sweden",
			"phone": "0921-12 34 65",
			"fax": "0921-12 34 67"
		},
		{
			"_id": "BLAUS",
			"companyName": "Blauer See Delikatessen",
			"contactName": "Hanna Moos",
			"contactTitle": "Sales Representative",
			"address": "Forsterstr. 57",
			"city": "Mannheim",
			"region": "NULL",
			"postalCode": NumberInt(68306),
			"country": "Germany",
			"phone": "0621-08460",
			"fax": "0621-08924"
		},
		{
			"_id": "BLONP",
			"companyName": "Blondesddsl père et fils",
			"contactName": "Frédérique Citeaux",
			"contactTitle": "Marketing Manager",
			"address": "24 place Kléber",
			"city": "Strasbourg",
			"region": "NULL",
			"postalCode": NumberInt(67000),
			"country": "France",
			"phone": "88.60.15.31",
			"fax": "88.60.15.32"
		},
		{
			"_id": "BOLID",
			"companyName": "Bólido Comidas preparadas",
			"contactName": "Martín Sommer",
			"contactTitle": "Owner",
			"address": "67C Araquil",
			"city": "Madrid",
			"region": "NULL",
			"postalCode": NumberInt(28023),
			"country": "Spain",
			"phone": "(91) 555 22 82",
			"fax": "(91) 555 91 99"
		},
		{
			"_id": "BONAP",
			"companyName": "Bon app'",
			"contactName": "Laurence Lebihan",
			"contactTitle": "Owner",
			"address": "12 rue des Bouchers",
			"city": "Marseille",
			"region": "NULL",
			"postalCode": NumberInt(13008),
			"country": "France",
			"phone": "91.24.45.40",
			"fax": "91.24.45.41"
		},
		{
			"_id": "BOTTM",
			"companyName": "Bottom-Dollar Markets",
			"contactName": "Elizabeth Lincoln",
			"contactTitle": "Accounting Manager",
			"address": "23 Tsawassen Blvd.",
			"city": "Tsawassen",
			"region": "BC",
			"postalCode": "T2F 8M4",
			"country": "Canada",
			"phone": "(604) 555-4729",
			"fax": "(604) 555-3745"
		},
		{
			"_id": "BSBEV",
			"companyName": "B's Beverages",
			"contactName": "Victoria Ashworth",
			"contactTitle": "Sales Representative",
			"address": "Fauntleroy Circus",
			"city": "London",
			"region": "NULL",
			"postalCode": "EC2 5NT",
			"country": "UK",
			"phone": "(171) 555-1212",
			"fax": "NULL"
		},
		{
			"_id": "CACTU",
			"companyName": "Cactus Comidas para llevar",
			"contactName": "Patricio Simpson",
			"contactTitle": "Sales Agent",
			"address": "Cerrito 333",
			"city": "Buenos Aires",
			"region": "NULL",
			"postalCode": NumberInt(1010),
			"country": "Argentina",
			"phone": "(1) 135-5555",
			"fax": "(1) 135-4892"
		},
		{
			"_id": "CENTC",
			"companyName": "Centro comercial Moctezuma",
			"contactName": "Francisco Chang",
			"contactTitle": "Marketing Manager",
			"address": "Sierras de Granada 9993",
			"city": "México D.F.",
			"region": "NULL",
			"postalCode": NumberInt(5022),
			"country": "Mexico",
			"phone": "(5) 555-3392",
			"fax": "(5) 555-7293"
		},
		{
			"_id": "CHOPS",
			"companyName": "Chop-suey Chinese",
			"contactName": "Yang Wang",
			"contactTitle": "Owner",
			"address": "Hauptstr. 29",
			"city": "Bern",
			"region": "NULL",
			"postalCode": NumberInt(3012),
			"country": "Switzerland",
			"phone": "0452-076545",
			"fax": "NULL"
		},
		{
			"_id": "COMMI",
			"companyName": "Comércio Mineiro",
			"contactName": "Pedro Afonso",
			"contactTitle": "Sales Associate",
			"address": "23 Av. dos Lusíadas",
			"city": "Sao Paulo",
			"region": "SP",
			"postalCode": "05432-043",
			"country": "Brazil",
			"phone": "(11) 555-7647",
			"fax": "NULL"
		},
		{
			"_id": "CONSH",
			"companyName": "Consolidated Holdings",
			"contactName": "Elizabeth Brown",
			"contactTitle": "Sales Representative",
			"address": "Berkeley Gardens 12  Brewery",
			"city": "London",
			"region": "NULL",
			"postalCode": "WX1 6LT",
			"country": "UK",
			"phone": "(171) 555-2282",
			"fax": "(171) 555-9199"
		},
		{
			"_id": "DRACD",
			"companyName": "Drachenblut Delikatessen",
			"contactName": "Sven Ottlieb",
			"contactTitle": "Order Administrator",
			"address": "Walserweg 21",
			"city": "Aachen",
			"region": "NULL",
			"postalCode": NumberInt(52066),
			"country": "Germany",
			"phone": "0241-039123",
			"fax": "0241-059428"
		},
		{
			"_id": "DUMON",
			"companyName": "Du monde entier",
			"contactName": "Janine Labrune",
			"contactTitle": "Owner",
			"address": "67 rue des Cinquante Otages",
			"city": "Nantes",
			"region": "NULL",
			"postalCode": NumberInt(44000),
			"country": "France",
			"phone": "40.67.88.88",
			"fax": "40.67.89.89"
		},
		{
			"_id": "EASTC",
			"companyName": "Eastern Connection",
			"contactName": "Ann Devon",
			"contactTitle": "Sales Agent",
			"address": "35 King George",
			"city": "London",
			"region": "NULL",
			"postalCode": "WX3 6FW",
			"country": "UK",
			"phone": "(171) 555-0297",
			"fax": "(171) 555-3373"
		},
		{
			"_id": "ERNSH",
			"companyName": "Ernst Handel",
			"contactName": "Roland Mendel",
			"contactTitle": "Sales Manager",
			"address": "Kirchgasse 6",
			"city": "Graz",
			"region": "NULL",
			"postalCode": NumberInt(8010),
			"country": "Austria",
			"phone": "7675-3425",
			"fax": "7675-3426"
		},
		{
			"_id": "FAMIA",
			"companyName": "Familia Arquibaldo",
			"contactName": "Aria Cruz",
			"contactTitle": "Marketing Assistant",
			"address": "Rua Orós 92",
			"city": "Sao Paulo",
			"region": "SP",
			"postalCode": "05442-030",
			"country": "Brazil",
			"phone": "(11) 555-9857",
			"fax": "NULL"
		},
		{
			"_id": "FISSA",
			"companyName": "FISSA Fabrica Inter. Salchichas S.A.",
			"contactName": "Diego Roel",
			"contactTitle": "Accounting Manager",
			"address": "C/ Moralzarzal 86",
			"city": "Madrid",
			"region": "NULL",
			"postalCode": NumberInt(28034),
			"country": "Spain",
			"phone": "(91) 555 94 44",
			"fax": "(91) 555 55 93"
		},
		{
			"_id": "FOLKO",
			"companyName": "Folk och fä HB",
			"contactName": "Maria Larsson",
			"contactTitle": "Owner",
			"address": "Åkergatan 24",
			"city": "Bräcke",
			"region": "NULL",
			"postalCode": "S-844 67",
			"country": "Sweden",
			"phone": "0695-34 67 21",
			"fax": "NULL"
		},
		{
			"_id": "FRANK",
			"companyName": "Frankenversand",
			"contactName": "Peter Franken",
			"contactTitle": "Marketing Manager",
			"address": "Berliner Platz 43",
			"city": "München",
			"region": "NULL",
			"postalCode": NumberInt(80805),
			"country": "Germany",
			"phone": "089-0877310",
			"fax": "089-0877451"
		},
		{
			"_id": "FRANR",
			"companyName": "France restauration",
			"contactName": "Carine Schmitt",
			"contactTitle": "Marketing Manager",
			"address": "54 rue Royale",
			"city": "Nantes",
			"region": "NULL",
			"postalCode": NumberInt(44000),
			"country": "France",
			"phone": "40.32.21.21",
			"fax": "40.32.21.20"
		},
		{
			"_id": "FRANS",
			"companyName": "Franchi S.p.A.",
			"contactName": "Paolo Accorti",
			"contactTitle": "Sales Representative",
			"address": "Via Monte Bianco 34",
			"city": "Torino",
			"region": "NULL",
			"postalCode": NumberInt(10100),
			"country": "Italy",
			"phone": "011-4988260",
			"fax": "011-4988261"
		},
		{
			"_id": "FURIB",
			"companyName": "Furia Bacalhau e Frutos do Mar",
			"contactName": "Lino Rodriguez",
			"contactTitle": "Sales Manager",
			"address": "Jardim das rosas n. 32",
			"city": "Lisboa",
			"region": "NULL",
			"postalCode": NumberInt(1675),
			"country": "Portugal",
			"phone": "(1) 354-2534",
			"fax": "(1) 354-2535"
		},
		{
			"_id": "GALED",
			"companyName": "Galería del gastrónomo",
			"contactName": "Eduardo Saavedra",
			"contactTitle": "Marketing Manager",
			"address": "Rambla de Cataluña 23",
			"city": "Barcelona",
			"region": "NULL",
			"postalCode": NumberInt(8022),
			"country": "Spain",
			"phone": "(93) 203 4560",
			"fax": "(93) 203 4561"
		},
		{
			"_id": "GODOS",
			"companyName": "Godos Cocina Típica",
			"contactName": "José Pedro Freyre",
			"contactTitle": "Sales Manager",
			"address": "C/ Romero 33",
			"city": "Sevilla",
			"region": "NULL",
			"postalCode": NumberInt(41101),
			"country": "Spain",
			"phone": "(95) 555 82 82",
			"fax": "NULL"
		},
		{
			"_id": "GOURL",
			"companyName": "Gourmet Lanchonetes",
			"contactName": "André Fonseca",
			"contactTitle": "Sales Associate",
			"address": "Av. Brasil 442",
			"city": "Campinas",
			"region": "SP",
			"postalCode": "04876-786",
			"country": "Brazil",
			"phone": "(11) 555-9482",
			"fax": "NULL"
		},
		{
			"_id": "GREAL",
			"companyName": "Great Lakes Food Market",
			"contactName": "Howard Snyder",
			"contactTitle": "Marketing Manager",
			"address": "2732 Baker Blvd.",
			"city": "Eugene",
			"region": "OR",
			"postalCode": NumberInt(97403),
			"country": "USA",
			"phone": "(503) 555-7555",
			"fax": "NULL"
		},
		{
			"_id": "GROSR",
			"companyName": "GROSELLA-Restaurante",
			"contactName": "Manuel Pereira",
			"contactTitle": "Owner",
			"address": "5ª Ave. Los Palos Grandes",
			"city": "Caracas",
			"region": "DF",
			"postalCode": NumberInt(1081),
			"country": "Venezuela",
			"phone": "(2) 283-2951",
			"fax": "(2) 283-3397"
		},
		{
			"_id": "HANAR",
			"companyName": "Hanari Carnes",
			"contactName": "Mario Pontes",
			"contactTitle": "Accounting Manager",
			"address": "Rua do Paço 67",
			"city": "Rio de Janeiro",
			"region": "RJ",
			"postalCode": "05454-876",
			"country": "Brazil",
			"phone": "(21) 555-0091",
			"fax": "(21) 555-8765"
		},
		{
			"_id": "HILAA",
			"companyName": "HILARION-Abastos",
			"contactName": "Carlos Hernández",
			"contactTitle": "Sales Representative",
			"address": "Carrera 22 con Ave. Carlos Soublette #8-35",
			"city": "San Cristóbal",
			"region": "Táchira",
			"postalCode": NumberInt(5022),
			"country": "Venezuela",
			"phone": "(5) 555-1340",
			"fax": "(5) 555-1948"
		},
		{
			"_id": "HUNGC",
			"companyName": "Hungry Coyote Import Store",
			"contactName": "Yoshi Latimer",
			"contactTitle": "Sales Representative",
			"address": "City Center Plaza 516 Main St.",
			"city": "Elgin",
			"region": "OR",
			"postalCode": NumberInt(97827),
			"country": "USA",
			"phone": "(503) 555-6874",
			"fax": "(503) 555-2376"
		},
		{
			"_id": "HUNGO",
			"companyName": "Hungry Owl All-Night Grocers",
			"contactName": "Patricia McKenna",
			"contactTitle": "Sales Associate",
			"address": "8 Johnstown Road",
			"city": "Cork",
			"region": "Co. Cork",
			"postalCode": "NULL",
			"country": "Ireland",
			"phone": "2967 542",
			"fax": "2967 3333"
		},
		{
			"_id": "ISLAT",
			"companyName": "Island Trading",
			"contactName": "Helen Bennett",
			"contactTitle": "Marketing Manager",
			"address": "Garden House Crowther Way",
			"city": "Cowes",
			"region": "Isle of Wight",
			"postalCode": "PO31 7PJ",
			"country": "UK",
			"phone": "(198) 555-8888",
			"fax": "NULL"
		},
		{
			"_id": "KOENE",
			"companyName": "Königlich Essen",
			"contactName": "Philip Cramer",
			"contactTitle": "Sales Associate",
			"address": "Maubelstr. 90",
			"city": "Brandenburg",
			"region": "NULL",
			"postalCode": NumberInt(14776),
			"country": "Germany",
			"phone": "0555-09876",
			"fax": "NULL"
		},
		{
			"_id": "LACOR",
			"companyName": "La corne d'abondance",
			"contactName": "Daniel Tonini",
			"contactTitle": "Sales Representative",
			"address": "67 avenue de l'Europe",
			"city": "Versailles",
			"region": "NULL",
			"postalCode": NumberInt(78000),
			"country": "France",
			"phone": "30.59.84.10",
			"fax": "30.59.85.11"
		},
		{
			"_id": "LAMAI",
			"companyName": "La maison d'Asie",
			"contactName": "Annette Roulet",
			"contactTitle": "Sales Manager",
			"address": "1 rue Alsace-Lorraine",
			"city": "Toulouse",
			"region": "NULL",
			"postalCode": NumberInt(31000),
			"country": "France",
			"phone": "61.77.61.10",
			"fax": "61.77.61.11"
		},
		{
			"_id": "FOLIG",
			"companyName": "Folies gourmandes",
			"contactName": "Martine Rancé",
			"contactTitle": "Assistant Sales Agent",
			"address": "184 chaussée de Tournai",
			"city": "Lille",
			"region": "NULL",
			"postalCode": NumberInt(59000),
			"country": "France",
			"phone": "20.16.10.16",
			"fax": "20.16.10.17"
		},
		{
			"_id": "LAUGB",
			"companyName": "Laughing Bacchus Wine Cellars",
			"contactName": "Yoshi Tannamuri",
			"contactTitle": "Marketing Assistant",
			"address": "1900 Oak St.",
			"city": "Vancouver",
			"region": "BC",
			"postalCode": "V3F 2K1",
			"country": "Canada",
			"phone": "(604) 555-3392",
			"fax": "(604) 555-7293"
		},
		{
			"_id": "LAZYK",
			"companyName": "Lazy K Kountry Store",
			"contactName": "John Steel",
			"contactTitle": "Marketing Manager",
			"address": "12 Orchestra Terrace",
			"city": "Walla Walla",
			"region": "WA",
			"postalCode": NumberInt(99362),
			"country": "USA",
			"phone": "(509) 555-7969",
			"fax": "(509) 555-6221"
		},
		{
			"_id": "LEHMS",
			"companyName": "Lehmanns Marktstand",
			"contactName": "Renate Messner",
			"contactTitle": "Sales Representative",
			"address": "Magazinweg 7",
			"city": "Frankfurt a.M.",
			"region": "NULL",
			"postalCode": NumberInt(60528),
			"country": "Germany",
			"phone": "069-0245984",
			"fax": "069-0245874"
		},
		{
			"_id": "LILAS",
			"companyName": "LILA-Supermercado",
			"contactName": "Carlos González",
			"contactTitle": "Accounting Manager",
			"address": "Carrera 52 con Ave. Bolívar #65-98 Llano Largo",
			"city": "Barquisimeto",
			"region": "Lara",
			"postalCode": NumberInt(3508),
			"country": "Venezuela",
			"phone": "(9) 331-6954",
			"fax": "(9) 331-7256"
		},
		{
			"_id": "LINOD",
			"companyName": "LINO-Delicateses",
			"contactName": "Felipe Izquierdo",
			"contactTitle": "Owner",
			"address": "Ave. 5 de Mayo Porlamar",
			"city": "I. de Margarita",
			"region": "Nueva Esparta",
			"postalCode": NumberInt(4980),
			"country": "Venezuela",
			"phone": "(8) 34-56-12",
			"fax": "(8) 34-93-93"
		},
		{
			"_id": "LONEP",
			"companyName": "Lonesome Pine Restaurant",
			"contactName": "Fran Wilson",
			"contactTitle": "Sales Manager",
			"address": "89 Chiaroscuro Rd.",
			"city": "Portland",
			"region": "OR",
			"postalCode": NumberInt(97219),
			"country": "USA",
			"phone": "(503) 555-9573",
			"fax": "(503) 555-9646"
		},
		{
			"_id": "MAGAA",
			"companyName": "Magazzini Alimentari Riuniti",
			"contactName": "Giovanni Rovelli",
			"contactTitle": "Marketing Manager",
			"address": "Via Ludovico il Moro 22",
			"city": "Bergamo",
			"region": "NULL",
			"postalCode": NumberInt(24100),
			"country": "Italy",
			"phone": "035-640230",
			"fax": "035-640231"
		},
		{
			"_id": "MAISD",
			"companyName": "Maison Dewey",
			"contactName": "Catherine Dewey",
			"contactTitle": "Sales Agent",
			"address": "Rue Joseph-Bens 532",
			"city": "Bruxelles",
			"region": "NULL",
			"postalCode": "B-1180",
			"country": "Belgium",
			"phone": "(02) 201 24 67",
			"fax": "(02) 201 24 68"
		},
		{
			"_id": "MEREP",
			"companyName": "Mère Paillarde",
			"contactName": "Jean Fresnière",
			"contactTitle": "Marketing Assistant",
			"address": "43 rue St. Laurent",
			"city": "Montréal",
			"region": "Québec",
			"postalCode": "H1J 1C3",
			"country": "Canada",
			"phone": "(514) 555-8054",
			"fax": "(514) 555-8055"
		},
		{
			"_id": "MORGK",
			"companyName": "Morgenstern Gesundkost",
			"contactName": "Alexander Feuer",
			"contactTitle": "Marketing Assistant",
			"address": "Heerstr. 22",
			"city": "Leipzig",
			"region": "NULL",
			"postalCode": NumberInt(4179),
			"country": "Germany",
			"phone": "0342-023176",
			"fax": "NULL"
		},
		{
			"_id": "NORTS",
			"companyName": "North/South",
			"contactName": "Simon Crowther",
			"contactTitle": "Sales Associate",
			"address": "South House 300 Queensbridge",
			"city": "London",
			"region": "NULL",
			"postalCode": "SW7 1RZ",
			"country": "UK",
			"phone": "(171) 555-7733",
			"fax": "(171) 555-2530"
		},
		{
			"_id": "OCEAN",
			"companyName": "Océano Atlántico Ltda.",
			"contactName": "Yvonne Moncada",
			"contactTitle": "Sales Agent",
			"address": "Ing. Gustavo Moncada 8585 Piso 20-A",
			"city": "Buenos Aires",
			"region": "NULL",
			"postalCode": NumberInt(1010),
			"country": "Argentina",
			"phone": "(1) 135-5333",
			"fax": "(1) 135-5535"
		},
		{
			"_id": "OLDWO",
			"companyName": "Old World Delicatessen",
			"contactName": "Rene Phillips",
			"contactTitle": "Sales Representative",
			"address": "2743 Bering St.",
			"city": "Anchorage",
			"region": "AK",
			"postalCode": NumberInt(99508),
			"country": "USA",
			"phone": "(907) 555-7584",
			"fax": "(907) 555-2880"
		},
		{
			"_id": "OTTIK",
			"companyName": "Ottilies Käseladen",
			"contactName": "Henriette Pfalzheim",
			"contactTitle": "Owner",
			"address": "Mehrheimerstr. 369",
			"city": "Köln",
			"region": "NULL",
			"postalCode": NumberInt(50739),
			"country": "Germany",
			"phone": "0221-0644327",
			"fax": "0221-0765721"
		},
		{
			"_id": "PARIS",
			"companyName": "Paris spécialités",
			"contactName": "Marie Bertrand",
			"contactTitle": "Owner",
			"address": "265 boulevard Charonne",
			"city": "Paris",
			"region": "NULL",
			"postalCode": NumberInt(75012),
			"country": "France",
			"phone": "(1) 42.34.22.66",
			"fax": "(1) 42.34.22.77"
		},
		{
			"_id": "PERIC",
			"companyName": "Pericles Comidas clásicas",
			"contactName": "Guillermo Fernández",
			"contactTitle": "Sales Representative",
			"address": "Calle Dr. Jorge Cash 321",
			"city": "México D.F.",
			"region": "NULL",
			"postalCode": NumberInt(5033),
			"country": "Mexico",
			"phone": "(5) 552-3745",
			"fax": "(5) 545-3745"
		},
		{
			"_id": "PICCO",
			"companyName": "Piccolo und mehr",
			"contactName": "Georg Pipps",
			"contactTitle": "Sales Manager",
			"address": "Geislweg 14",
			"city": "Salzburg",
			"region": "NULL",
			"postalCode": NumberInt(5020),
			"country": "Austria",
			"phone": "6562-9722",
			"fax": "6562-9723"
		},
		{
			"_id": "PRINI",
			"companyName": "Princesa Isabel Vinhos",
			"contactName": "Isabel de Castro",
			"contactTitle": "Sales Representative",
			"address": "Estrada da saúde n. 58",
			"city": "Lisboa",
			"region": "NULL",
			"postalCode": NumberInt(1756),
			"country": "Portugal",
			"phone": "(1) 356-5634",
			"fax": "NULL"
		},
		{
			"_id": "QUEDE",
			"companyName": "Que Delícia",
			"contactName": "Bernardo Batista",
			"contactTitle": "Accounting Manager",
			"address": "Rua da Panificadora",
			"city": "12Rio de Janeiro",
			"region": "RJ",
			"postalCode": "02389-673",
			"country": "Brazil",
			"phone": "(21) 555-4252",
			"fax": "(21) 555-4545"
		},
		{
			"_id": "QUEEN",
			"companyName": "Queen Cozinha",
			"contactName": "Lúcia Carvalho",
			"contactTitle": "Marketing Assistant",
			"address": "Alameda dos Canàrios 891",
			"city": "Sao Paulo",
			"region": "SP",
			"postalCode": "05487-020",
			"country": "Brazil",
			"phone": "(11) 555-1189",
			"fax": "NULL"
		},
		{
			"_id": "QUICK",
			"companyName": "QUICK-Stop",
			"contactName": "Horst Kloss",
			"contactTitle": "Accounting Manager",
			"address": "Taucherstraße 10",
			"city": "Cunewalde",
			"region": "NULL",
			"postalCode": NumberInt(1307),
			"country": "Germany",
			"phone": "0372-035188",
			"fax": "NULL"
		},
		{
			"_id": "LETSS",
			"companyName": "Let's Stop N Shop",
			"contactName": "Jaime Yorres",
			"contactTitle": "Owner",
			"address": "87 Polk St. Suite 5",
			"city": "San Francisco",
			"region": "CA",
			"postalCode": NumberInt(94117),
			"country": "USA",
			"phone": "(415) 555-5938",
			"fax": "NULL"
		},
		{
			"_id": "RANCH",
			"companyName": "Rancho grande",
			"contactName": "Sergio Gutiérrez",
			"contactTitle": "Sales Representative",
			"address": "Av. del Libertador 900",
			"city": "Buenos Aires",
			"region": "NULL",
			"postalCode": NumberInt(1010),
			"country": "Argentina",
			"phone": "(1) 123-5555",
			"fax": "(1) 123-5556"
		},
		{
			"_id": "RATTC",
			"companyName": "Rattlesnake Canyon Grocery",
			"contactName": "Paula Wilson",
			"contactTitle": "Assistant Sales Representative",
			"address": "2817 Milton Dr.",
			"city": "Albuquerque",
			"region": "NM",
			"postalCode": NumberInt(87110),
			"country": "USA",
			"phone": "(505) 555-5939",
			"fax": "(505) 555-3620"
		},
		{
			"_id": "REGGC",
			"companyName": "Reggiani Caseifici",
			"contactName": "Maurizio Moroni",
			"contactTitle": "Sales Associate",
			"address": "Strada Provinciale 124",
			"city": "Reggio Emilia",
			"region": "NULL",
			"postalCode": NumberInt(42100),
			"country": "Italy",
			"phone": "0522-556721",
			"fax": "0522-556722"
		},
		{
			"_id": "RICSU",
			"companyName": "Richter Supermarkt",
			"contactName": "Michael Holz",
			"contactTitle": "Sales Manager",
			"address": "Grenzacherweg 237",
			"city": "Genève",
			"region": "NULL",
			"postalCode": NumberInt(1203),
			"country": "Switzerland",
			"phone": "0897-034214",
			"fax": "NULL"
		},
		{
			"_id": "ROMEY",
			"companyName": "Romero y tomillo",
			"contactName": "Alejandra Camino",
			"contactTitle": "Accounting Manager",
			"address": "Gran Vía 1",
			"city": "Madrid",
			"region": "NULL",
			"postalCode": NumberInt(28001),
			"country": "Spain",
			"phone": "(91) 745 6200",
			"fax": "(91) 745 6210"
		},
		{
			"_id": "SANTG",
			"companyName": "Santé Gourmet",
			"contactName": "Jonas Bergulfsen",
			"contactTitle": "Owner",
			"address": "Erling Skakkes gate 78",
			"city": "Stavern",
			"region": "NULL",
			"postalCode": NumberInt(4110),
			"country": "Norway",
			"phone": "07-98 92 35",
			"fax": "07-98 92 47"
		},
		{
			"_id": "SAVEA",
			"companyName": "Save-a-lot Markets",
			"contactName": "Jose Pavarotti",
			"contactTitle": "Sales Representative",
			"address": "187 Suffolk Ln.",
			"city": "Boise",
			"region": "ID",
			"postalCode": NumberInt(83720),
			"country": "USA",
			"phone": "(208) 555-8097",
			"fax": "NULL"
		},
		{
			"_id": "SEVES",
			"companyName": "Seven Seas Imports",
			"contactName": "Hari Kumar",
			"contactTitle": "Sales Manager",
			"address": "90 Wadhurst Rd.",
			"city": "London",
			"region": "NULL",
			"postalCode": "OX15 4NB",
			"country": "UK",
			"phone": "(171) 555-1717",
			"fax": "(171) 555-5646"
		},
		{
			"_id": "SIMOB",
			"companyName": "Simons bistro",
			"contactName": "Jytte Petersen",
			"contactTitle": "Owner",
			"address": "Vinbæltet 34",
			"city": "Kobenhavn",
			"region": "NULL",
			"postalCode": NumberInt(1734),
			"country": "Denmark",
			"phone": "31 12 34 56",
			"fax": "31 13 35 57"
		},
		{
			"_id": "SPECD",
			"companyName": "Spécialités du monde",
			"contactName": "Dominique Perrier",
			"contactTitle": "Marketing Manager",
			"address": "25 rue Lauriston",
			"city": "Paris",
			"region": "NULL",
			"postalCode": NumberInt(75016),
			"country": "France",
			"phone": "(1) 47.55.60.10",
			"fax": "(1) 47.55.60.20"
		},
		{
			"_id": "SPLIR",
			"companyName": "Split Rail Beer & Ale",
			"contactName": "Art Braunschweiger",
			"contactTitle": "Sales Manager",
			"address": "P.O. Box 555",
			"city": "Lander",
			"region": "WY",
			"postalCode": NumberInt(82520),
			"country": "USA",
			"phone": "(307) 555-4680",
			"fax": "(307) 555-6525"
		},
		{
			"_id": "SUPRD",
			"companyName": "Suprêmes délices",
			"contactName": "Pascale Cartrain",
			"contactTitle": "Accounting Manager",
			"address": "Boulevard Tirou 255",
			"city": "Charleroi",
			"region": "NULL",
			"postalCode": "B-6000",
			"country": "Belgium",
			"phone": "(071) 23 67 22 20",
			"fax": "(071) 23 67 22 21"
		},
		{
			"_id": "THEBI",
			"companyName": "The Big Cheese",
			"contactName": "Liz Nixon",
			"contactTitle": "Marketing Manager",
			"address": "89 Jefferson Way Suite 2",
			"city": "Portland",
			"region": "OR",
			"postalCode": NumberInt(97201),
			"country": "USA",
			"phone": "(503) 555-3612",
			"fax": "NULL"
		},
		{
			"_id": "THECR",
			"companyName": "The Cracker Box",
			"contactName": "Liu Wong",
			"contactTitle": "Marketing Assistant",
			"address": "55 Grizzly Peak Rd.",
			"city": "Butte",
			"region": "MT",
			"postalCode": NumberInt(59801),
			"country": "USA",
			"phone": "(406) 555-5834",
			"fax": "(406) 555-8083"
		},
		{
			"_id": "TOMSP",
			"companyName": "Toms Spezialitäten",
			"contactName": "Karin Josephs",
			"contactTitle": "Marketing Manager",
			"address": "Luisenstr. 48",
			"city": "Münster",
			"region": "NULL",
			"postalCode": NumberInt(44087),
			"country": "Germany",
			"phone": "0251-031259",
			"fax": "0251-035695"
		},
		{
			"_id": "TORTU",
			"companyName": "Tortuga Restaurante",
			"contactName": "Miguel Angel Paolino",
			"contactTitle": "Owner",
			"address": "Avda. Azteca 123",
			"city": "México D.F.",
			"region": "NULL",
			"postalCode": NumberInt(5033),
			"country": "Mexico",
			"phone": "(5) 555-2933",
			"fax": "NULL"
		},
		{
			"_id": "TRADH",
			"companyName": "Tradição Hipermercados",
			"contactName": "Anabela Domingues",
			"contactTitle": "Sales Representative",
			"address": "Av. Inês de Castro 414",
			"city": "Sao Paulo",
			"region": "SP",
			"postalCode": "05634-030",
			"country": "Brazil",
			"phone": "(11) 555-2167",
			"fax": "(11) 555-2168"
		},
		{
			"_id": "TRAIH",
			"companyName": "Trail's Head Gourmet Provisioners",
			"contactName": "Helvetius Nagy",
			"contactTitle": "Sales Associate",
			"address": "722 DaVinci Blvd.",
			"city": "Kirkland",
			"region": "WA",
			"postalCode": NumberInt(98034),
			"country": "USA",
			"phone": "(206) 555-8257",
			"fax": "(206) 555-2174"
		},
		{
			"_id": "VAFFE",
			"companyName": "Vaffeljernet",
			"contactName": "Palle Ibsen",
			"contactTitle": "Sales Manager",
			"address": "Smagsloget 45",
			"city": "Århus",
			"region": "NULL",
			"postalCode": NumberInt(8200),
			"country": "Denmark",
			"phone": "86 21 32 43",
			"fax": "86 22 33 44"
		},
		{
			"_id": "VICTE",
			"companyName": "Victuailles en stock",
			"contactName": "Mary Saveley",
			"contactTitle": "Sales Agent",
			"address": "2 rue du Commerce",
			"city": "Lyon",
			"region": "NULL",
			"postalCode": NumberInt(69004),
			"country": "France",
			"phone": "78.32.54.86",
			"fax": "78.32.54.87"
		},
		{
			"_id": "VINET",
			"companyName": "Vins et alcools Chevalier",
			"contactName": "Paul Henriot",
			"contactTitle": "Accounting Manager",
			"address": "59 rue de l'Abbaye",
			"city": "Reims",
			"region": "NULL",
			"postalCode": NumberInt(51100),
			"country": "France",
			"phone": "26.47.15.10",
			"fax": "26.47.15.11"
		},
		{
			"_id": "RICAR",
			"companyName": "Ricardo Adocicados",
			"contactName": "Janete Limeira",
			"contactTitle": "Assistant Sales Agent",
			"address": "Av. Copacabana 267",
			"city": "Rio de Janeiro",
			"region": "RJ",
			"postalCode": "02389-890",
			"country": "Brazil",
			"phone": "(21) 555-3412",
			"fax": "NULL"
		},
		{
			"_id": "WANDK",
			"companyName": "Die Wandernde Kuh",
			"contactName": "Rita Müller",
			"contactTitle": "Sales Representative",
			"address": "Adenauerallee 900",
			"city": "Stuttgart",
			"region": "NULL",
			"postalCode": NumberInt(70563),
			"country": "Germany",
			"phone": "0711-020361",
			"fax": "0711-035428"
		},
		{
			"_id": "WARTH",
			"companyName": "Wartian Herkku",
			"contactName": "Pirkko Koskitalo",
			"contactTitle": "Accounting Manager",
			"address": "Torikatu 38",
			"city": "Oulu",
			"region": "NULL",
			"postalCode": NumberInt(90110),
			"country": "Finland",
			"phone": "981-443655",
			"fax": "981-443655"
		},
		{
			"_id": "WELLI",
			"companyName": "Wellington Importadora",
			"contactName": "Paula Parente",
			"contactTitle": "Sales Manager",
			"address": "Rua do Mercado 12",
			"city": "Resende",
			"region": "SP",
			"postalCode": "08737-363",
			"country": "Brazil",
			"phone": "(14) 555-8122",
			"fax": "NULL"
		},
		{
			"_id": "WHITC",
			"companyName": "White Clover Markets",
			"contactName": "Karl Jablonski",
			"contactTitle": "Owner",
			"address": "305 - 14th Ave. S. Suite 3B",
			"city": "Seattle",
			"region": "WA",
			"postalCode": NumberInt(98128),
			"country": "USA",
			"phone": "(206) 555-4112",
			"fax": "(206) 555-4115"
		},
		{
			"_id": "WOLZA",
			"companyName": "Wolski  Zajazd",
			"contactName": "Zbyszek Piestrzeniewicz",
			"contactTitle": "Owner",
			"address": "ul. Filtrowa 68",
			"city": "Warszawa",
			"region": "NULL",
			"postalCode": "01-012",
			"country": "Poland",
			"phone": "(26) 642-7012",
			"fax": "(26) 642-7012"
		},
		{
			"_id": "WILMK",
			"companyName": "Wilman Kala",
			"contactName": "Matti Karttunen",
			"contactTitle": "Owner/Marketing Assistant",
			"address": "Keskuskatu 45",
			"city": "Helsinki",
			"region": "NULL",
			"postalCode": NumberInt(21240),
			"country": "Finland",
			"phone": "90-224 8858",
			"fax": "90-224 8858"
		}
	]
}

sampleData.employees = {
	type: Employee,
	data: [
		{
			"_id": NumberInt(1),
			"lastName": "Davolio",
			"firstName": "Nancy",
			"title": "Sales Representative",
			"titleOfCourtesy": "Ms.",
			"birthDate": ISODate("1948-12-08T00:00:00.000+0000"),
			"hireDate": ISODate("1992-05-01T00:00:00.000+0000"),
			"address": "507 20th Ave. E. Apt. 2A",
			"city": "Seattle",
			"region": "WA",
			"postalCode": NumberInt(98122),
			"country": "USA",
			"homePhone": "(206) 555-9857",
			"extension": NumberInt(5467),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D20540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Education includes a BA in psychology from Colorado State University in 1970.  She also completed The Art of the Cold Call.  Nancy is a member of Toastmasters International.",
			"reportsTo": NumberInt(2),
			"photoPath": "http://accweb/emmployees/davolio.bmp",
			"territories": [
				{
					"territoryId": NumberInt(6897)
				},
				{
					"territoryId": NumberInt(19713)
				}
			]
		},
		{
			"_id": NumberInt(2),
			"lastName": "Fuller",
			"firstName": "Andrew",
			"title": "Vice President Sales",
			"titleOfCourtesy": "Dr.",
			"birthDate": ISODate("1952-02-19T00:00:00.000+0000"),
			"hireDate": ISODate("1992-08-14T00:00:00.000+0000"),
			"address": "908 W. Capital Way",
			"city": "Tacoma",
			"region": "WA",
			"postalCode": NumberInt(98401),
			"country": "USA",
			"homePhone": "(206) 555-9482",
			"extension": NumberInt(3457),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D20540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Andrew received his BTS commercial in 1974 and a Ph.D. in international marketing from the University of Dallas in 1981.  He is fluent in French and Italian and reads German.  He joined the company as a sales representative was promoted to sales manager",
			"reportsTo": "NULL",
			"photoPath": "http://accweb/emmployees/fuller.bmp",
			"territories": [
				{
					"territoryId": NumberInt(1581)
				},
				{
					"territoryId": NumberInt(1730)
				},
				{
					"territoryId": NumberInt(1833)
				},
				{
					"territoryId": NumberInt(2116)
				},
				{
					"territoryId": NumberInt(2139)
				},
				{
					"territoryId": NumberInt(2184)
				},
				{
					"territoryId": NumberInt(40222)
				}
			]
		},
		{
			"_id": NumberInt(3),
			"lastName": "Leverling",
			"firstName": "Janet",
			"title": "Sales Representative",
			"titleOfCourtesy": "Ms.",
			"birthDate": ISODate("1963-08-30T00:00:00.000+0000"),
			"hireDate": ISODate("1992-04-01T00:00:00.000+0000"),
			"address": "722 Moss Bay Blvd.",
			"city": "Kirkland",
			"region": "WA",
			"postalCode": NumberInt(98033),
			"country": "USA",
			"homePhone": "(206) 555-3412",
			"extension": NumberInt(3355),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000080540000424D80540000000000007600000028000000C0000000E0000000010004000000000000540000CE0E0000D80E0000000000",
			"notes": "Janet has a BS degree in chemistry from Boston College (1984). She has also completed a certificate program in food retailing management.  Janet was hired as a sales associate in 1991 and promoted to sales representative in February 1992.",
			"reportsTo": NumberInt(2),
			"photoPath": "http://accweb/emmployees/leverling.bmp",
			"territories": [
				{
					"territoryId": NumberInt(30346)
				},
				{
					"territoryId": NumberInt(31406)
				},
				{
					"territoryId": NumberInt(32859)
				},
				{
					"territoryId": NumberInt(33607)
				}
			]
		},
		{
			"_id": NumberInt(4),
			"lastName": "Peacock",
			"firstName": "Margaret",
			"title": "Sales Representative",
			"titleOfCourtesy": "Mrs.",
			"birthDate": ISODate("1937-09-19T00:00:00.000+0000"),
			"hireDate": ISODate("1993-05-03T00:00:00.000+0000"),
			"address": "4110 Old Redmond Rd.",
			"city": "Redmond",
			"region": "WA",
			"postalCode": NumberInt(98052),
			"country": "USA",
			"homePhone": "(206) 555-8122",
			"extension": NumberInt(5176),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D20540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Margaret holds a BA in English literature from Concordia College (1958) and an MA from the American Institute of Culinary Arts (1966).  She was assigned to the London office temporarily from July through November 1992.",
			"reportsTo": NumberInt(2),
			"photoPath": "http://accweb/emmployees/peacock.bmp",
			"territories": [
				{
					"territoryId": NumberInt(20852)
				},
				{
					"territoryId": NumberInt(27403)
				},
				{
					"territoryId": NumberInt(27511)
				}
			]
		},
		{
			"_id": NumberInt(5),
			"lastName": "Buchanan",
			"firstName": "Steven",
			"title": "Sales Manager",
			"titleOfCourtesy": "Mr.",
			"birthDate": ISODate("1955-03-04T00:00:00.000+0000"),
			"hireDate": ISODate("1993-10-17T00:00:00.000+0000"),
			"address": "14 Garrett Hill",
			"city": "London",
			"region": "NULL",
			"postalCode": "SW1 8JR",
			"country": "UK",
			"homePhone": "(71) 555-4848",
			"extension": NumberInt(3453),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D20540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Steven Buchanan graduated from St. Andrews University in Scotland with a BSC degree in 1976.  Upon joining the company as a sales representative in 1992 he spent 6 months in an orientation program at the Seattle office.",
			"reportsTo": NumberInt(2),
			"photoPath": "http://accweb/emmployees/buchanan.bmp",
			"territories": [
				{
					"territoryId": NumberInt(2903)
				},
				{
					"territoryId": NumberInt(7960)
				},
				{
					"territoryId": NumberInt(8837)
				},
				{
					"territoryId": NumberInt(10019)
				},
				{
					"territoryId": NumberInt(10038)
				},
				{
					"territoryId": NumberInt(11747)
				},
				{
					"territoryId": NumberInt(14450)
				}
			]
		},
		{
			"_id": NumberInt(6),
			"lastName": "Suyama",
			"firstName": "Michael",
			"title": "Sales Representative",
			"titleOfCourtesy": "Mr.",
			"birthDate": ISODate("1963-07-02T00:00:00.000+0000"),
			"hireDate": ISODate("1993-10-17T00:00:00.000+0000"),
			"address": "Coventry House Miner Rd.",
			"city": "London",
			"region": "NULL",
			"postalCode": "EC2 7JR",
			"country": "UK",
			"homePhone": "(71) 555-7773",
			"extension": NumberInt(428),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D16540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Michael is a graduate of Sussex University (MA Economics 1983) and the University of California at Los Angeles (MBA marketing 1986).  He has also taken the courses Multi-Cultural Selling and Time Management for the Sales Professional.",
			"reportsTo": NumberInt(5),
			"photoPath": "http://accweb/emmployees/davolio.bmp",
			"territories": [
				{
					"territoryId": NumberInt(85014)
				},
				{
					"territoryId": NumberInt(85251)
				},
				{
					"territoryId": NumberInt(98004)
				},
				{
					"territoryId": NumberInt(98052)
				},
				{
					"territoryId": NumberInt(98104)
				}
			]
		},
		{
			"_id": NumberInt(7),
			"lastName": "King",
			"firstName": "Robert",
			"title": "Sales Representative",
			"titleOfCourtesy": "Mr.",
			"birthDate": ISODate("1960-05-29T00:00:00.000+0000"),
			"hireDate": ISODate("1994-01-02T00:00:00.000+0000"),
			"address": "Edgeham Hollow Winchester Way",
			"city": "London",
			"region": "NULL",
			"postalCode": "RG1 9SP",
			"country": "UK",
			"homePhone": "(71) 555-5598",
			"extension": NumberInt(465),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D16540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Robert King served in the Peace Corps and traveled extensively before completing his degree in English at the University of Michigan in 1992 the year he joined the company.",
			"reportsTo": NumberInt(5),
			"photoPath": "http://accweb/emmployees/davolio.bmp",
			"territories": [
				{
					"territoryId": NumberInt(60179)
				},
				{
					"territoryId": NumberInt(60601)
				},
				{
					"territoryId": NumberInt(80202)
				},
				{
					"territoryId": NumberInt(80909)
				},
				{
					"territoryId": NumberInt(90405)
				},
				{
					"territoryId": NumberInt(94025)
				},
				{
					"territoryId": NumberInt(94105)
				},
				{
					"territoryId": NumberInt(95008)
				},
				{
					"territoryId": NumberInt(95054)
				},
				{
					"territoryId": NumberInt(95060)
				}
			]
		},
		{
			"_id": NumberInt(8),
			"lastName": "Callahan",
			"firstName": "Laura",
			"title": "Inside Sales Coordinator",
			"titleOfCourtesy": "Ms.",
			"birthDate": ISODate("1958-01-09T00:00:00.000+0000"),
			"hireDate": ISODate("1994-03-05T00:00:00.000+0000"),
			"address": "4726 11th Ave. N.E.",
			"city": "Seattle",
			"region": "WA",
			"postalCode": NumberInt(98105),
			"country": "USA",
			"homePhone": "(206) 555-1189",
			"extension": NumberInt(2344),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D16540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Laura received a BA in psychology from the University of Washington.  She has also completed a course in business French.  She reads and writes French.",
			"reportsTo": NumberInt(2),
			"photoPath": "http://accweb/emmployees/davolio.bmp",
			"territories": [
				{
					"territoryId": NumberInt(19428)
				},
				{
					"territoryId": NumberInt(44122)
				},
				{
					"territoryId": NumberInt(45839)
				},
				{
					"territoryId": NumberInt(53404)
				}
			]
		},
		{
			"_id": NumberInt(9),
			"lastName": "Dodsworth",
			"firstName": "Anne",
			"title": "Sales Representative",
			"titleOfCourtesy": "Ms.",
			"birthDate": ISODate("1966-01-27T00:00:00.000+0000"),
			"hireDate": ISODate("1994-11-15T00:00:00.000+0000"),
			"address": "7 Houndstooth Rd.",
			"city": "London",
			"region": "NULL",
			"postalCode": "WG2 7LT",
			"country": "UK",
			"homePhone": "(71) 555-4444",
			"extension": NumberInt(452),
			"photo": "0x151C2F00020000000D000E0014002100FFFFFFFF4269746D617020496D616765005061696E742E506963747572650001050000020000000700000050427275736800000000000000000020540000424D16540000000000007600000028000000C0000000DF0000000100040000000000A0530000CE0E0000D80E0000000000",
			"notes": "Anne has a BA degree in English from St. Lawrence College.  She is fluent in French and German.",
			"reportsTo": NumberInt(5),
			"photoPath": "http://accweb/emmployees/davolio.bmp",
			"territories": [
				{
					"territoryId": NumberInt(3049)
				},
				{
					"territoryId": NumberInt(3801)
				},
				{
					"territoryId": NumberInt(48075)
				},
				{
					"territoryId": NumberInt(48084)
				},
				{
					"territoryId": NumberInt(48304)
				},
				{
					"territoryId": NumberInt(55113)
				},
				{
					"territoryId": NumberInt(55439)
				}
			]
		}
	]
}

sampleData.territories = {
	type: Territory,
	data: [
		{
			"_id": NumberInt(1581),
			"territoryDescription": "Westboro",
			"regionId": NumberInt(1),
			"categories": [
				{ "categoryId": new ObjectId("000000000000000000000001") },
				{ "categoryId": new ObjectId("000000000000000000000002") }
			]
		},
		{
			"_id": NumberInt(1730),
			"territoryDescription": "Bedford",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(1833),
			"territoryDescription": "Georgetow",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(2116),
			"territoryDescription": "Boston",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(2139),
			"territoryDescription": "Cambridge",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(2184),
			"territoryDescription": "Braintree",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(2903),
			"territoryDescription": "Providence",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(3049),
			"territoryDescription": "Hollis",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(3801),
			"territoryDescription": "Portsmouth",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(6897),
			"territoryDescription": "Wilton",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(7960),
			"territoryDescription": "Morristown",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(8837),
			"territoryDescription": "Edison",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(10019),
			"territoryDescription": "NewYork",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(10038),
			"territoryDescription": "NewYork",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(11747),
			"territoryDescription": "Mellvile",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(14450),
			"territoryDescription": "Fairport",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(19428),
			"territoryDescription": "Philadelphia",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(19713),
			"territoryDescription": "Neward",
			"regionId": NumberInt(1),
			"categories": [
				{ "categoryId": new ObjectId("000000000000000000000003") },
			]
		},
		{
			"_id": NumberInt(20852),
			"territoryDescription": "Rockville",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(27403),
			"territoryDescription": "Greensboro",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(27511),
			"territoryDescription": "Cary",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(30346),
			"territoryDescription": "Atlanta",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(31406),
			"territoryDescription": "Savannah",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(32859),
			"territoryDescription": "Orlando",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(33607),
			"territoryDescription": "Tampa",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(40222),
			"territoryDescription": "Louisville",
			"regionId": NumberInt(1)
		},
		{
			"_id": NumberInt(44122),
			"territoryDescription": "Beachwood",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(45839),
			"territoryDescription": "Findlay",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(48075),
			"territoryDescription": "Southfield",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(48084),
			"territoryDescription": "Troy",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(48304),
			"territoryDescription": "BloomfieldHills",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(53404),
			"territoryDescription": "Racine",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(55113),
			"territoryDescription": "Roseville",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(55439),
			"territoryDescription": "Minneapolis",
			"regionId": NumberInt(3)
		},
		{
			"_id": NumberInt(60179),
			"territoryDescription": "HoffmanEstates",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(60601),
			"territoryDescription": "Chicago",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(72716),
			"territoryDescription": "Bentonville",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(75234),
			"territoryDescription": "Dallas",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(78759),
			"territoryDescription": "Austin",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(29202),
			"territoryDescription": "Columbia",
			"regionId": NumberInt(4)
		},
		{
			"_id": NumberInt(80202),
			"territoryDescription": "Denver",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(80909),
			"territoryDescription": "ColoradoSprings",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(85014),
			"territoryDescription": "Phoenix",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(90405),
			"territoryDescription": "SantaMonica",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(94025),
			"territoryDescription": "MenloPark",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(94105),
			"territoryDescription": "SanFrancisco",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(95008),
			"territoryDescription": "Campbell",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(95054),
			"territoryDescription": "SantaClara",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(95060),
			"territoryDescription": "SantaCruz",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(98004),
			"territoryDescription": "Bellevue",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(98052),
			"territoryDescription": "Redmond",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(85251),
			"territoryDescription": "Scottsdale",
			"regionId": NumberInt(2)
		},
		{
			"_id": NumberInt(98104),
			"territoryDescription": "Seattle",
			"regionId": NumberInt(2)
		}
	]
}
