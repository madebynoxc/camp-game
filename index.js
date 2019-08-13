const discord   = require('discord.io')
const mongoose  = require('mongoose')
const config    = require('./config')
const colors    = require('./utils/colors')
const {trigger} = require('./utils/cmd')
const {user}    = require('./modules')
const {Camp}    = require('./collections')

const mongoUri = config.database
const mongoOpt = {useNewUrlParser: true}

async function main() {
    console.log('[info] intializing connection and starting bot...')

    /* basics */
    const mcn = await mongoose.connect(mongoUri, mongoOpt)
    const bot = new discord.Client({ token: config.token, autorun: true })

    /* create our beautiful msg sending fn */
    const msg = (str, color = 'default') => new Promise((r, f) => {
        const embed = { color: colors[color], description: str }
        bot.sendMessage({ to: config.channel, embed }, e => e ? f(e) : r())
    })

    /* create our player reply sending fn */
    const rpl = (user, str, clr) => msg(`**${user.name}**, ${Array.isArray(str) ? str.join('\n') : str}`, clr)

    /* create our context */
    const ctx = { mcn, bot, msg, rpl }

    /* events */
    bot.on('ready', async event => {
        bot.setPresence({ game: { name: 'in a camp' } })

        console.log('[info] bot is ready')
        // await msg('The camp is here')

        setInterval(tick.bind(this, ctx), 5000);
    })

    bot.on('message', async (username, userid, channelid, message, event) => {
        if (!message.startsWith(config.prefix)) return; /* skip not commands */
        if (bot.users[userid].bot) return; /* skip bot users */

        const usr  = await user.fetchOrCreate(ctx, userid, username)
        const args = message.trim().substring(1).split(' ')

        try {
            await trigger(args, ctx, usr)
        } catch (e) {
            rpl(usr, e.message, 'red')
        }
    })
}

async function onActionComplete(camp) {
    switch(camp.action.id) {
        case "clean":
            camp.garbage = 0;
            await $.col.camps.save(camp);
            break;
    }
}

async function tick(ctx) {
    const date = Date.now()
    const write = []
    const camps = await Camp.find({ action: { $ne: undefined }})

    for (var i = camps.length - 1; i >= 0; i--) {
        const camp = camps[i]

        const mul = camp.action.drain
        const set = {}

        if (date > camp.action.expires) {
            await onActionComplete(camp);

            ctx.msg(`Task **${camp.action.id}** in **${camp.name || 'unknown camp'}** is complete`)

            set.level = camp.level + camp.action.exp
            set.action = undefined
        }

        if (camp.action.id !== 'clean') {
            set.garbage = camp.garbage + .01;
        }

        set.energy = camp.energy - .05 * mul;

        write.push({updateOne: {
            filter: {"_id": camp._id},
            update: {$set: set}
        }})
    }

    if (write.length > 0) {
        Camp.collection.bulkWrite(write);
    }
}

main().catch(console.error)
