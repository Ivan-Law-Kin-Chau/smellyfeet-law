# Smellyfeet Law

Chamel is a brilliant investor on PrimeXBT. However, according to some people, he always makes the best predictions, but executes them too early. This is a bot that tries to correct this. Assuming that Chamel invests in BTC, ETH and USDT, one coin at a time, it would be possible to compare the graphs of his strategies with the price charts of BTC, ETH and USDT once every ten minutes, to deduce what coin is he investing in and what leverage is he using, whenever he makes an investment. 

With this information, this bot could remember the past investments that Chamel made and then execute them with a delay to correct the problem of Chamel executing too early. However, due to the failure to correlate the graphs of Chamel's strategies and the price charts of BTC, ETH and USDT, this bot is unfortunately a failure. Hence, development has been aborted. 

The source code has been open sourced though, in case there is a better developer than me who would want to pick up the slack and continue developing this bot. 

## Technologies Used

 - Node.js
 - node-fetch
 - node-cron