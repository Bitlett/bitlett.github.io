function displayError(errorType) {

	if (errorType == "Desired Stat") {
		document.querySelector(".stat-choice").style.backgroundColor = "#DD4444"
		setTimeout(function(){
			document.querySelector(".stat-choice").style.backgroundColor = "#363636"
			setTimeout(function(){
				document.querySelector(".stat-choice").style.backgroundColor = "#DD4444"
				setTimeout(function(){
					document.querySelector(".stat-choice").style.backgroundColor = "#363636"
				}, 150);
			}, 150);
		}, 150);
	}

}