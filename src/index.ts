
import { logger } from './logger'
import Colors from 'colors/safe'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {ethers, Wallet} from 'ethers'
import {inspect} from 'node:util'
import {request as requestHttps, RequestOptions} from 'node:https'
import Phin from 'phin'
import TelegramBot from "node-telegram-bot-api"

let pageLocked = false
let wallet: Wallet
const postPool: taskPoolObj[] = []
const chatId = '@conettest'			//'-2357293635'

const startGossip = (url: string, POST: string, callback: (err?: string, data?: string) => void) => {
	const Url = new URL(url)

	const option: RequestOptions = {
		hostname: Url.hostname,
		port: 443,
		method: 'POST',
		protocol: 'https:',
		headers: {
			'Content-Type': 'application/json;charset=UTF-8'
		},
		path: Url.pathname
	}

	let first = true
	logger(inspect(option, false, 3, true))
	const kkk = requestHttps(option, res => {

		if (res.statusCode !==200) {
			res.destroy()
			return setTimeout(() => {
				startGossip(url, POST,callback )
				return logger(`startTestMiner got res.statusCode = [${res.statusCode}] != 200 error! restart`)
			}, 1000)
			
		}

		let data = ''
		let _Time: NodeJS.Timeout

		res.on ('data', _data => {

			data += _data.toString()
			
			if (/\r\n\r\n/.test(data)) {
				clearTimeout(_Time)
				if (first) {
					first = false
				}
				callback ('', data)
				data = ''
				
			}
		})

		res.once('error', err => {
			kkk.destroy()
			logger(Colors.red(`startGossip [${url}] res on ERROR! Try to restart! `), err.message)
			return startGossip (url, POST, callback)
		})

		res.once('end', () => {
			kkk.destroy()
			logger(Colors.red(`startGossip [${url}] res on END! Try to restart! `))
			return startGossip (url, POST, callback)
		})
		
	})

	// kkk.on('error', err => {
	// 	kkk.destroy()
	// 	logger(Colors.red(`startGossip [${url}] requestHttps on Error! Try to restart! `), err.message)
	// 	return startGossip (url, POST, callback)
	// })

	kkk.end(POST)

}

const listenAPIServer = async () => {
	const apiServer = 'https://apiv3.conet.network/api/tg-listen'
	const message = JSON.stringify({walletAddress: wallet.address.toLowerCase()})
	const signMessage = await wallet.signMessage(message)
	const post = JSON.stringify({message, signMessage})
	let first = true
	startGossip(apiServer, post, (err, data) => {
		if (first) {
			first = false
			if (err) {
				
				return logger(Colors.magenta(`listenAPIServer startGossip return Error! ${err} restart!`))
			}
			return logger(Colors.blue(`listenAPIServer startGossip connecting API success!`))
		}
		logger(Colors.blue(`listenAPIServer got message from API`), data)
		if (data) {
			data = data.replace('\r\n', '')
			try {
				const kk = JSON.parse(data)
				const taskPoolObj: taskPoolObj = {
					checkAccount: kk.data[0],
					uuid: kk.uuid,
					result: {
						isInTGGroup: false,
						status: 200
					},
					walletAddress: kk.walletAddress
				}
				postPool.push(taskPoolObj)
				
			} catch (ex) {
				return logger(Colors.magenta(`startGossip got format error data from API`))
			}

			return searchAccount()
		}
		
	})
}


const callbackTwitter = async (obj: taskPoolObj) => {

	logger(Colors.blue(`callbackTwitter to API`))
	logger(inspect(obj, false, 3, true))
	const url = 'https://apiv3.conet.network/api/tg-callback'
	const message = JSON.stringify({walletAddress: wallet.address.toLowerCase(), data:obj })
	const signMessage = await wallet.signMessage(message)
	const data = {message, signMessage}
	const req = await Phin({
		url,
		method: 'POST',
		data
	})

	logger(req.body.toJSON())
}

const searchAccount = async () => {
	if (!bot) {
		return 
	}

	const task = postPool.shift()
	if (!task) {
		logger(Colors.gray(`postPool has empty!`))
		return
	}
	pageLocked = true
	const telegramAccount = parseInt(task.checkAccount)

	if ( isNaN(telegramAccount )) {
		
		task.result.status = 404
		await callbackTwitter(task)
		pageLocked = false
		searchAccount()
		return 
	}

	

	bot.getChatMember(chatId, telegramAccount).then(async () => {
		logger(Colors.blue(`search Telegram Account ${telegramAccount} is in group!`))
		task.result.isInTGGroup = true
		await callbackTwitter(task)
		pageLocked = false
		searchAccount()
		return 

	}).catch(async ex => {
		task.result.isInTGGroup = false
		logger(Colors.red(`getChatMember has EX ${ex.message}`))
		await callbackTwitter(task)
		pageLocked = false
		searchAccount()
	})
}

let bot: TelegramBot|null = null

const startTeleBot = async (BOT_TOKEN: string) => {
	bot = new TelegramBot(BOT_TOKEN, {polling: true})
	logger(Colors.blue(`BOT_TOKEN = ${BOT_TOKEN}`))

	bot.on('message', message => {
		logger(Colors.blue(`bot.on('channel_post'`))
		const chatId = message?.chat?.id
		const msg = chatId && message?.text && /^\/id$/.test(message?.text)? `Your ID is ${chatId}`: `/id to show your Telegram ID`
			
		
		if (bot && chatId) {
			return bot.sendMessage(chatId, msg)
		}
		
	})
	//		'@conettest'
	//	bot.sendMessage('@conettest', 'hello')
}

const start = async () => {
	const filePath = join(__dirname,'.telegram.token')
	logger(Colors.magenta(`filePath ${filePath}`))
	const kk = readFileSync(filePath,'utf-8')
	const account: account = JSON.parse(kk)

	wallet = new ethers.Wallet(account.postAccount)
	startTeleBot(account.account)
	listenAPIServer()
	
}

start()
