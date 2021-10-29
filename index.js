const fetch = require("node-fetch");

async function getChamel () {
	const sources = {
		"ChamelXETH": "https://api.primexbt.com/v2/public/covesting/strategies/11726/yield/history/1m", 
		"ChamelXUSDT": "https://api.primexbt.com/v2/public/covesting/strategies/11727/yield/history/1m", 
		"ChamelX3": "https://api.primexbt.com/v2/public/covesting/strategies/12124/yield/history/1m"
	};
	
	let results = {};
	for (const source in sources) {
		const response = await fetch(sources[source]);
		let dataArray = (await response.json()).data;
		
		results[source] = [];
		for (let i = dataArray.length - 10; i < dataArray.length; i++) {
			results[source].push(dataArray[i][1]);
		}
	}
	
	return results;
}

async function getCoinGecko () {
	const sources = {
		"ETH/USD": "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1", 
		"USDT/USD": "https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=usd&days=1", 
		"BTC/USD": "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1"
	};
	
	let results = {};
	for (const source in sources) {
		const response = await fetch(sources[source]);
		let dataArray = (await response.json()).prices;
		
		results[source] = [];
		for (let i = dataArray.length - 10; i < dataArray.length; i++) {
			results[source].push(dataArray[i][1]);
		}
	}
	
	return results;
}

function normalize (sources) {
	for (const source in sources) {
		let replacementArray = [];
		for (let i = 0; i < 9; i++) {
			replacementArray.push(sources[source][i + 1] / sources[source][i]);
		}
		
		sources[source] = replacementArray;
	}
	
	return sources;
}

function compare (chamel, coinGecko) {
	let confidenceLevelMatrix = {
		"ChamelXETH": {}, 
		"ChamelXUSDT": {}, 
		"ChamelX3": {}
	};
	
	for (const chamelPart in chamel) {
		for (const coinGeckoPart in coinGecko) {
			let leverages = [];
			for (let i = 0; i < 9; i++) {
				leverages[i] = chamel[chamelPart][i] / coinGecko[coinGeckoPart][i];
			}
			
			// Get average leverage
			let averageLeverage = 0;
			for (let i = 0; i < 9; i++) {
				averageLeverage += leverages[i] / 9;
			}
			
			// Get leverage change
			let leverageChange = 0;
			for (let i = 0; i < 8; i++) {
				leverageChange += Math.abs((leverages[i + 1] / leverages[i]) - 1);
			}
			
			confidenceLevelMatrix[chamelPart][coinGeckoPart] = {averageLeverage, leverageChange};
		}
	}
	
	return confidenceLevelMatrix;
}

const cron = require("node-cron");

// Run once every 10 minutes
cron.schedule("*/10 * * * *", async function () {
	const chamel = normalize(await getChamel());
	const coinGecko = normalize(await getCoinGecko());
	let confidenceLevelMatrix = compare(chamel, coinGecko);
	
	// If Chamel is investing in multiple coins at the same time within the same strategy, only output the one whose leverageChange is the lowest among all coins within the same strategy
	let lowests = {
		"ChamelXETH": null, 
		"ChamelXUSDT": null, 
		"ChamelX3": null
	};
	
	for (const chamelPart in confidenceLevelMatrix) {
		for (const coinGeckoPart in confidenceLevelMatrix[chamelPart]) {
			let comparison = confidenceLevelMatrix[chamelPart][coinGeckoPart];
			if (comparison.leverageChange <= 0.0001) {
				if (lowests[chamelPart] === null || comparison.leverageChange < lowests[chamelPart].leverageChange) {
					lowests[chamelPart] = {
						"coinGeckoPart": coinGeckoPart, 
						"averageLeverage": comparison.averageLeverage, 
						"leverageChange": comparison.leverageChange
					};
				}
			}
		}
		
		if (lowests[chamelPart] !== null) {
			console.log("On Unix time " + (new Date()).getTime() + ", " + chamelPart + " is investing at " + lowests[chamelPart].coinGeckoPart + " with a/an " + lowests[chamelPart].averageLeverage + " leverage. ");
		}
	}
});

console.log("Warning: Smellyfeet Law does not work if Chamel is investing in multiple coins at the same time, or in coins other than Bitcoin, Ethereum or USDT. In such cases, Smellyfeet Law will close all orders that it is currently in to avoid losing money. ");