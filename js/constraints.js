function newConstraint(stat, operator, number) {



	// create container for everything else
	var constraint = document.createElement("div")
	constraint.classList.add("constraint")



	// create box for stat
	var statBox = document.querySelector(".stat-choice").cloneNode(true)
	statBox.setAttribute("placeholder", "Durability")
	statBox.classList.add("constraint-child")
	statBox.style.width = "47.5%"
	constraint.appendChild(statBox)

	// add statbox data
	var statBoxDatalist = document.querySelector("#stat-choices").cloneNode(true)
	constraint.appendChild(statBoxDatalist)



	// create box for operator
	var operatorBox = document.querySelector(".stat-choice").cloneNode(true)
	operatorBox.classList.remove("stat-choice")
	operatorBox.classList.add("operator-choice")
	operatorBox.classList.add("constraint-child")
	operatorBox.setAttribute("placeholder", ">=")
	operatorBox.setAttribute("list", "operator-choices")
	operatorBox.style.width = "15%"
	constraint.appendChild(operatorBox)

	// add operatorbox data
	var operatorBoxDatalist = document.querySelector("#stat-choices").cloneNode(false)
	operatorBoxDatalist.setAttribute("id", "operator-choices")
		var base = document.createElement("option")
		var temp = base.cloneNode(false); temp.setAttribute("value", ">"); operatorBoxDatalist.appendChild( temp );
		var temp = base.cloneNode(false); temp.setAttribute("value", ">="); operatorBoxDatalist.appendChild( temp );
		var temp = base.cloneNode(false); temp.setAttribute("value", "=="); operatorBoxDatalist.appendChild( temp );
		var temp = base.cloneNode(false); temp.setAttribute("value", "!="); operatorBoxDatalist.appendChild( temp );
		var temp = base.cloneNode(false); temp.setAttribute("value", "<="); operatorBoxDatalist.appendChild( temp );
		var temp = base.cloneNode(false); temp.setAttribute("value", "<"); operatorBoxDatalist.appendChild( temp );
	constraint.appendChild(operatorBoxDatalist)



	// add number box
	var numberBox = document.createElement("input")
	numberBox.setAttribute("type", "number")
	numberBox.classList.add("constraint-child")
	numberBox.style.width = "20%"
	constraint.appendChild(numberBox)



	// add deletion button
	var deleteButton = document.createElement("a")
	deleteButton.innerText = "–"
	deleteButton.style.fontSize = "24px"
	deleteButton.classList.add("remove-constraint")
	constraint.appendChild(deleteButton)
	deleteButton.addEventListener("click", function() {
		deleteButton.parentElement.parentElement.removeChild(deleteButton.parentElement)
	})



	// fill in supplied info (if given)
	if (stat != undefined) {
		statBox.value = stat
	}
	if (operator != undefined) {
		operatorBox.value = operator
	}
	if (number != undefined) {
		numberBox.value = number
	}




	document.querySelector(".constraintlist").appendChild(constraint)
	constraint.after( document.querySelector(".add-constraint") )
}