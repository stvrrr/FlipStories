module.exports = {
  type: "interactionCreate",
  allowedInteractionTypes: ["channelSelectMenu"],
  code: `
    $if[$startsWith[$customID;welcomer_channel_]==false;$stop]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$ephemeral$interactionReply[Only server managers can edit the welcomer.]$stop]
    $deferUpdate
    $let[section;$if[$customID==welcomer_channel_leave;leave;welcome]]
    $let[channel;$selectMenuValues[0]]
    $setGuildVar[$get[section]_channel;$get[channel];$guildID]
    $let[message;$getGuildVar[$get[section]_description;$guildID;Welcome to **{server}**, **{user}**!]]
    $title[$getGuildVar[$get[section]_title;$guildID;$if[$get[section]==leave;Goodbye!;Welcome!]]]
    $description[$replace[$replace[$replace[$get[message];{user};$username];{server};$guildName];{memberCount};$guildMemberCount]]
    $addField[Status;$if[$getGuildVar[$get[section]_enabled;$guildID;true]==true;Enabled;Disabled];true]
    $addField[Channel;<#$get[channel]>;true]
    $addField[Section;$if[$get[section]==leave;Leave;Welcome];true]
    $color[$hexToInt[$getGuildVar[$get[section]_color;$guildID;5865F2]]]
    $author[$guildName;$guildIcon]
    $footer[$guildName]
    $addActionRow
    $addStringSelectMenu[welcomer_section;Welcome or leave]
    $addOption[Welcome settings;Edit the welcome embed;welcome;👋]
    $addOption[Leave settings;Edit the leave embed;leave;👋]
    $addOption[Automation settings;Configure DMs, roles, and filters;settings;⚙️]
    $addActionRow
    $addChannelSelectMenu[welcomer_channel_$get[section];Choose the $get[section] channel;1;1;false]
    $addActionRow
    $addButton[welcomer_toggle_$get[section];Enable / Disable;Primary;🔄]
    $addButton[welcomer_edit_$get[section];Edit Embed;Secondary;✏️]
    $addButton[welcomer_embed_$get[section];Toggle Embed;Secondary;🖼️]
    $addButton[welcomer_preview_$get[section];Full Preview;Success;👁️]
    $interactionUpdate[ ]
    $ephemeral
    $interactionFollowUp[The $get[section] channel was updated to <#$get[channel]>.]
  `,
};
