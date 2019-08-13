const {cmd} = require('../utils/cmd')

cmd('store', (ctx, user) => {
    ctx.rpl(user, '**!Welcome to the camp store!**')
})

cmd('store', 'buy', async (ctx, user, ...args) => {

})

cmd('store', 'sell', async (ctx, user, ...args) => {

})

cmd('help', 'store', ({ rpl }, user) => {
    const data = [
        'Here is the help for the store:',
        '**/store buy ID** - allows you to buy a thing',
        '**/store sell ID** - allows you to sell a thing',
    ]

    rpl(user, data.join('\n'))
})
