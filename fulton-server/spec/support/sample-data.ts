import { Hotdog } from "../helpers/entities/hot-dog";
import { Tag } from "../helpers/entities/tag";
import { Author } from "../helpers/entities/author";

export const sampleData = {
	"hotdogs": {
		entity: Hotdog,
		data: [
			{
				"_id": "12",
				"name": "Buldogis",
				"location": [
					36.147049,
					-115.29836649999999
				],
				"address": "2291 S Fort Apache Rd, Las Vegas, NV 89117",
				"review": "Great variety of delicious hot dogs, and I'm glad they've recently expanded the menu to include burritos and a few other things. Spicy food if you want it!",
				"author":  { "id": "1019" },
				"picture": "picture1"
			},
			{
				"_id": "1",
				"name": "Dog & Bone",
				"location": [
					40.74010759999999,
					-73.98243919999999
				],
				"address": "338 3rd Avenue, 162 East 25th Street, New York, NY 10010",
				"review": "Really great atmosphere here, the food is good and reasonably priced, bartenders are fast. \n\nWould recommend!",
				"author":  { "id": "965" },
				"picture": "picture2"
			},
			{
				"_id": "2",
				"name": "Nathan's Famous",
				"location": [
					40.7499718,
					-73.99216760000002
				],
				"address": "2 Pennsylvania Plaza, New York, NY 10121",
				"review": "I only ordered take out. One of the worst burgers I have had in my life. \nThe meat was cold and it tasted like it had been lying there for days. \nThe bun was super soggy as well. I will never go there again.",
				"author":  { "id": "384" },
				"picture": "picture3"
			},
			{
				"_id": "11",
				"name": "Windy City Beefs-N-Dogs",
				"location": [
					36.1973944,
					-115.25792389999998
				],
				"address": "7500 W Lake Mead Blvd, Las Vegas, NV 89128",
				"review": "This place was amazing!! The hot dogs were delicious! But what I loved most about the place was the people and customer service!!! My friend and I actually walked in right when they closed. So we thought we would have to find another place to eat. But they made our hot dogs anyway! Every single person was genuinely friendly and we felt so welcome. They seemed like really sincere and genuine people. The food was so tasty too. My friend and I had an amazing time. Overall one of my favorite experiences eating out. \n\nI strongly recommend this place. I will definitely be coming back! :-)",
				"author":  { "id": "689" },
				"picture": "picture4"
			},
			{
				"_id": "3",
				"name": "Papaya Dog",
				"location": [
					40.7315957,
					-73.9826698
				],
				"address": "239 1st Avenue, New York, NY 10003",
				"review": "So after my exam I was starving,  so I saw this place nearby on 1st Ave. So I ate two hot dogs and a coke and immediately got bloated and by the time I got home I was in the bathroom with serious stomach pain, and I was throwing up, for about 5 minutes. \n\nThe workers wears gloves, the only problem is they never take them off, I witnessed one guy come from the bathroom still wearing his gloves and he touched the side of a garbage can located inside and  he never took them off, and went right back behind the counter to prepare more food. Mind you, I saw this after I ate my food. \n\nI will never eat there again.",
				"author":  { "id": "675" },
				"picture": "https://lh3.googleusercontent.com/proxy/i-oa-6itOrdYNxrnOAVRYKl2KQ6G465Lrwgn97kZOxzFk1UJi45_0evuyMcvw0bL0mcKhpwm-D-IPnnHXeeSh2kaBL8OPDKA094JZ5RKjHBiI6iwONmogEsHD1W9uC70sX8-ubHXDviCTROtgGyWDTXSJB6ngug=w90-h90-n-k-no"
			},
			{
				"_id": "5",
				"name": "Snack Box",
				"location": [
					40.75625890000001,
					-73.98650750000002
				],
				"address": "1471 Broadway, New York, NY 10036",
				"review": "I can't say that they're New York's 'best' hot dog, but I wouldn't be surprised. It was amazing. Pickles, sauerkraut, mustard and sauce - what more could you want.",
				"author":  { "id": "553" },
				"picture": "https://lh5.googleusercontent.com/p/AF1QipOXNyAKq3OX1Jym9c6Ah11Dc4fxiKSocbHf17c1=w90-h90-n-k-no"
			},
			{
				"_id": "6",
				"name": "Kings of Kobe",
				"location": [
					40.7649029,
					-73.98753669999996
				],
				"address": "790 9th Ave, New York, NY 10019",
				"review": "NYE, my girlfriend and I literally stumbled into this place in an attempt to get out of the cold. While we waited to defrost, one of the workers asked us if we were planning to order, and placed a 'reserved' sign at our table to save our spot while we did. The menu has vegan options (a huge plus for my vegan girlfriend!) in their menu of burgers, fries, snacks, and sides. There's a wide selection of sodas and beer as well. I, a dumb Australian, struggle to understand the speed and slur of New York accents, and on my second night in the city, the servers spoke clearly, concisely, and slow enough  for me to understand! The food was hot, and the Mac and cheese balls weren't as oily as expected, my girlfriend loved the burger, the service was like coming home to your family, and we will be returning in the near future, I imagine! thank you for a wonderful evening, boys.",
				"author":  { "id": "1311" },
				"picture": "https://lh5.googleusercontent.com/p/AF1QipPc_XzLRyY8N4Ngl74rtEW4Q4Tqo2YCIqXEViM6=w90-h90-n-k-no"
			},
			{
				"_id": "8",
				"name": "Dapper Dog",
				"location": [
					37.7622828,
					-122.434936
				],
				"address": "417 Castro St, San Francisco, CA 94114",
				"review": "If you're a pizza lover, you're obligated to try the pizza hot dog. Their other hot dogs are delicious as well. Fries are crisp. Countertop eating space inside and a few tables outside. A great quick stop before going into the Castro Theatre.",
				"author":  { "id": "1363" },
				"picture": "picture9"
			},
			{
				"_id": "9",
				"name": "Los Shucos Latin Hot Dogs",
				"location": [
					37.7569752,
					-122.40559139999999
				],
				"address": "3224 1/2 22nd St, San Francisco, CA 94110",
				"review": "Sad to see that it's catering only now. Would love a new storefront that was properly advertised. Gave me a love of hot dogs & a new understanding of my Guatemalan cuisine heritage. Street food done right, and ever so memorable!",
				"author":  { "id": "1123" },
				"picture": "picture11"
			},
			{
				"_id": "10",
				"name": "Rosamunde Sausage Grill",
				"location": [
					37.7718371,
					-122.43112510000003
				],
				"address": "545 Haight St, San Francisco, CA 94117",
				"review": "Pretty decent hot dogs and sausages, I had the Wild Boar but I wasn't impressed by it. It was lacking in flavor, and the dog didn't stand out to me, especially considering the high prices($8 each!).",
				"author":  { "id": "1383" },
				"picture": "picture10"
			},
			{
				"_id": "not-hotdog-1",
				"name": "Dachshund hotdog",
				"flagged": true,
				"location": [
					40.6900255,
					-73.98432159999999
				],
				"address": "207 W 38th St, New York, NY 10018",
				"review": "Korean fried chicken is the bomb!  Seriously, go, you'll love it. If you don't love it, your tastebuds are dead. Normally,  I'd be all over the wings,  but the husband isn't a wing guy, so we did the tenders. Half ginger soy, half spicy. Let's just say that spicy is an understatement.  We'll go again if we are near one....please bring one to Boston. Oh, the staff, they were all great, tip them well!",
				"author":  { "id": "324" },
				"picture": "https://s-media-cache-ak0.pinimg.com/originals/46/9d/57/469d57c5630a594f4b6070ff35fa32f1.jpg"
			},
			{
				"_id": "not-hotdog-2",
				"name": "Fulton Hot Dog King",
				"flagged": true,
				"location": [
					40.6900255,
					-73.98432159999999
				],
				"address": "472 Fulton St, Brooklyn, NY 11201",
				"review": "A major staple in downtown brooklyn. Always make it a habit to stop by when I am in the neighborhood. Quick service, you can choose which hotdog you would like as you can see it on the grill right in front of you. Great juices also!",
				"author":  { "id": "684" },
				"picture": "http://myminidoxie.com/wp-content/uploads/2012/11/which-came-first-the-wiener-or-the-dachshund.jpg"
			},
			{
				"_id": "4",
				"name": "Crif Dogs",
				"location": [
					40.7271072,
					-73.98373520000001
				],
				"address": "113 St Marks Pl, New York, NY 10009",
				"review": "Popped in here for a quick snack after a few rounds of drinks in the East Village. The Hot Dogs are solid and remind me of the kinds you get on the streets in LA.  I had a 'Spicy Redneck' which was bacon wrapped with chili and jalapenos on it.  It wasn't sloppy and definitely hit the spot. Between the hot dogs, the waffle cheese fries and an IPA, I felt a bit dirty but definitely satisfied.",
				"author":  { "id": "18" },
				"picture": "https://lh5.googleusercontent.com/p/AF1QipOySsxz5PtIUcWSZ9x1-MkmdqbB1uSPCgKMbQKa=w90-h90-n-k-no"
			}
		]
	},
	"tags": {
		entity: Tag,
		data: [
			{
				"_id": "57dafbafe73bbf531a10598c",
				"name": "Essentials",
				"type": "Category"
			},
			{
				"_id": "57dafd1277c8e338b97b5dcb",
				"name": "Eat",
				"type": "Category"
			},
			{
				"_id": "57dafd4977c8e338b97b5dcd",
				"name": "Sleep",
				"type": "Category"
			},
			{
				"_id": "57dafd5477c8e338b97b5dcf",
				"name": "Do",
				"type": "Category"
			},
			{
				"_id": "57dafd6a77c8e338b97b5dd1",
				"name": "Sights",
				"type": "Category"
			},
			{
				"_id": "57dafd7577c8e338b97b5dd3",
				"name": "Places",
				"type": "Category"
			},
			{
				"_id": "57dafd8377c8e338b97b5dd5",
				"name": "Transport",
				"type": "Category"
			},
			{
				"_id": "57dafd9477c8e338b97b5dd7",
				"name": "Outdoors",
				"type": "Category"
			},
			{
				"_id": "57dff93177c8e338b97b5dd9",
				"name": "North America",
				"type": "Region"
			},
			{
				"_id": "57dff96277c8e338b97b5ddb",
				"name": "Caribbean",
				"type": "Region"
			},
			{
				"_id": "57dff98377c8e338b97b5ddd",
				"name": "Central America",
				"type": "Region"
			},
			{
				"_id": "57dff99077c8e338b97b5ddf",
				"name": "South America",
				"type": "Region"
			},
			{
				"_id": "57dff99f77c8e338b97b5de1",
				"name": "Northern Europe",
				"type": "Region"
			},
			{
				"_id": "57dff9b377c8e338b97b5de3",
				"name": "Western Europe",
				"type": "Region"
			},
			{
				"_id": "57dff9e477c8e338b97b5de5",
				"name": "Southern Europe",
				"type": "Region"
			},
			{
				"_id": "57dff9f277c8e338b97b5de7",
				"name": "Eastern Europe",
				"type": "Region"
			},
			{
				"_id": "57dffa0277c8e338b97b5de9",
				"name": "Russia",
				"type": "Region"
			},
			{
				"_id": "57dffa1c77c8e338b97b5deb",
				"name": "Middle East",
				"type": "Region"
			},
			{
				"_id": "57dffa1d77c8e338b97b5ded",
				"name": "Central Asia",
				"type": "Region"
			},
			{
				"_id": "57dffa2b77c8e338b97b5def",
				"name": "Eastern Asia",
				"type": "Region"
			},
			{
				"_id": "57dffa3e77c8e338b97b5df1",
				"name": "Southern Asia",
				"type": "Region"
			},
			{
				"_id": "57dffa4e77c8e338b97b5df3",
				"name": "Southeastern Asia",
				"type": "Region"
			}
		]
	},
	"authors": {
		entity: Author,
		data: [
			{
				"_id": "965",
				"name": "Miyah Myles",
				"imageUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=707b9c33066bf8808c934c8ab394dff6",
				"tags": [
					{ "id": "57dafbafe73bbf531a10598c" },
					{ "id": "57dafd1277c8e338b97b5dcb" }
				]
			},
			{
				"_id": "1019",
				"name": "Muhammed Sizemore",
				"imageUrl": "https://images.unsplash.com/photo-1501325087108-ae3ee3fad52f?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=f7f448c2a70154ef85786cf3e4581e4b"
			},
			{
				"_id": "384",
				"name": "Laney Gray",
				"imageUrl": "https://d3iw72m71ie81c.cloudfront.net/female-102.jpg"
			},
			{
				"_id": "689",
				"name": "Asha Kuerten",
				"imageUrl": "http://www.radfaces.com/images/avatars/asha-kuerten.jpg"
			},
			{
				"_id": "675",
				"name": "Atreyu ",
				"imageUrl": "http://www.radfaces.com/images/avatars/atreyu.jpg"
			},
			{
				"_id": "727",
				"name": "Willow Ufgood",
				"imageUrl": "http://www.radfaces.com/images/avatars/willow-ufgood.jpg"
			},
			{
				"_id": "553",
				"name": "ava wright",
				"imageUrl": "https://randomuser.me/api/portraits/women/14.jpg"
			},
			{
				"_id": "97",
				"name": "Tom Holland",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BNTAzMzA3NjQwOF5BMl5BanBnXkFtZTgwMDUzODQ5MTI@._V1_UY256_CR19,0,172,256_AL_.jpg"
			},
			{
				"_id": "1311",
				"name": "Nicole de Boer",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMjk0ZjYzMzgtNjVkMy00MWI0LWI5OWMtZDViOWY4MTY5ZGU0XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_UY256_CR17,0,172,256_AL_.jpg"
			},
			{
				"_id": "54",
				"name": "Ruby Rose",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTcwOTg3NzgyNF5BMl5BanBnXkFtZTgwNzAyNDkyOTE@._V1_UY256_CR42,0,172,256_AL_.jpg"
			},
			{
				"_id": "1363",
				"name": "Beverly D'Angelo",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTMyNTk4ODU5NV5BMl5BanBnXkFtZTcwODU0OTgwMw@@._V1_UY256_CR5,0,172,256_AL_.jpg"
			},
			{
				"_id": "117",
				"name": "Marisol Nichols",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTgyNTA0ODk5Ml5BMl5BanBnXkFtZTgwNjAyMTI3NjE@._V1_UY256_CR15,0,172,256_AL_.jpg"
			},
			{
				"_id": "1116",
				"name": "Kate Winslet",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BODgzMzM2NTE0Ml5BMl5BanBnXkFtZTcwMTcyMTkyOQ@@._V1_UX172_CR0,0,172,256_AL_.jpg"
			},
			{
				"_id": "1123",
				"name": "TimothÃ©e Chalamet",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BOWU1Nzg0M2ItYjEzMi00ODliLThkODAtNGEyYzRkZTBmMmEzXkEyXkFqcGdeQXVyNDk2Mzk2NDg@._V1_UY256_CR11,0,172,256_AL_.jpg"
			},
			{
				"_id": "1383",
				"name": "Chris Zylka",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMjA2NTk3MTIxMV5BMl5BanBnXkFtZTgwMDYyMjQ1OTE@._V1_UY256_CR3,0,172,256_AL_.jpg"
			},
			{
				"_id": "18",
				"name": "Sean Astin",
				"imageUrl": "https://images-na.ssl-images-amazon.com/images/M/MV5BMjEzMjczOTQ1NF5BMl5BanBnXkFtZTcwMzI2NzYyMQ@@._V1_UY256_CR5,0,172,256_AL_.jpg"
			},
			{
				"_id": "684",
				"name": "Sarah Williams",
				"imageUrl": "http://www.radfaces.com/images/avatars/sarah-williams.jpg"
			}
		]
	}
}