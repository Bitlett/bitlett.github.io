function newBannedIng() {



	// create container for everything else
	var banneding = document.createElement("div")
	banneding.classList.add("constraint")



	// create box for ing
	var ingBox = document.querySelector(".stat-choice").cloneNode(true)
	ingBox.setAttribute("placeholder", "Large Lapis")
	ingBox.classList.add("constraint-child")
	ingBox.style.width = "91.5%"
	ingBox.value = ""
	banneding.appendChild(ingBox)

	// add ingbox data
	var ingBoxDatalist = document.querySelector("#stat-choices").cloneNode(true)
	banneding.appendChild(ingBoxDatalist)



	// add deletion button
	var deleteButton = document.createElement("a")
	deleteButton.innerText = "–"
	deleteButton.style.fontSize = "24px"
	deleteButton.classList.add("remove-constraint")
	banneding.appendChild(deleteButton)
	deleteButton.addEventListener("click", function() {
		deleteButton.parentElement.parentElement.removeChild(deleteButton.parentElement)
	})



	document.querySelector(".bannedinglist").appendChild(banneding)
	banneding.after( document.querySelector(".add-banneding") )
}