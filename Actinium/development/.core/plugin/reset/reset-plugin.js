const path = require('path');
const {
    CloudCapOptions,
    CloudHasCapabilities,
} = require(`${ACTINIUM_DIR}/lib/utils`);
const chalk = require('chalk');

const PLUGIN = {
    ID: 'Reset',
    name: 'Reset Plugin',
    description:
        'Utility for resetting Actinium core to blank configuration (Use with Caution.)',
    meta: {
        group: 'utilities',
        settings: true,
    },
    version: {
        actinium: '>=3.1.6',
        plugin: '0.0.1',
    },
};

Actinium.Plugin.register(PLUGIN);
Actinium.Plugin.addLogo(
    PLUGIN.ID,
    path.resolve(__dirname, 'plugin-assets/reset-logo.svg'),
);
Actinium.Plugin.addScript(
    PLUGIN.ID,
    path.resolve(__dirname, 'plugin-assets/reset.js'),
);
Actinium.Plugin.addStylesheet(
    PLUGIN.ID,
    path.resolve(__dirname, 'plugin-assets/reset-plugin.css'),
);

Actinium.Hook.register('warn', async () => {
    if (
        Actinium.Plugin.isActive(PLUGIN.ID) &&
        process.env.NODE_ENV !== 'development'
    ) {
        BOOT(
            chalk.magenta(
                'WARNING: Reset Plugin is enabled. Disable this in production!!!!!!!!!!!!!!!!!',
            ),
        );
    }
});

Actinium.Cloud.define(PLUGIN.ID, 'reset-actinium', async req => {
    if (process.env.NODE_ENV !== 'development') throw 'Development only!';
    if (!CloudHasCapabilities(req, 'reset-actinium'))
        throw 'Permission Denied.';

    const options = CloudCapOptions(req, ['reset-actinium']);

    // reset routes
    let query = new Parse.Query('Route');
    let routes = await query.find(options);
    routes = routes.map(route => {
        route.set('meta', {});
        return route;
    });
    await Parse.Object.saveAll(routes, options);
    await Parse.Object.destroyAll(routes, options);

    // reset capabilities
    query = new Parse.Query('Capability');
    const capabilities = await query.find(options);
    await Parse.Object.destroyAll(capabilities, options);

    // reset plugins
    query = new Parse.Query('Plugin');
    let plugins = await query.find(options);
    plugins = plugins.map(plugin => {
        plugin.set('meta', {});
        return plugin;
    });
    await Parse.Object.saveAll(plugins, options);
    await Parse.Object.destroyAll(plugins, options);
});
