module.exports = {
  type: "interactionCreate",
  allowedInteractionTypes: ["button"],
  code: `
    $if[$startsWith[$customID;welcomer_]==false;$stop]
    $if[$startsWith[$customID;welcomer_edit_]==true;$stop]
    $if[$startsWith[$customID;welcomer_edit_limits]==true;$stop]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$ephemeral$interactionReply[Only server managers can edit the welcomer.]$stop]
    $deferUpdate
    $let[section;$if[$endsWith[$customID;leave]==true;leave;welcome]]
    $if[$startsWith[$customID;welcomer_toggle_dm]==true;
    $let[next;$if[$getGuildVar[welcome_dm_enabled;$guildID;false]==true;false;true]]
    $setGuildVar[welcome_dm_enabled;$get[next];$guildID]
    $title[Welcomer Editor • Automation]
    $description[Welcome DMs, autoroles, join delay, bot filtering, and account-age checks.]
    $addField[Welcome DM;$if[$get[next]==true;Enabled;Disabled];true]
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
    $interactionUpdate[]
    $stop
    ]
    $if[$startsWith[$customID;welcomer_toggle_ignorebots]==true;
    $let[next;$if[$getGuildVar[ignore_bots;$guildID;true]==true;false;true]]
    $setGuildVar[ignore_bots;$get[next];$guildID]
    $title[Welcomer Editor • Automation]
    $description[Welcome DMs, autoroles, join delay, bot filtering, and account-age checks.]
    $addField[Welcome DM;$if[$getGuildVar[welcome_dm_enabled;$guildID;false]==true;Enabled;Disabled];true]
    $addField[Autoroles;$getGuildVar[autorole_ids;$guildID;None];true]
    $addField[Join Delay;$getGuildVar[join_role_delay;$guildID;0]ms;true]
    $addField[Ignore Bots;$if[$get[next]==true;Enabled;Disabled];true]
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
    $interactionUpdate[]
    $stop
    ]
    $if[$startsWith[$customID;welcomer_toggle_welcome]==true;
    $let[next;$if[$getGuildVar[$get[section]_enabled;$guildID;true]==true;false;true]]
    $setGuildVar[$get[section]_enabled;$get[next];$guildID]
    ]
    $if[$startsWith[$customID;welcomer_toggle_leave]==true;
    $let[next;$if[$getGuildVar[leave_enabled;$guildID;true]==true;false;true]]
    $setGuildVar[leave_enabled;$get[next];$guildID]
    ]
    $if[$startsWith[$customID;welcomer_embed_$get[section]]==true;
    $let[next;$if[$getGuildVar[$get[section]_embed;$guildID;true]==true;false;true]]
    $setGuildVar[$get[section]_embed;$get[next];$guildID]
    ]
    $if[$startsWith[$customID;welcomer_preview_]==true;
    $let[message;$getGuildVar[$get[section]_description;$guildID;Welcome!]]
    $let[message;$replace[$replace[$replace[$replace[$get[message];{user};$username];{mention};<$authorID>];{server};$guildName];{memberCount};$guildMemberCount]]
    $title[$getGuildVar[$get[section]_title;$guildID;Welcome!]]
    $description[$get[message]]
    $author[$getGuildVar[$get[section]_author;$guildID;$guildName];$guildIcon]
    $footer[$getGuildVar[$get[section]_footer;$guildID;$guildName]]
    $color[$hexToInt[$getGuildVar[$get[section]_color;$guildID;5865F2]]]
    $addActionRow
    $addStringSelectMenu[welcomer_section;Welcome or leave]
    $addOption[Welcome settings;Edit welcome;welcome;👋]
    $addOption[Leave settings;Edit leave;leave;👋]
    $addOption[Automation settings;Automation;settings;⚙️]
    $addActionRow
    $addButton[welcomer_preview_$get[section];Refresh Preview;Success;🔄]
    $addButton[welcomer_edit_$get[section];Edit Embed;Secondary;✏️]
    $interactionUpdate[]
    $stop
    ]
    $let[channel;$getGuildVar[$get[section]_channel;$guildID;$guildSystemChannelID]]
    $let[message;$getGuildVar[$get[section]_description;$guildID;Welcome!]]
    $let[message;$replace[$replace[$replace[$replace[$get[message];{user};$username];{mention};<$authorID>];{server};$guildName];{memberCount};$guildMemberCount]]
    $title[$getGuildVar[$get[section]_title;$guildID;Welcome!]]
    $description[$get[message]]
    $addField[Status;$if[$getGuildVar[$get[section]_enabled;$guildID;true]==true;Enabled;Disabled];true]
    $addField[Channel;<#$get[channel]>;true]
    $addField[Embed;$if[$getGuildVar[$get[section]_embed;$guildID;true]==true;Enabled;Disabled];true]
    $author[$getGuildVar[$get[section]_author;$guildID;$guildName];$guildIcon]
    $footer[$getGuildVar[$get[section]_footer;$guildID;$guildName]]
    $color[$hexToInt[$getGuildVar[$get[section]_color;$guildID;5865F2]]]
    $addActionRow
    $addStringSelectMenu[welcomer_section;Welcome or leave]
    $addOption[Welcome settings;Edit welcome;welcome;👋]
    $addOption[Leave settings;Edit leave;leave;👋]
    $addOption[Automation settings;Automation;settings;⚙️]
    $addActionRow
    $addChannelSelectMenu[welcomer_channel_$get[section];Choose channel;1;1;false]
    $addActionRow
    $addButton[welcomer_toggle_$get[section];Enable / Disable;Primary;🔄]
    $addButton[welcomer_edit_$get[section];Edit Embed;Secondary;✏️]
    $addButton[welcomer_embed_$get[section];Toggle Embed;Secondary;🖼️]
    $addButton[welcomer_preview_$get[section];Preview;Success;👁️]
    $interactionUpdate[]
  `,
};
