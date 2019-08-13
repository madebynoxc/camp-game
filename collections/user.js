const {model, Schema} = require('mongoose')

module.exports = model('User', {
    discord_id: { type: String },
    name:       { type: String },

    camping:    { type: Number, default: 0 },
    credits:    { type: Number, default: 200 },

    inventory: [],
    achievements: [],

    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
})
