const Web3 = require('web3')
const validateTransaction = require('./validate')
const confirmEtherTransaction = require('./confirm')

function watchEtherTransfers() {
  // Instantiate web3 with WebSocket provider
  const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://bsc-testnet.s.chainbase.online/v1/2K6ECrKZfyWQaKFwlBIMNptRAI6'))
  // Instantiate subscription object
  const subscription = web3.eth.subscribe('pendingTransactions')

  // Subscribe to pending transactions
  subscription.subscribe((error, result) => {
    if (error) console.log(error)
  })
    .on('data', async (txHash) => {
      try {
        // Instantiate web3 with HttpProvider
        const web3Http = new Web3('https://bsc-testnet.s.chainbase.online/v1/2K6ECrKZfyWQaKFwlBIMNptRAI6')

        // Get transaction details
        const trx = await web3Http.eth.getTransaction(txHash)

        const valid = validateTransaction(trx)
        // If transaction is not valid, simply return
        if (!valid) return

        console.log('Found incoming Ether transaction to ' + process.env.WALLET_TO);
        console.log('Transaction value is: ' + process.env.AMOUNT)
        console.log('Transaction hash is: ' + txHash + '\n')

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