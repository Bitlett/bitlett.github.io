console.log("Executing init...")






// Recipe Type Init
document.querySelectorAll(".recipetype").forEach(function(recipeTypeButton) {
	recipeTypeButton.addEventListener("click", function() {
		document.querySelectorAll(".recipetype").forEach(function(recipeTypeButton) {
			recipeTypeButton.classList.remove("selected")
		})
		recipeTypeButton.classList.add("selected")
	})
})





// Recipe Level Init
const recipeLevels = [
	"1-3",     "3-5",    "5-7",   "7-9",
    "10-13",   "13-15",  "15-17", "17-19",
    "20-23",   "23-25",  "25-27", "27-29",
    "30-33",   "33-35",  "35-37", "37-39",
    "40-43",   "43-45",  "45-47", "47-49",
    "50-53",   "53-55",  "55-57", "57-59",
    "60-63",   "63-65",  "65-67", "67-69",
    "70-73",   "73-75",  "75-77", "77-79",
    "80-83",   "83-85",  "85-87", "87-89",
    "90-93",   "93-95",  "95-97", "97-99",
    "100-103", "103-105"
]

for (const recipeLevel of recipeLevels) {
	var option = document.createElement("option")
	option.setAttribute("value", recipeLevel)
	document.querySelector("#level-choices").appendChild(option)
}





// Desired Stat Init
const craftableIDs = [
    "1st Spell Cost %",
    "1st Spell Raw",
    "2nd Spell Cost %",
    "2nd Spell Raw",
    "3rd Spell Cost %",
    "3rd Spell Raw",
    "4th Spell Cost %",
    "4th Spell Raw",
    "Air Damage %",
    "Air Defense %",
    "Attack Tier",
    "Combat XP Bonus",
    "Earth Damage %",
    "Earth Defense %",
    "Exploding",
    "Fire Damage %",
    "Fire Defense %",
    "Gathering Speed",
    "Gathering XP Bonus",
    "Health Bonus",
    "Health Regen %",
    "Health Regen Raw",
    "Jump Height",
    "Life Steal",
    "Loot Bonus",
    "Loot Quality",
    "Mana Regen",
    "Mana Steal",
    "Melee Damage %",
    "Melee Damage Raw",
    "Poison",
    "Reflection",
    "Soul Point Regen",
    "Spell Damage %",
    "Spell Damage Raw",
    "Sprint Bonus",
    "Sprint Regen Bonus",
    "Stealing",
    "Thorns",
    "Thunder Damage %",
    "Thunder Defense %",
    "Walk Speed Bonus",
    "Water Damage %",
    "Water Defense %"
];

for (const id of craftableIDs) {
	var option = document.createElement("option")
	option.setAttribute("value", id)
	option.innerText = id
	document.querySelector("#stat-choices").appendChild(option)
}





// Constraints Init
newConstraint("Durability", ">=", "150")
document.querySelector(".add-constraint").addEventListener("click", function() {
	newConstraint()
})





// Banned Ingredients Init
document.querySelector(".add-banneding").addEventListener("click", function() {
	newBannedIng()
})










console.log("Init executed!")