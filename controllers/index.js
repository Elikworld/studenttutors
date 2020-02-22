const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.registerPage = (req, res) => {
	res.render('index', {
		layout: 'formlayout2',
		errors: req.flash('errors')
	});
};
exports.registerUser = (req, res) => {
	const { fullname, email, password, level, profile_details, role } = req.body;
	const errors = validationResult(req);
	const output = errors.array();

	if (!errors.isEmpty()) {
		req.flash(
			'errors',
			output.map(err => err.msg)
		);
		res.redirect('/user/register');
	} else {
		User.findOne({ email: email })
			.then(found => {
				if (found) {
					req.flash('errors', 'Email already exists');
					res.redirect('/user/register');
				} else {
					bcrypt
						.hash(password, 10)
						.then(hashedPassword => {
							const user = new User({
								fullname: fullname,
								email: email,
								password: hashedPassword,
								level: level,
								profile_details: profile_details,
								role: role || 'basic'
							});

							user
								.save()
								.then(savedUser => {
									req.flash('success', 'User successfully registered!');

									res.redirect('/');
								})
								.catch(err => {
									console.log(err);
								});
						})
						.catch(err => {
							console.log(err);
						});
				}
			})
			.catch(err => {
				console.log(err);
			});
	}
};

exports.loginPage = (req, res) => {
	res.render('index', {
		layout: 'formLayout',
		errors: req.flash('errors')
	});
};

exports.loginUser = (req, res) => {
	let { email, password } = req.body;
	const errors = validationResult(req);
	const output = errors.array();

	if (!errors.isEmpty()) {
		req.flash(
			'errors',
			output.map(err => err.msg)
		);
		res.redirect('/user/login');
	} else {
		User.findOne({ email: email })
			.then(user => {
				if (!user) {
					req.flash('errors', 'Email is not registered');
					res.redirect('/user/login');
				} else {
					bcrypt
						.compare(password, user.password)
						.then(valid => {
							if (!valid) {
								req.flash('errors', 'Invalid email and password');
								res.redirect('/user/login');
							} else {
								req.flash('success', 'You are now logged in');
								res.redirect('/');
							}
						})
						.catch(err => {
							req.flash('errors', 'Failure in signing user in');
							res.redirect('/user/login');
						});
				}
			})
			.catch(err => {
				req.flash('errors', 'Failure in signing user in');
				res.redirect('/user/login');
			});
	}
};

exports.logUserout = (req, res) => {
	res.redirect('/user/login');
};