export function handleCommands(interaction, commands) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.find(cmd => cmd.data.name === interaction.commandName);
    
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
} 