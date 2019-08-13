const {model, Schema} = require('mongoose')

module.exports = model('Location', {
    id:     { type: Number },
    name:   { type: String },
})
