function getCraftInfo() {
	const recipeType = document.querySelector(".selected").classList[1].charAt(0).toUpperCase() + document.querySelector(".selected").classList[1].slice(1);
	
	var recipeLevel = document.querySelector(".level-choice").value
	if (recipeLevel == "") { recipeLevel = "103-105" }

	const desiredStat = statMap[document.querySelector(".stat-choice").value]
	if ( desiredStat == undefined) { return; }

	let craftRequirements = ""
	document.querySelectorAll(".constraint").forEach(function(constraint) {
		const stat = statMap[constraint.querySelector(".stat-choice").value]
		if (stat == "") { return; }
		if (stat == undefined) { return; }
		const operator = constraint.querySelector(".operator-choice").value
		if (operator == "") { return; }
		var number = constraint.querySelector("[type=\"number\"]").value
		if (number == "") { number = "0"; }
		craftRequirements += stat + " " + operator + " " + number + "; "
	})
	craftRequirements = craftRequirements.slice(0, -2)

	let bannedIngredients = []
	document.querySelector(".bannedinglist").querySelectorAll(".stat-choice").forEach(function(bannedIng) {
		bannedIngredients.push(bannedIng.value)
	})



	var materials = materialMap[recipeType + "-" + recipeLevel]
	

	return [recipeType, recipeLevel, desiredStat, craftRequirements, bannedIngredients, materials]
}



// Base 64 encoding tools
// https://stackoverflow.com/a/27696695
// Modified for fixed precision

// Base64.fromInt(-2147483648); // gives "200000"
// Base64.toInt("200000"); // gives -2147483648
Base64 = (function () {
    var digitsStr =
    //   0       8       16      24      32      40      48      56     63
    //   v       v       v       v       v       v       v       v      v
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
    var digits = digitsStr.split('');
    var digitsMap = {};
    for (var i = 0; i < digits.length; i++) {
        digitsMap[digits[i]] = i;
    }
    return {
        fromIntV: function(int32) {
            var result = '';
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0)
                    break;
            }
            return result;
        },
        fromIntN: function(int32, n) {
            var result = '';
            for (let i = 0; i < n; ++i) {
                result = digits[int32 & 0x3f] + result;
                int32 >>= 6;
            }
            return result;
        },
        toInt: function(digitsStr) {
            var result = 0;
            var digits = digitsStr.split('');
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        },
        toIntSigned: function(digitsStr) {
            var result = 0;
            var digits = digitsStr.split('');
            if (digits[0] && (digitsMap[digits[0]] & 0x20)) {
                result = -1;
            }
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        }
    };
})();



function encodeCraft(recipe, ingredients, usefulIngs) {
    let craft_string =  "1" + 
    Base64.fromIntN(usefulIngs[ingredients[0]]["id"], 2) + 
    Base64.fromIntN(usefulIngs[ingredients[1]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[2]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[3]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[4]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[5]]["id"], 2) + 
    Base64.fromIntN(recipe[1],2) + 
    91
    return craft_string;
}



