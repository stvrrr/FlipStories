module.exports = {
  type: "interactionCreate",
  allowedInteractionTypes: ["roleSelectMenu"],
  code: `
    $if[$customID!=welcomer_autoroles;$stop]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$ephemeral$interactionReply[Only server managers can edit the welcomer.]$stop]
    $deferUpdate
    $let[roles;$selectMenuValues]
    $setGuildVar[autorole_ids;$get[roles];$guildID]
    $title[Welcomer Editor • Automation]
    $description[Welcome DMs, autoroles, join delay, bot filtering, and account-age checks.]
    $addField[Welcome DM;$if[$getGuildVar[welcome_dm_enabled;$guildID;false]==true;Enabled;Disabled];true]
    $addField[Autoroles;Saved;true]
    $addField[Join Delay;$getGuildVar[join_role_delay;$guildID;0]ms;true]
    $addField[Ignore Bots;$if[$getGuildVar[ignore_bots;$guildID;true]==true;Enabled;Disabled];true]
    $addField[Minimum Account Age;$getGuildVar[minimum_account_age;$guildID;0] hours;true]
    $addActionRow
    $addStringSelectMenu[welcomer_section;Welcome or leave]
    $addOption[Welcome settings;Edit the welcome embed;welcome;👋]
    $addOption[Leave settings;Edit the leave embed;leave;👋]
    $addOption[Automation settings;Configure DMs, roles, and filters;settings;⚙️]
    $addActionRow
    $addRoleSelectMenu[welcomer_autoroles;Select automatic welcome roles;0;25;false]
    $addActionRow
    $addButton[welcomer_toggle_dm;Toggle Welcome DM;Primary;💌]
    $addButton[welcomer_toggle_ignorebots;Ignore Bots;Secondary;🤖]
    $addButton[welcomer_edit_limits;Edit Delay / Age;Secondary;⏱️]
    $interactionUpdate[ ]
    $ephemeral
    $interactionFollowUp[Autoroles saved.]
  `,
};
