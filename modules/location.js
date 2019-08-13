const {cmd} = require('../utils/cmd')

cmd('help', 'location', (ctx, user) => {
    ctx.rpl(user, 'Here is some help for about location: **no**')
})
