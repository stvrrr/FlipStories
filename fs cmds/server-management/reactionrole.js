module.exports = {
  name: "reactionrole",
  aliases: ["rr"],
  type: "messageCreate",
  code: `
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$reply[]$title[Permission Denied]$description[You need Manage Server permissions to use reaction roles.]$color[#ED4245]$stop]
    $let[action;$toLowerCase[$message[0]]]
    $if[$get[action]==setup;
      $let[action;none]
    ;]
    $if[$get[action]==;
      $let[action;none]
    ;]
    $if[$get[action]==none;
      $title[Reaction Roles]
      $description[Select a role below.]
      $color[#5865F2]
      $addActionRow
      $addRoleSelectMenu[reactionrole-select;Select roles;false]
      $let[panel;$sendMessage[$channelID;;true]]
      $setGuildVar[reactionrole_panel;$get[panel];$guildID]
      $setGuildVar[reactionrole_entries;;$guildID]
      $deleteMessage[$channelID;$messageID]
    ;]

    $if[$get[action]==add;
      $let[panel;$messageReferenceID[$channelID;$messageID]]
      $onlyIf[$get[panel]!=;$reply[]$title[Reply Required]$description[Reply to the reaction role message you want to edit.]$color[#ED4245]$stop]
      $let[role;$mentionedRoles[0]]
      $onlyIf[$roleExists[$guildID;$get[role]]==true;$reply[]$title[Missing Role]$description[Mention the role you want to add.]$color[#ED4245]$stop]
      $let[roleName;$roleName[$get[role]]]
      $let[color;$replace[$getEmbed[$channelID;$get[panel];0;color];0x;]]
      $title[Reaction Roles]
      $description[Select a role below.]
      $color[$get[color]]
      $addActionRow
      $addRoleSelectMenu[reactionrole-select;Choose your role;false]
      $editMessage[$channelID;$get[panel];]
      $deleteMessage[$channelID;$messageID]
    ;]

    $if[$get[action]==remove;
      $let[panel;$messageReferenceID[$channelID;$messageID]]
      $onlyIf[$get[panel]!=;$reply[]$title[Reply Required]$description[Reply to the reaction role message you want to edit.]$color[#ED4245]$stop]
      $let[role;$mentionedRoles[0]]
      $onlyIf[$roleExists[$guildID;$get[role]]==true;$reply[]$title[Missing Role]$description[Mention the role you want to remove.]$color[#ED4245]$stop]
      $let[color;$replace[$getEmbed[$channelID;$get[panel];0;color];0x;]]
      $title[Reaction Roles]
      $description[Select a role below.]
      $color[$get[color]]
      $editMessage[$channelID;$get[panel];]
      $deleteMessage[$channelID;$messageID]
    ;]
  `,
};
