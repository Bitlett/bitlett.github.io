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



function encodeCraft(recipeType, recipeLevel, ingredients) {
    let craft_string =  "1" + 
    Base64.fromIntN(usefulIngs[ingredients[0]]["id"], 2) + 
    Base64.fromIntN(usefulIngs[ingredients[1]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[2]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[3]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[4]]["id"], 2) +
    Base64.fromIntN(usefulIngs[ingredients[5]]["id"], 2) + 
    Base64.fromIntN(recipes[recipeType + "-" + recipeLevel][1],2) + 
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