const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
	UserInputError,
} = require('apollo-server');
const SECRET_KEY =
	require('../../keys').SECRET_KEY;
const {
	validateRegisterInput,
	validateLoginInput,
} = require('../../utils/validators');
// function generateToken(x) {
// 	jwt.sign(
// 		{
// 			id: x.id,
// 			username: x.username,
// 			email: x.email,
// 		},
// 		SECRET_KEY,
// 		{ expiresIn: '1h' }
// 	);
// }
module.exports = {
	Mutation: {
		async login(_, { username, password }) {
			const { valid, errors } =
				validateLoginInput(username, password);
			if (!valid) {
				throw new UserInputError('Errors', {
					errors,
				});
			}
			const user = await User.findOne({
				username,
			});

			if (!user) {
				errors.general = 'User not found';
				throw new UserInputError(
					'User not found',
					{ errors }
				);
			}
			const match = await bcrypt.compare(
				password,
				user.password
			);
			if (!match) {
				errors.general = 'Wrong credentials';
				throw new UserInputError(
					'Wrong credentials',
					{ errors }
				);
			}

			const token = jwt.sign(
				{
					id: user.id,
					username: user.username,
					email: user.email,
				},
				SECRET_KEY,
				{ expiresIn: '1h' }
			);
			return {
				...user._doc,
				id: user._id,
				token,
			};
		},

		async register(
			_,
			{
				registerInput: {
					username,
					password,
					confirmPassword,
					email,
				},
			}
		) {
			//Validate User Data
			const { valid, errors } =
				validateRegisterInput(
					username,
					password,
					confirmPassword,
					email
				);

			if (!valid) {
				throw new UserInputError('Errors', {
					errors,
				});
			}
			//Make sure user doesnt already exist
			const user = await User.findOne({
				username,
			});
			if (user) {
				throw new UserInputError(
					'Username is taken',
					{
						errors: {
							username:
								'This username is already taken',
						},
					}
				);
			}
			// Hash the password and create auth token
			password = await bcrypt.hash(password, 12);
			const newUser = new User({
				username,
				password,
				email,
				createdAt: new Date().toISOString(),
			});

			const res = await newUser.save();

			const token = jwt.sign(
				{
					id: res.id,
					username: res.username,
					email: res.email,
				},
				SECRET_KEY,
				{ expiresIn: '1h' }
			);

			return {
				...res._doc,
				id: res._id,
				token,
			};
		},
	},
};
