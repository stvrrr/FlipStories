module.exports = {
  name: "goodbyeEvent",
  type: "guildMemberRemove",
  code: `
    $onlyIf[$getGuildVar[leave_enabled;$guildID;true]==true;$stop]
    $let[channel;$getGuildVar[leave_channel;$guildID;$guildSystemChannelID]]
    $let[embedMessage;$getGuildVar[leave_description;$guildID;**{user}** just left **{server}**. We now have **{memberCount}** members.]]
    $let[embedMessage;$replace[$replace[$replace[$replace[$get[embedMessage];{user};$username[$authorID]];{server};$guildName];{memberCount};$guildMemberCount];{mention};<@$authorID>]]
    $if[$getGuildVar[leave_embed;$guildID;true]==true;
      $title[$replace[$replace[$replace[$getGuildVar[leave_title;$guildID;Goodbye!];{user};$username[$authorID]];{server};$guildName];{memberCount};$guildMemberCount]]
      $description[$get[embedMessage]]
      $author[$getGuildVar[leave_author;$guildID;$guildName]]
      $footer[$getGuildVar[leave_footer;$guildID;$guildName]]
      $color[$hexToInt[$getGuildVar[leave_color;$guildID;5865F2]]]
      $thumbnail[$userAvatar[$authorID]]
    ]
    $sendMessage[$get[channel];]
  `,
};
