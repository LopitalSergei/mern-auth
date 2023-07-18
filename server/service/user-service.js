const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../service/mail-service')
const tokenService = require('../service/token-service')
const UserDto = require('../dtos/user-dto')
const userModel = require('../models/user-model')

class UserServie {
	async registration(email, password) {
		// Проверяем есть ли с таким email пользователь в БД
		const candidate = await UserModel.findOne({ email })
		// Если есть выводим ошибку
		if (candidate) {
			throw new Error(`Пользователь с почтовым адресом ${email} уже существует.`)
		}
		// Хэшируем пароль
		const hashPassword = await bcrypt.hash(password, 3)
		// Генерируем ссылку для активации
		const activationLink = uuid.v4()
		// Сохраняем пользователя в БД
		const user = await UserModel.create({ email, password: hashPassword, activationLink })
		// Отправляем на почту письма для акцивации
		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
		// Создаем Data Transfer Object пользователя в котором хранится только его id, email и isActivated
		const userDto = new UserDto(user)
		// Генерируем acces и refresh токены
		const tokens = tokenService.generateToken({ ...userDto })
		// Сохраняем refresh токен в БД
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		// Из функции возвращаем токеты и необходимую информацию о пользователе
		return {
			...tokens,
			user: userDto
		}
	}

	async activate(activationLink) {
		const user = await UserModel.findOne({ activationLink })
		if (!user) {
			throw new Error('Некорректная ссылка активации.')
		}
		user.isActivated = true
		await user.save()
	}
}

module.exports = new UserServie()