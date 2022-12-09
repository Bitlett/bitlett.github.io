function createStatInfoPanel(materials, ings, eff) {


	// delete pre-existing stat info panel
	document.querySelector(".craft").innerHTML = ""


	// now create stat info panel
	var panel = document.createElement("div")
	panel.classList.add("panel")

	var panelContent = document.createElement("div")
	panelContent.classList.add("panelcontent")
	panel.appendChild(panelContent)

	var panelTitleBold = document.createElement("b")
	panelContent.appendChild(panelTitleBold)

	var panelTitle = document.createElement("p")
	panelTitle.innerText = "Recipe Info"
	panelTitle.classList.add("paneltitle")
	panelTitleBold.appendChild(panelTitle)

	var craftingMaterialsText = document.createElement("p")
	craftingMaterialsText.innerText = "Crafting Materials:"
	panelContent.appendChild(craftingMaterialsText)


	// now fill it with info
	for (const material of materials) {
		var craftingMaterial = document.createElement("p")
		craftingMaterial.innerText = "- " + material["count"] + "x " + material["name"]
		panelContent.appendChild(craftingMaterial)
	}

	var ingredientGrid = document.createElement("div")
	ingredientGrid.classList.add("ingredientgrid")
	panelContent.appendChild(ingredientGrid)


	for (const ing of ings) {

		var ingredientBox = document.createElement("div")
		ingredientBox.classList.add("ingredientbox")

		var ingredientName = document.createElement("p")
		ingredientName.innerText = ing
		ingredientBox.appendChild(ingredientName)

		ingredientGrid.appendChild(ingredientBox)
	}


	// finally, append it to the middle of the page
	document.querySelector(".craft").appendChild(panel)


	// fill in with efficiency matrix
	// (possible but not guaranteed)
	if (eff == undefined) { return }
	let i = 0;
	for (const effNumber of eff) {

		const effDisplay = document.createElement("p")
		if (effNumber > 0) {
			effDisplay.classList.add("effdisplaygreen")
		} else if (effNumber == 0) {
			effDisplay.classList.add("effdisplaygray")
		} else if (effNumber < 0) {
			effDisplay.classList.add("effdisplayred")
		}
		effDisplay.innerText = "[" + effNumber + "%]"
		ingredientGrid.childNodes[i].appendChild(effDisplay)

		++i;
	}


	// finally, append it to the middle of the page
	document.querySelector(".craft").appendChild(panel)


}



