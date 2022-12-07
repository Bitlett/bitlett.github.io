function getCraftInfo() {
	const recipeType = document.querySelector(".selected").classList[1].charAt(0).toUpperCase() + document.querySelector(".selected").classList[1].slice(1);
	
	var recipeLevel = document.querySelector(".level-choice").value
	if (recipeLevel == "") { recipeLevel = "103-105" }

	const desiredStat = statMap[document.querySelector(".stat-choice").value]
	if ( desiredStat == undefined) { displayError("Desired Stat"); return; }

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

	return [recipeType, recipeLevel, desiredStat, craftRequirements, bannedIngredients]
}



function bruteforceCraft() {

	const craftInfo = getCraftInfo()
	if (craftInfo == undefined) { return; }

	const recipeType = craftInfo[0]
	const recipeLevel = craftInfo[1]
	const desiredStat = craftInfo[2]
	const craftRequirements = craftInfo[3]
	const bannedIngredients = craftInfo[4]

}