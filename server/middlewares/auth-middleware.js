const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
	try {
		const authorizationHeader = req.headers.authorization
		if (!authorizationHeader) {
			return next(ApiError.UnAutorazedError())
		}
		const accesToken = authorizationHeader.split(' ')[1]
		if (!accesToken) {
			return next(ApiError.UnAutorazedError())
		}

		const userData = tokenService.validateAccesToken(accesToken)
		if (!userData) {
			return next(ApiError.UnAutorazedError())
		}

		req.user = userData
		next()
	} catch (e) {
		return next(ApiError.UnAutorazedError())
	}
}