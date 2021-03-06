const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.registerPage = (req, res) => {
	res.render('index', {
		layout: 'formLayout2',
		errors: req.flash('errors'),
		body: req.session.body
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
		req.session.body = {
			fullname,
			email,
			level,
			profile_details
		};
		res.redirect('/user/register');
	} else {
		User.findOne({ email: email })
			.then(found => {
				if (found) {
					req.flash('errors', 'Email already exists');
					req.session.body = {
						fullname,
						email,
						level,
						profile_details
					};
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
									req.session.email = savedUser.email;

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
		errors: req.flash('errors'),
		body: req.session.body
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

		req.session.body = {
			email
		};
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
								req.session.body = {
									email
								};
								res.redirect('/user/login');
							} else {
								req.flash('success', 'You are now logged in');
								req.session.email = user.email;
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
				req.flash('errors', 'Failure in signing user in, Try again, later');
				res.redirect('/user/login');
			});
	}
};

exports.logUserout = (req, res) => {
	req.session.destroy(err => {
		res.redirect('/');
	});
};

exports.contactForm = (req, res) => {
	//initializing the stmp transport
	const stmpTrans = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: '465',
		secure: true,
		auth: {
			user: USER_MAIL,
			pass: USER_PASS
		}
	});
	//setting the options of the mail
	const mailOpts = {
		from: req.body.email,
		to: USER_MAIL,
		subject: `Contact-us form page from student-tutors by a user(${req.body.firstname})`,
		html: `<p>This mail is from student-tutors contact-us form page. The details are as follow;</p><br/> <h2>Name:  </h2> <p>${req.body.name}</p> <br/> <h2>Email:  </h2> <p>${req.body.email}</p> <br/> <h2>Phone Number:  </h2> <p>${req.body.mobile_num}</p> <br/> <h2>Message:  </h2> <p>${req.body.message}</p>`
	};

	//send the mail if there are no error
	stmpTrans.sendMail(mailOpts, (err, res) => {
		if (err) {
			res.send('errror');
		} else {
			res.send('success');
		}
	});
};
