const {model, Schema} = require('mongoose')

module.exports = model('Camp', {
    name:       { type: String },
    owner:      { type: String },
    location:   { type: Number },

    food:       { type: Number, default: 5 },
    level:      { type: Number, default: 0 },
    energy:     { type: Number, default: 100.0 },
    protection: { type: Number, default: 1 },
    comfort:    { type: Number, default: 1 },
    garbage:    { type: Number, default: 1 },

    action:     { type: Schema.Types.Mixed },
    resources:  { type: Array, default: [] },

    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
})
