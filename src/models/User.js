const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required:true, unique: true },
    email: { type: String,required:true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' }, 
    age: { type: Number, required: true },
    position: { type: String, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // Nueva línea aquí
    location: {
        latitude: { type: Number, default: -12.046374 },
        longitude: { type: Number, default: -77.042793 }
    }
});

module.exports = mongoose.model('User', UserSchema);
