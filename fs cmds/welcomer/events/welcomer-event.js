module.exports = {
  name: "welcomerEvent",
  type: "guildMemberAdd",
  code: `
    $if[$getGuildVar[ignore_bots;$guildID;true]==true;$onlyIf[$isBot[$authorID]==false;$stop]]
    $let[minAgeMs;$multi[$getGuildVar[minimum_account_age;$guildID;0];3600000]]
    $onlyIf[$sub[$getTimestamp;$userCreatedAt[$authorID]] >= $get[minAgeMs];$stop]
    $onlyIf[$getGuildVar[welcome_enabled;$guildID;true]==true;$stop]
    $let[delay;$getGuildVar[join_role_delay;$guildID;0]]
    $if[$get[delay]>0;$wait[$get[delay]ms];]
    $let[roles;$getGuildVar[autorole_ids;$guildID;]]
    $if[$get[roles]!=;$memberAddRoles[$guildID;$authorID;$get[roles]];]
    $let[dm;$getGuildVar[welcome_dm_enabled;$guildID;false]]
    $if[$get[dm]==true;
      $let[dmMessage;Welcome to {server}!]
      $let[dmMessage;$replace[$get[dmMessage];{user};$username[$authorID]]]
      $let[dmMessage;$replace[$get[dmMessage];{server};$guildName]]
      $let[dmMessage;$replace[$get[dmMessage];{mention};<@$authorID>]]
      $sendDM[$authorID;$get[dmMessage]]
    ]
    $let[channel;$getGuildVar[welcome_channel;$guildID;$guildSystemChannelID]]
    $let[embedMessage;$getGuildVar[welcome_description;$guildID;Welcome to **{server}**, {user}! You are member **#{memberCount}**.]]
    $let[embedMessage;$replace[$replace[$replace[$replace[$get[embedMessage];{user};$username[$authorID]];{server};$guildName];{memberCount};$guildMemberCount];{mention};<@$authorID>]]
    $if[$getGuildVar[welcome_embed;$guildID;true]==true;
      $title[$replace[$replace[$replace[$getGuildVar[welcome_title;$guildID;Welcome!];{user};$username[$authorID]];{server};$guildName];{memberCount};$guildMemberCount]]
      $description[$get[embedMessage]]
      $author[$getGuildVar[welcome_author;$guildID;$guildName]]
      $footer[$getGuildVar[welcome_footer;$guildID;$guildName]]
      $color[$hexToInt[$getGuildVar[welcome_color;$guildID;5865F2]]]
      $thumbnail[$userAvatar[$authorID]]
    ]
    $sendMessage[$get[channel];]
  `,
};
