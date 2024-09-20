
import { logger } from './logger'
import Colors from 'colors/safe'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {IncomingMessage} from 'node:http'
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
	let res: IncomingMessage|null = null
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
			
			logger(Colors.red(`startGossip [${url}] res on ERROR! Try to restart! `), err.message)
			startGossip(url, POST,callback )
		})

		res.once('end', () => {
			res.destroy()
			logger(Colors.red(`res on end! destroy res!`))

		})
		
	})


	kkk.end(POST)

	kkk.once ('error', err => {
		logger(`startGossip requestHttps on Error! restart again! ${err.message}`)
		return startGossip (url, POST, callback)
	})
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
				logger(inspect(data, false, 3, true))
				return logger(Colors.magenta(`startGossip got JSON error data from API `))
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

const _searchAccount: (telegramAccount: number) => Promise<result> = (telegramAccount: number) => new Promise(resolve => {
	

	if (!bot) {
		const result: result = {
			status: 501,
			message: 'CONET Telegram account check Bot has issue',
			isInTGGroup: false
		}
		return resolve(result)
	}

	const result: result = {
		status: 200,
		isInTGGroup: false,
		userID: telegramAccount
	}

	bot.getChatMember(chatId, telegramAccount).then(async () => {
		result.isInTGGroup = true
		return resolve(result)

	}).catch(async ex => {
		return resolve(result)
	})
})

const searchAccount = async () => {

	
	const task = postPool.shift()
	if (!task) {
		return logger(Colors.gray(`postPool has empty!`))
		
	}
	pageLocked = true
	const telegramAccount = parseInt(task.checkAccount)

	if ( isNaN(telegramAccount )) {
		task.result = {
			status: 404,
			message: `Invalid Telegram User ID`,
			userID: telegramAccount
		}
		await callbackTwitter(task)
		pageLocked = false
		searchAccount()
		return 
	}
	task.result = await _searchAccount(telegramAccount)
	await callbackTwitter(task)
	pageLocked = false
	searchAccount()
}

let bot: TelegramBot|null = null

const startTeleBot = async (BOT_TOKEN: string) => {
	bot = new TelegramBot(BOT_TOKEN, {polling: true})
	logger(Colors.blue(`BOT_TOKEN = ${BOT_TOKEN}`))

	bot.on('message', message => {
		logger(Colors.blue(`bot.on('channel_post'`))
		const chatId = message?.chat?.id
		const msg = chatId && message?.text && /^\/id$/.test(message?.text)? `Your ID is ${chatId}`: null
			
		
		if (bot && chatId && msg) {
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
