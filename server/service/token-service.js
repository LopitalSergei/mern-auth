const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')

class TokenService {
	generateToken(payload) {
		const accesToken = jwt.sign(payload, process.env.JWT_ACCES_SECRET_KEY, { expiresIn: '30m' })
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '30d' })
		return {
			accesToken,
			refreshToken
		}
	}

	async saveToken(userId, refreshToken) {
		const tokenData = await tokenModel.findOne({ user: userId })
		if (tokenData) {
			tokenData.refreshToken = refreshToken
			return tokenData.save()
		}
		const rToken = await tokenModel.create({ user: userId, refreshToken })
		return rToken
	}

	async removeToken(refreshToken) {
		const tokenData = await tokenModel.deleteOne({ refreshToken })
		return tokenData
	}
}

module.exports = new TokenService()