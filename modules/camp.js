const msToTime = require('pretty-ms')
const {Camp, Location} = require('../collections')
const {cmd} = require('../utils/cmd')

/* helper wrapper function for command handler */
const withCamp = callback => async (ctx, user, ...args) => {
    const camp = await Camp.findOne({ owner: user.discord_id })

    if (!camp) {
        return ctx.rpl(user, 'Seems like you don\'t have a camp. To set up one run `/camp new`');
    }

    return callback(ctx, user, camp, ...args)
}

cmd('camp', 'new', async (ctx, user, arg1) => {
    const camps = await Camp.countDocuments({ owner: user.discord_id })

    if (camps.length > 0) {
        return ctx.rpl(user, 'you already have a camp!')
    }

    const location = await Location.findOne({ id: parseInt(arg1) || -1 })

    if (!location) {
        const allLocations = await Location.find()
        const locationlist = allLocations.map(loc => `${loc.id}. **${loc.name}**`)

        const response = [
            'You need to specify a location.',
            'Select one and run `/camp new [location #]',
            'Existing locations:',
        ].concat(locationlist)

        return ctx.rpl(user, response)
    }

    const camp = new Camp()

    camp.location = location.id
    camp.owner = user.discord_id

    await camp.save()
    await ctx.rpl(user, `new camp established in **${location.name}**. Run \`/camp\` to view`)
})

cmd('camp', withCamp(async (ctx, user, camp) => {
    console.log(camp.action)

    const timeToAction = camp.action
        ? msToTime(new Date(camp.action.expires) - new Date())
        : ''

    const location = await Location.findOne({ id: camp.location })
    const response = [
        `your camp information:`,
        `Name: **${camp.name? camp.name : "<use `/camp name [name]` to set>"}**`,
        `Level: **${camp.level.toFixed(0)}**`,
        `Location: **${location.name}**`,
        `Owner: **${user.name}**`,
        `Energy: **${camp.energy.toFixed(1)}**`,
        `Garbage: **${(camp.action && camp.action.id == "clean")? "cleaning..." : camp.garbage.toFixed(1)}**`,
        `Resources: **${camp.resources.length}** (\`/camp resources\` to view)`,
        `Currently **${camp.action? camp.action.name : "doing nothing"}** ${timeToAction}`,
    ]

    return ctx.rpl(user, response)
}))

cmd('camp', 'name', withCamp(async (ctx, user, camp, ...args) => {
    camp.name = args.join(' ')

    await camp.save()
    await ctx.rpl(user, 'name has been updated')
}))

cmd('camp', 'build', withCamp(async (ctx, user, camp, ...args) => {
    ctx.rpl(user, 'I see you wish to build something, eh')
}))

cmd('camp', 'resources', withCamp(async (ctx, user, camp) => {
    if (camp.resources.length == 0) {
        return ctx.rpl(user, "You don't have any resources. Collect them by scouting the area using `/camp scout`")
    }

    const response = camp.resources.map(res =>
        `${res.name} (${res.amount})`
    )

    return ctx.rpl(user, response)
}))

const scout = withCamp(async (ctx, user, camp, ...args) => {
    if (camp.action && camp.action.name) {
        return ctx.rpl(user, `You already **${camp.action.name}**`)
    }

    const level = parseInt(args[0]) || -1;

    if (!level || level > 3 || level < 1) {
        return ctx.rpl(user, [
            'Please specify scouting level:',
            '1. Short walk (3m)',
            '2.Exploration (15m)',
            '3. Expedition (1h)',
        ])
    }

    const timeLevels = [-1, 3, 15, 60];
    const time = Date.now() + 1000 * 60 * timeLevels[level];
    const diff = new Date(time) - new Date()

    camp.action = {
        id: "scout",
        name: "scouting area",
        drain: 3,
        expires: time,
        exp: 1
    }

    camp.markModified('action');

    await camp.save();
    await ctx.rpl(user, `Started scouting for resources. Ends in: **${msToTime(diff)}**`)
})

cmd('scout', scout)
cmd('camp', 'scout', scout)
