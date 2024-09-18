import Phin from 'phin'
import {ethers} from 'ethers'
import { logger } from './logger'
import {inspect} from 'node:util'
import Colors from 'colors/safe'

const start = async () => {
    
	const acc = ethers.Wallet.createRandom()
	const url = 'https://apiv3.conet.network/api/tg-check-follow'
	const checkTwitterAccount = '580254434'
	const messageObj: minerObj = {
		walletAddress: acc.address.toLowerCase(),
		data: [checkTwitterAccount]
	}
	const message = JSON.stringify(messageObj)
	const signMessage = await acc.signMessage(message)
	const data = {message, signMessage}
	const req = await Phin({
		url,
		method: 'POST',
		data
	})
	try {
		const result = JSON.parse(req.body.toString())
		logger(inspect(result, false, 3, true))
	} catch (ex) {
		logger(Colors.red(`test Tegegram JSON parse ERROR`))
		return logger(req.body.toString())
	}
}

start()