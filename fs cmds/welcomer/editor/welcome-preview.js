module.exports = {
  name: "welcome-preview",
  aliases: ["welcomepreview", "leave-preview"],
  type: "messageCreate",
  code: `
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$description[Only server managers can preview the welcomer.]$color[#ED4245]]
    $let[section;$if[$message[0]==leave;leave;welcome]]
    $let[prefix;$get[section]]
    $let[channelVar;$if[$get[section]==leave;leave_channel;welcome_channel]]
    $let[titleVar;$if[$get[section]==leave;leave_title;welcome_title]]
    $let[descriptionVar;$if[$get[section]==leave;leave_description;welcome_description]]
    $let[colorVar;$if[$get[section]==leave;leave_color;welcome_color]]
    $let[channel;$getGuildVar[$get[channelVar];$guildID;$guildSystemChannelID]]
    $let[message;$getGuildVar[$get[descriptionVar];$guildID;]]
    $let[defaultMessage;$if[$get[section]==leave;**{user}** just left **{server}**. We now have **{memberCount}** members.;Welcome to **{server}**, {user}! You are member **#{memberCount}**.]]
    $if[$get[message]==;$let[message;$get[defaultMessage]]]
    $let[message;$replace[$get[message];{user};$username]]
    $let[message;$replace[$get[message];{server};$guildName]]
    $let[message;$replace[$get[message];{memberCount};$guildMemberCount]]
    $let[message;$replace[$get[message];{mention};<@$authorID>]]
    $let[title;$getGuildVar[$get[titleVar];$guildID;]]
    $let[defaultTitle;$if[$get[section]==leave;Goodbye!;Welcome!]]
    $if[$get[title]==;$let[title;$get[defaultTitle]]]
    $let[title;$replace[$get[title];{user};$username]]
    $let[title;$replace[$get[title];{server};$guildName]]
    $let[title;$replace[$get[title];{memberCount};$guildMemberCount]]
    $title[$get[title]]
    $description[$get[message]]
    $author[$getGuildVar[$get[prefix]_author;$guildID;$guildName]]
    $footer[$getGuildVar[$get[prefix]_footer;$guildID;$guildName]]
    $color[$hexToInt[$getGuildVar[$get[colorVar];$guildID;5865F2]]]
    $thumbnail[$userAvatar[$authorID]]
  `,
};
