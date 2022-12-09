onconnect = (e) => {
	const port = e.ports[0]

	port.onmessage = (e) => {
		const recipe = e.data[0]
		const reqAsArray = e.data[1]
		const desiredStat = e.data[2]
		const usefulIngs = e.data[3]

		var bestIngs = [];
		var bestStat = 0;
		var bestDura = 0;
		var bestEff = [100, 100, 100, 100, 100, 100]
		
		let i2loopcount = 0;
		for (const i1 in usefulIngs) {
			for (const i2 in usefulIngs) {
				port.postMessage( [202, 100 * i2loopcount / (Object.keys( usefulIngs ).length)**2] );
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
									)
								) {
		
									// normally we would call evaluateItem here which returns the item stats,
									// but if we do that here it just says the function doesnt exist
									// so i guess i'm just gonna paste the whole FUCKING function here! :D
									const ingredients = [
										usefulIngs[i1], usefulIngs[i2],
										usefulIngs[i3], usefulIngs[i4],
										usefulIngs[i5], usefulIngs[i6]
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
									
									stats["mindura"] = Math.floor(totalMinDurability)
									stats["agireq"] = totalAgiReq
									stats["defreq"] = totalDefReq
									stats["dexreq"] = totalDexReq
									stats["intreq"] = totalIntReq
									stats["strreq"] = totalStrReq
								
									stats["sumsp"]  = stats["agi"] + stats["def"] + stats["dex"] + stats["dex"] + stats["int"] + stats["str"]
									stats["summs"]  = stats["mr"] + stats["ms"]
									stats["sumls"]  = stats["hprRaw"] * stats["hprPct"] + stats["ls"]

								
								
									// coolio. now just return the calculated info!
									// correction: just copy it to a constant
									const STATS = stats




									const DURA = STATS["mindura"]
		
									reqValid = true
									// check if the item complies with custom requirements
									for (const req of reqAsArray) {
										const VAR1 = req[0]
										const OPERATOR = req[1]
										const VAR2 = parseFloat(req[2])
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
											bestEff = eff
										}
									}
		
								}
		
							}
						}
					}
				}
			}
		}

		// best ingredients found!
		port.postMessage( [200, bestIngs, bestEff] );

	}

}