module.exports = {
  type: "interactionCreate",
  allowedInteractionTypes: ["selectMenu"],
  code: `
    $if[$customID!=welcomer_section;$stop]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$ephemeral$interactionReply[Only server managers can edit the welcomer.]$stop]
    $deferUpdate
    $let[section;$selectMenuValues[0]]
    $let[prefix;$get[section]]
    $if[$get[section]==settings;
      $title[Welcomer Editor • Automation]
      $description[Welcome DMs, autoroles, join delay, bot filtering, and account-age checks.]
      $addField[Welcome DM;$if[$getGuildVar[welcome_dm_enabled;$guildID;false]==true;Enabled;Disabled];true]
      $addField[Autoroles;$getGuildVar[autorole_ids;$guildID;None];true]
      $addField[Join Delay;$getGuildVar[join_role_delay;$guildID;0]ms;true]
      $addField[Ignore Bots;$if[$getGuildVar[ignore_bots;$guildID;true]==true;Enabled;Disabled];true]
      $addField[Minimum Account Age;$getGuildVar[minimum_account_age;$guildID;0] hours;true]
      $addActionRow
      $addStringSelectMenu[welcomer_section;Editor section]
      $addOption[Welcome settings;Edit welcome settings;welcome;👋]
      $addOption[Leave settings;Edit leave settings;leave;👋]
      $addOption[Automation settings;Configure DMs, roles, and filters;settings;⚙️]
      $addActionRow
      $addRoleSelectMenu[welcomer_autoroles;Select automatic welcome roles;0;25;false]
      $addActionRow
      $addButton[welcomer_toggle_dm;Toggle Welcome DM;Primary;💌]
      $addButton[welcomer_toggle_ignorebots;Ignore Bots;Secondary;🤖]
      $addButton[welcomer_edit_limits;Edit Delay / Age;Secondary;⏱️]
      $interactionUpdate[ ]
      $stop
    ]
    $let[channel;$getGuildVar[$get[prefix]_channel;$guildID;$guildSystemChannelID]]
    $let[message;$getGuildVar[$get[prefix]_description;$guildID;$if[$get[section]==leave;**{user}** just left **{server}**.;Welcome to **{server}**, **{user}**!]]]
    $let[message;$replace[$replace[$replace[$replace[$get[message];{user};$username];{mention};@$username];{server};$guildName];{memberCount};$guildMemberCount]]
    $title[$getGuildVar[$get[prefix]_title;$guildID;$if[$get[section]==leave;Goodbye!;Welcome!]]]
    $description[$get[message]]
    $author[$getGuildVar[$get[prefix]_author;$guildID;$guildName]]
    $footer[$getGuildVar[$get[prefix]_footer;$guildID;$guildName]]
    $addField[Status;$if[$getGuildVar[$get[prefix]_enabled;$guildID;true]==true;Enabled;Disabled];true]
    $addField[Channel;<#$get[channel]>;true]
    $addField[Placeholders;\u007buser\u007d \u007bmention\u007d \u007bserver\u007d \u007bmemberCount\u007d;false]
    $addField[Embed;$if[$getGuildVar[$get[prefix]_embed;$guildID;true]==true;Enabled;Disabled];true]
    $thumbnail[$guildIcon]
    $color[$hexToInt[$getGuildVar[$get[prefix]_color;$guildID;5865F2]]]
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
  `,
};
