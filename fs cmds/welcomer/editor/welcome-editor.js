module.exports = {
  name: "welcomer",
  aliases: ["welcome-editor", "welcomer-editor"],
  type: "messageCreate",
  code: `
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$description[Only server managers can edit the welcomer.]$color[#ED4245]]
    $let[section;welcome]
    $let[channel;$getGuildVar[welcome_channel;$guildID;$guildSystemChannelID]]
    $let[message;$getGuildVar[welcome_description;$guildID;Welcome to **{server}**, **{user}**!]]
    $let[message;$replace[$replace[$replace[$replace[$get[message];{user};$username];{mention};@$username];{server};$guildName];{memberCount};$guildMemberCount]]
    $title[$getGuildVar[welcome_title;$guildID;Welcome!]]
    $description[$get[message]]
    $addField[Status;$if[$getGuildVar[welcome_enabled;$guildID;true]==true;Enabled;Disabled];true]
    $addField[Channel;<#$get[channel]>;true]
    $addField[Preview;Welcome embed shown below;false]
    $author[$guildName;$guildIcon]
    $thumbnail[$guildIcon]
    $color[$hexToInt[$getGuildVar[welcome_color;$guildID;5865F2]]]
    $addActionRow
    $addStringSelectMenu[welcomer_section;Welcome or leave]
    $addOption[Welcome settings;Edit the welcome embed;welcome;👋]
    $addOption[Leave settings;Edit the leave embed;leave;👋]
    $addOption[Automation settings;Configure DMs, roles, and filters;settings;⚙️]
    $addActionRow
    $addChannelSelectMenu[welcomer_channel_welcome;Choose the welcome channel;1;1;false]
    $addActionRow
    $addButton[welcomer_toggle_welcome;Enable / Disable;Primary;🔄]
    $addButton[welcomer_edit_welcome;Edit Embed;Secondary;✏️]
    $addButton[welcomer_embed_welcome;Toggle Embed;Secondary;🖼️]
    $addButton[welcomer_preview_welcome;Full Preview;Success;👁️]
  `,
};
