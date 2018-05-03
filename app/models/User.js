let Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

let userSchema = new Schema({
	firstName: {
		type:String
	},
	lastName: {
		type:String
	},
	mobile: {
		type:Number
	},
	username:{
		type:String,
		required: true
	},
	email:{
		type:String,
		required: true
	},
	password: {
		type:String,
		required: true
	},
	isActive: {
		type: Boolean,
		default: true
	},
	createdAt: Date,
	updatedAt: Date
}, {
	collection: 'users',
	timestamps: true
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
	let user = this;
	if (!user.isModified('password')) {
		return next();
	}
	bcrypt.genSalt(10, (err, salt) => {
		if (err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, null, (err, hash) => {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(password, cb) {
	bcrypt.compare(password, this.password, (err, isMatch) => {
		cb(err, isMatch);
	});
};


let Users = mongoose.model('Users', userSchema);

module.exports = Users;