function createCraftPanel(recipeType, recipeLevel, recipeIngredients, usefulIngs) {

	// delete pre-existing craft panel
	document.querySelector(".stats").innerHTML = ""

	
	// load map stuff
	const backgroundPositionMap = {
		"Helmet": "45.45454545454546%",
		"Chestplate": "54.5454545455%",
		"Leggings": "63.6363636364%",
		"Boots": "72.7272727273%",
		"Ring": "81.8181818182%",
		"Bracelet": "90.9090909091%",
		"Necklace": "100%",
		"Bow": "0%",
		"Spear": "9.09090909091%",
		"Wand": "18.1818181818%",
		"Dagger": "27.2727272727%",
		"Relik": "36.3636363636%"
	}


	// now create craft panel
	var panel = document.createElement("div")
	panel.classList.add("itempanel")

	var panelContent = document.createElement("div")
	panelContent.classList.add("panelcontent")
	panel.appendChild(panelContent)


	// now fill it with info
	var itemIcon = document.createElement("div")
	itemIcon.classList.add("itemicon")
	itemIcon.style.backgroundImage =  "url('/images/new.png')"
	itemIcon.style.backgroundPosition = backgroundPositionMap[recipeType] + " 0"
	panelContent.appendChild(itemIcon)


	var itemTitleBold = document.createElement("b")
	panelContent.appendChild(itemTitleBold)

	var itemTitle = document.createElement("p")
	itemTitle.classList.add("crafttext")
	itemTitle.innerText = "CR-" + encodeCraft(recipes[recipeType + "-" + recipeLevel], recipeIngredients, usefulIngs)
	itemTitleBold.appendChild(itemTitle)

	var STATS = evaluateItem(recipeIngredients, usefulIngs, recipes[recipeType + "-" + recipeLevel])
	const recipe = recipeIDMap[ recipes[recipeType + "-" + recipeLevel][1] ]
	const duraRange = STATS["dura"]
	STATS["dura"] = undefined
	STATS["mindura"] = undefined

	// make sure everything in the stats is bold
	var panelContentBold = document.createElement("b")
	panelContent.appendChild(panelContentBold)

	// health indicator, hide if it cant give/take health
	if (recipe["healthOrDamage"]["minimum"] != 0 || recipe["healthOrDamage"]["maximum"] != 0) {
		var healthText = document.createElement("p")
		healthText.classList.add("healthtext")
		healthText.innerText = "♥ Health: " + recipe["healthOrDamage"]["minimum"] + "-" + + recipe["healthOrDamage"]["maximum"]
		panelContentBold.appendChild(healthText)
	}

	// combat level indicator
	var combatLevel = document.createElement("p")
	combatLevel.classList.add("itemattribute")
	var combatLevelSymbol = document.createElement("a")
	combatLevelSymbol.innerText = "✓ "
	combatLevelSymbol.classList.add("combatlevelsymbol")
	combatLevel.appendChild(combatLevelSymbol)
	var combatLevelText = document.createElement("a")
	combatLevelText.innerText = "Combat Lv. Min: " + recipe["lvl"]["minimum"] + "-" + + recipe["lvl"]["maximum"]
	combatLevel.appendChild(combatLevelText)
	panelContentBold.appendChild(combatLevel)

	// skill point min indicators
	const MINSP = {
		"Strength": STATS["strreq"],
		"Agility": STATS["agireq"],
		"Defense": STATS["defreq"],
		"Intelligence": STATS["intreq"],
		"Dexterity": STATS["dexreq"],
	}
	for (const skill in MINSP) {
		const count = MINSP[skill]
		if (count == 0) { continue; }
		var reqSkill = document.createElement("p")
		reqSkill.classList.add("itemattribute")
		var checkmarkSymbol = document.createElement("a")
		checkmarkSymbol.innerText = "✓ "
		checkmarkSymbol.classList.add("combatlevelsymbol")
		reqSkill.appendChild(checkmarkSymbol)
		var reqSkillText = document.createElement("a")
		reqSkillText.innerText = skill + " Min: " + count
		reqSkill.appendChild(reqSkillText)
		panelContentBold.appendChild(reqSkill)
	}
	STATS["intreq"] = undefined
	STATS["strreq"] = undefined
	STATS["dexreq"] = undefined
	STATS["defreq"] = undefined
	STATS["agireq"] = undefined

	// spacer
	var spacer = document.createElement("p")
	spacer.classList.add("spacer")
	panelContentBold.appendChild(spacer)

	// stat indicators
	for (const stat in STATS) {
		if (STATS[stat][0] == 0 && STATS[stat][1] == 0) {continue}
		if (STATS[stat] == undefined) {continue}
		var statRow = document.createElement("p")
		statRow.classList.add("itemattribute")
		statRow.classList.add("itemstat")
		var statMin = document.createElement("a")
		statMin.innerText = STATS[stat][0] + unitMap[stat]
		statRow.appendChild(statMin)
		var statName = document.createElement("a")
		statName.innerText = statNameMap[stat]
		statRow.appendChild(statName)
		var statMax = document.createElement("a")
		statMax.innerText = STATS[stat][1] + unitMap[stat]
		statRow.appendChild(statMax)
		if( ( effectTypeMap[statNameMap[stat]] && !(STATS[stat][1] > 0) ) || ( !effectTypeMap[statNameMap[stat]] && (STATS[stat][1] > 0) ) ) {
			statMax.classList.add("effdisplaygreen")
		} else {
			statMax.classList.add("effdisplayred")
		}
		if( ( effectTypeMap[statNameMap[stat]] && !(STATS[stat][0] > 0) ) || ( !effectTypeMap[statNameMap[stat]] && (STATS[stat][0] > 0) ) ) {
			statMin.classList.add("effdisplaygreen")
		} else {
			statMin.classList.add("effdisplayred")
		}
		panelContentBold.appendChild(statRow)
	}

	// spacer
	spacer = document.createElement("p")
	spacer.classList.add("spacer")
	panelContentBold.appendChild(spacer)

	// durability
	var duraRow = document.createElement("p")
	duraRow.classList.add("itemattribute")
	duraCraftType = document.createElement("a")
	duraCraftType.classList.add("crafttype")
	duraCraftType.innerText = "Crafted " + recipeType + " "
	duraRow.appendChild(duraCraftType)
	duraText = document.createElement("a")
	duraText.innerText = "[" + duraRange[0] + "-" + duraRange[1] + " Durability]"
	duraText.classList.add("duratext")
	duraRow.appendChild(duraText)
	panelContentBold.appendChild(duraRow)



	document.querySelector(".stats").appendChild(panel)


}