function filterIngredients(recipe, recipeLevel, desiredStat, bannedIngredients, constraints) {
	var usefulIngs = {}
	const usefulLevel = parseInt( recipeLevel.split("-")[1] )
	for (let ing in ingredients) {
		ing = ingredients[ing]

		if ( bannedIngredients.includes(ing["name"]) ) { continue }

		if ( ing["lvl"] > usefulLevel ) { continue }

		if ( !(ing["skills"].includes(recipe[2])) ) { continue }

		let failsConstraints = false
		for (const constraint of constraints) {
			if (constraint[0] == "inglvl") { // inglvl case
				if (constraint[1] == ">") {
					if ( ing["lvl"] <= parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == ">=") {
					if ( ing["lvl"] < parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "==") {
					if ( ing["lvl"] != parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "!=") {
					if ( ing["lvl"] == parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "<=") {
					if ( ing["lvl"] > parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "<") {
					if ( ing["lvl"] >= parseInt(constraint[2]) ) { failsConstraints = true; }
				}
			} else { // ingeff case
				if (constraint[1] == ">") {
					if ( ing["ids"][desiredStat] <= parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == ">=") {
					if ( ing["ids"][desiredStat] < parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "==") {
					if ( ing["ids"][desiredStat] != parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "!=") {
					if ( ing["ids"][desiredStat] == parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "<=") {
					if ( ing["ids"][desiredStat] > parseInt(constraint[2]) ) { failsConstraints = true; }
				}
				if (constraint[1] == "<") {
					if ( ing["ids"][desiredStat] >= parseInt(constraint[2]) ) { failsConstraints = true; }
				}
			}
		}
		if (failsConstraints) {continue}



		// if the ingredient has the desired stat, keep it
		if ( ing["ids"][desiredStat] != undefined ) {
			if ( ing["ids"][desiredStat][0] >= 0 ) { usefulIngs[ing["name"]] = ing }
		}

		// if the ingredient affects the item's durability positively (to a specific minimum degree), keep it
		if ( ing["itemIDs"]["dura"] >= 0 ) {
			usefulIngs[ing["name"]] = ing
		}

		// if the ingredient affects those around it, keep it
		modposValid = false
		for ( const val in ing["posMods"] ) {
			if ( ing["posMods"][val] != 0 ) {
				modposValid = true
				break
			};
		}
		if (modposValid) {
			usefulIngs[ing["name"]] = ing
			continue
		}

	}

	console.log( Object.keys(usefulIngs).length + " Useful ingredients found." )
	console.log( usefulIngs )
	return usefulIngs;
}



function evaluateItem( ingredientNames, usefulIngs, recipe ) {
	const ingredients = [
		usefulIngs[ingredientNames[0]], usefulIngs[ingredientNames[1]],
		usefulIngs[ingredientNames[2]], usefulIngs[ingredientNames[3]],
		usefulIngs[ingredientNames[4]], usefulIngs[ingredientNames[5]]
	]
	const isTouchingTable = [
		[[[false,true],[true,false],[false,false]],[[true,false],[false,true],[false,false]]],[[[true,false],[false,true],[true,false]],[[false,true],[true,false],[false,true]]],[[[false,false],[true,false],[false,true]],[[false,false],[false,true],[true,false]]]
	]
	const notTouchingTable = [
		[
			[
				[false,false],
				[false,true],
				[true,true]
			],
			[
				[false,false],
				[true,false],
				[true,true]
			]
		],[
			[
				[false,true],
				[false,false],
				[false,true]
			],
			[
				[true,false],
				[false,false],
				[true,false]
			]
		],
		[
			[
				[true,true],
				[false,true],
				[false,false]
			],
			[
				[true,true],
				[true,false],
				[false,false]
			]
		]
	]

	// First get the minimum item durability
	let totalMinDurability = recipe[0] * 1.4 // [3,3] materials give the durability a 1.4x multiplier no matter the item type

	// odd constrain types (stored elsewhere)
	let totalAgiReq = 0;
	let totalDefReq = 0;
	let totalDexReq = 0;
	let totalIntReq = 0;
	let totalStrReq = 0;


	let eff = [
		[100,100],
		[100,100],
		[100,100]
	];

	let n = -1
	for (let ing of ingredients) {
		++n

		// First calculate the item's final minimum durability
		totalMinDurability += ing["itemIDs"]["dura"]



		// Now calculate eff matrix
		// y and x will refer to the eff matrix indexes.
		let y = Math.floor(n / 2);
		let x = n % 2;
		
		const posMods = ing["posMods"]
		const above = posMods["above"]
		const under = posMods["under"]
		const left = posMods["left"]
		const right = posMods["right"]
		const touching = posMods["touching"]
		const nottouching = posMods["notTouching"]

		if (above != 0) {
			for (let i = 0; i < y; ++i) {
				eff[i][x] += above
			}
		}

		if (under != 0) {
			for (let i = y+1; i < 3; ++i) {
				eff[i][x] += under
			}
		}

		if (left != 0) {
			for (let j = 0; j < x; ++j) {
				eff[y][j] += left
			}
		}

		if (right != 0) {
			for (let j = x+1; j < 2; ++j) {
				eff[y][j] += right
			}
		}

		if (touching != 0 || nottouching != 0) {
			for (let j = 0; j < 3; ++j) {
				for (let i = 0; i < 2; ++i) {

					eff[j][i] += posMods["touching"] * isTouchingTable[y][x][j][i]

					eff[j][i] += posMods["notTouching"] * notTouchingTable[y][x][j][i]

				}
			}
		}

	}

	// Next, apply eff matrix to desired stat
	eff = eff.flat()

	let stats = {}

	n = -1
	for (let ing of ingredients) {
		++n
		const effectiveness = eff[n]/100
		const itemIDs = ing["itemIDs"]
		const ids = ing["ids"]

		if (effectiveness > 0) {
			for (const id in ids) {
				if (stats[id] == undefined) {
					stats[id] = 0
				}
				stats[id] += Math.floor( ids[id][1] * effectiveness )
			}
		} else {
			for (const id in ids) {
				if (stats[id] == undefined) {
					stats[id] = 0
				}
				stats[id] += Math.floor( ids[id][0] * effectiveness )
			}
		}

		totalAgiReq += Math.floor( itemIDs["agiReq"] * effectiveness )
		totalDefReq += Math.floor( itemIDs["defReq"] * effectiveness )
		totalDexReq += Math.floor( itemIDs["dexReq"] * effectiveness )
		totalIntReq += Math.floor( itemIDs["intReq"] * effectiveness )
		totalStrReq += Math.floor( itemIDs["strReq"] * effectiveness )

	}

	stats["dura"] = Math.floor(totalMinDurability)
	stats["agireq"] = totalAgiReq
	stats["defreq"] = totalDefReq
	stats["dexreq"] = totalDexReq
	stats["intreq"] = totalIntReq
	stats["strreq"] = totalStrReq



	// coolio. now just return the calculated info!
	return stats
}








function bruteforceCraft() {

	const craftInfo = getCraftInfo()
	if (craftInfo == undefined) { return; }

	const recipeType = craftInfo[0]
	const recipeLevel = craftInfo[1]
	const desiredStat = craftInfo[2]
	const craftRequirements = craftInfo[3]
	const bannedIngredients = craftInfo[4]

	const materials = craftInfo[5]

	const recipe = recipes[recipeType + "-" + recipeLevel]

	let reqAsSplit = craftRequirements.split(";")
	let reqAsArray = []
	let ingConstraints = []
	for (var req in reqAsSplit) {
		if (req > 0) { reqAsSplit[req] = reqAsSplit[req].slice(1) } // remove the space
		// if req is inglvl or ingeff, add to ing filter contraints instead
		if ( reqAsSplit[req].split(" ")[0] == "inglvl" || reqAsSplit[req].split(" ")[0] == "ingeff" ) {
			ingConstraints.push( reqAsSplit[req].split(" ") )
			continue;
		}
		reqAsArray[req] = reqAsSplit[req].split(" ") // otherwise just register normally
	}

	const usefulIngs = filterIngredients(recipe, recipeLevel, desiredStat, bannedIngredients, ingConstraints)

	const bestCraftSharedWorker = new SharedWorker('./js/best_craft_sharedworker.js');

	bestCraftSharedWorker.port.onmessage = (e) => {

		// progress indicator
		if (e.data[0] == 202) {
			document.querySelectorAll(".ingredientbox").forEach(function(ingbox) {
				ingbox.childNodes[0].innerText = "Loading... (" + e.data[1].toFixed(1) + "%)"
			})
			return
		}

		// solution found! now display it!
		const ings = e.data[1]
		const eff = e.data[2]
		createStatInfoPanel(
			// materials
			[
				{
					"name": materials[0]["item"],
					"count": materials[0]["amount"],
				}, {
					"name": materials[1]["item"],
					"count": materials[1]["amount"],
				}
			],
	
			// ings
			ings,

			// eff
			eff
		)

		// display the item itself
		const itemStats = evaluateItem(ings, usefulIngs, recipe)
		createCraftPanel(recipeType, recipeLevel, ings, usefulIngs)
	}


	createStatInfoPanel(
		// materials
		[
			{
				"name": materials[0]["item"],
				"count": materials[0]["amount"],
			}, {
				"name": materials[1]["item"],
				"count": materials[1]["amount"],
			}
		],

		// ings
		[
			"Loading...", "Loading...",
			"Loading...", "Loading...",
			"Loading...", "Loading..."
		]
	)

	bestCraftSharedWorker.port.postMessage( [recipe, reqAsArray, desiredStat, usefulIngs] )



}