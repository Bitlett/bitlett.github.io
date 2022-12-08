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
		if (effNumber > 100) {
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