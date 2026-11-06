module.exports = {
  name: "help_category",
  type: "interactionCreate",
  allowedInteractionTypes: ["selectMenu"],
  code: `
    $deferUpdate
    $let[category;$selectMenuValues[0]]
    $title[Commands • $if[$get[category]==utility;Utility;$if[$get[category]==economy;Economy;$if[$get[category]==moderation;Moderation;$if[$get[category]==welcomer;Welcomer;$if[$get[category]==server_management;Server Management;$if[$get[category]==minigames;Minigames;$if[$get[category]==engagement;Engagement;$if[$get[category]==flip_stories;Flip Stories;Unknown Category]]]]]]]]
    $description[Select a command below to view its usage, aliases, and details.]
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
    $addStringSelectMenu[help_command;Select a command to view]
    $if[$get[category]==utility;$addOption[cmds;View the available commands;cmds;📋]$addOption[ping;Check bot latency;ping;🏓];]
    $if[$get[category]==economy;$addOption[balance;Check your balance;balance;💰]$addOption[deposit;Deposit coins into the bank;deposit;🏦]$addOption[give;Give coins to another member;give;🎁]$addOption[rob;Attempt to rob another member;rob;🦹]$addOption[withdraw;Withdraw coins from the bank;withdraw;🏧]$addOption[work;Earn coins by working;work;💼];]
    $if[$get[category]==minigames;$addOption[coinflip;Flip a coin;coinflip;🪙]$addOption[slot;Spin the slot machine;slot;🎰];]
    $if[$get[category]==flip_stories;$addOption[story;Interact with Flip Stories;story;📖];]
    $if[$get[category]==moderation;$addOption[No commands yet;This category has no commands yet;moderation_empty;🔒];]
    $if[$get[category]==welcomer;$addOption[Welcomer Editor;Configure welcome and leave embeds;welcomer;👋]$addOption[Welcome Preview;Preview a welcome or leave embed;welcome-preview;👁️];]
    $if[$get[category]==server_management;$addOption[Reaction Roles;Create and manage button reaction roles;reactionrole;🎭];]
    $if[$get[category]==engagement;$addOption[No commands yet;This category has no commands yet;engagement_empty;✨];]
    $interactionUpdate[ ]
  `,
};
