const Web3 = require('web3')
const validateTransaction = require('./validate')
const confirmEtherTransaction = require('./confirm')

function watchEtherTransfers() {
  // Instantiate web3 with WebSocket provider
  const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WSS_URL))
  // Instantiate subscription object
  const subscription = web3.eth.subscribe('pendingTransactions')

  // Subscribe to pending transactions
  subscription.subscribe((error, result) => {
    if (error) console.log(error)
  })
    .on('data', async (txHash) => {
      try {
        // Instantiate web3 with HttpProvider
        const web3Http = new Web3(process.env.HTTP_URL)

        // Get transaction details
        const trx = await web3Http.eth.getTransaction(txHash)

        const valid = validateTransaction(trx)
        // If transaction is not valid, simply return
        if (!valid) return

        console.log('Found incoming Ether transaction to ' + process.env.WALLET_TO);

        // Initiate transaction confirmation
        confirmEtherTransaction(txHash)

        // Unsubscribe from pending transactions.
        subscription.unsubscribe()
      }
      catch (error) {
        console.log(error)
      }
    })
}

module.exports = {
  watchEtherTransfers
}