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



function filterIngredients(recipe, recipeLevel, desiredStat, bannedIngredients) {
	var usefulIngs = {}
	const usefulLevel = parseInt( recipeLevel.split("-")[1] )
	for (let ing in ingredients) {
		ing = ingredients[ing]
		ing["modsPos"] = false

		if ( bannedIngredients.includes(ing["name"]) ) { continue }

		if ( ing["lvl"] > usefulLevel ) { continue }

		if ( !(ing["skills"].includes(recipe[2])) ) { continue }



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
			ing["modsPos"] = true
			usefulIngs[ing["name"]] = ing
			continue
		}

	}

	return usefulIngs;
}



function findBestCraft(recipe, reqAsArray, desiredStat, usefulIngs) {
	var bestIngs = [];
	var bestStat = 0;
	var bestDura = 0;
	
	let i2loopcount = 0;
	for (const i1 in usefulIngs) {
		for (const i2 in usefulIngs) {
			console.log( 100 * i2loopcount / (Object.keys( usefulIngs ).length)**2 );
			i2loopcount += 1;
			for (const i3 in usefulIngs) {
				for (const i4 in usefulIngs) {
					for (const i5 in usefulIngs) {
						for (const i6 in usefulIngs) {
	
							if (
								(
									usefulIngs[i1]["ids"][desiredStat] != undefined ||
									usefulIngs[i2]["ids"][desiredStat] != undefined ||
									usefulIngs[i3]["ids"][desiredStat] != undefined ||
									usefulIngs[i4]["ids"][desiredStat] != undefined ||
									usefulIngs[i5]["ids"][desiredStat] != undefined ||
									usefulIngs[i6]["ids"][desiredStat] != undefined
								) || (
									false
								)
							) {
	
								const STATS = evaluateItem( [i1, i2, i3, i4, i5, i6], recipe, usefulIngs )
								const DURA = STATS["dura"]
	
								reqValid = true
								// check if the item complies with custom requirements
								for (const req of reqAsArray) {
									const VAR1 = req[0]
									const OPERATOR = req[1]
									const VAR2 = req[2]
									if (STATS[VAR1] == undefined) { continue; }
	
									if (OPERATOR == "==") {
										if ( !(STATS[VAR1] == VAR2) ) {
											reqValid = false
											break
										}
									} else
	
									if (OPERATOR == "!=") {
										if ( !(STATS[VAR1] != VAR2) ) {
											reqValid = false
											break
										}
									} else
	
									if (OPERATOR == ">") {
										if ( !(STATS[VAR1] > VAR2) ) {
											reqValid = false
											break
										}
									} else
	
									if (OPERATOR == ">=") {
										if ( !(STATS[VAR1] >= VAR2) ) {
											reqValid = false
											break
										}
									} else
	
									if (OPERATOR == "<") {
										if ( !(STATS[VAR1] < VAR2) ) {
											reqValid = false
											break
										}
									} else
	
									if (OPERATOR == "<=") {
										if ( !(STATS[VAR1] <= VAR2) ) {
											reqValid = false
											break
										}
									}
	
								}
	
								if ( reqValid )  {
									if ( (STATS[desiredStat] > bestStat) || ( (STATS[desiredStat] == bestStat) && (DURA > bestDura) ) ) {
										bestIngs = [i1, i2, i3, i4, i5, i6]
										bestStat = STATS[desiredStat]
										bestDura = DURA
										console.log("New Best!", bestStat, STATS, bestIngs)
									}
								}
	
							}
	
						}
					}
				}
			}
		}
	}
	return bestIngs;
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

	let reqAsArray = craftRequirements.split(";")
	for (var req in reqAsArray) {
		if (req > 0) { reqAsArray[req] = reqAsArray[req].slice(1) }
		reqAsArray[req] = reqAsArray[req].split(" ")
	}

	const usefulIngs = filterIngredients(recipe, recipeLevel, desiredStat, bannedIngredients)

	const bestCraftSharedWorker = new SharedWorker('./js/best_craft_sharedworker.js');

	bestCraftSharedWorker.port.onmessage = (e) => {
		console.log(e.data);
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


	// const bestCraft = findBestCraft(recipe, reqAsArray, desiredStat, usefulIngs)

	// console.log(bestCraft)



}