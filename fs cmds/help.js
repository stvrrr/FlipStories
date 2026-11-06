module.exports = {
  name: "help",
  aliases: ["commands"],
  type: "messageCreate",
  code: `
    $thumbnail[$userAvatar[$botID]]
    $title[Advanced Command Help]
    $description[Browse the prefix commands currently loaded by the bot. Use \`help <command>\` to learn about a specific command.]
    $addField[📋 Prefix Commands;$commandNames[messageCreate;
];false]
    $footer[ForgeScript • $guildName • $commandCount[messageCreate] commands]
    $color[#5865F2]
    $addActionRow
    $addStringSelectMenu[help_category;Select a command category]
    $addOption[Utility;General-purpose tools;utility;🛠️]
    $addOption[Economy;Currency and shop commands;economy;💰]
    $addOption[Moderation;Member and server moderation;moderation;🛡️]
    $addOption[Welcomer;Welcome and goodbye settings;welcomer;👋]
    $addOption[Server Management;Server configuration and management;server_management;⚙️]
    $addOption[Minigames;Fun mini games and activities;minigames;🎮]
    $addOption[Engagement;Levels, rewards, and engagement;engagement;✨]
    $addOption[Flip Stories;Commands for the Flip Stories website;flip_stories;📖]
    $addActionRow
    $addStringSelectMenu[help_command;Choose a category first;true]
    $addOption[No category selected;Select a category from the menu above;none]
    $interactionReply[ ]
  `,
};
