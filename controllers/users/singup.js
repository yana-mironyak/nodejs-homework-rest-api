const { Conflict } = require('http-errors');
const { User } = require('../../models');
const gravatar = require('gravatar');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../../helpers');
const { v4: uuidv4 } = require('uuid');

const signup = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw new Conflict('Email in use');
    }
    const avatarURL = gravatar.url(email);
    const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    const verificationToken = uuidv4();
    const result = await User.create({ email, password: hashPassword, avatarURL, verificationToken });

    const mail = {
        to: email,
        subject: 'Email verification',
        html: `<a target='_blank' href='http://localhost:3000/api/users/verify/${verificationToken}'>'Click here'</a>`
    }

    await sendEmail(mail);

    res.status(201).json({
        status: "created",
        code: 201,
        data: {
            email,
            avatarURL,
            verificationToken,
        }
    })
};

module.exports = signup;