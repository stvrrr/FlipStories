module.exports = {
  type: "interactionCreate",
  allowedInteractionTypes: ["button"],
  code: `
    $onlyIf[$startsWith[$customID;welcomer_]==true;$stop]
    $onlyIf[$hasPerms[$guildID;$authorID;ManageGuild]==true;$ephemeral$interactionReply[Only server managers can edit the welcomer.]$stop]
    $let[section;$if[$endsWith[$customID;leave]==true;leave;welcome]]
    $if[$startsWith[$customID;welcomer_edit_limits]==true;
      $ephemeral
      $let[prompt_delay;$interactionReply[Send the **join role delay in milliseconds**, or send **false** to keep it unchanged. Current: $getGuildVar[join_role_delay;$guildID;0] ms;true]]
      $awaitMessage[$channelID;welcomer_delay_response;$authorID==$authorID;5m]
      $let[delay;$trim[$messageContent[$channelID;$env[welcomer_delay_response]]]]
      $let[prompt_age;$interactionFollowUp[Send the **minimum account age in hours**, or send **false** to keep it unchanged. Current: $getGuildVar[minimum_account_age;$guildID;0] hours;true]]
      $awaitMessage[$channelID;welcomer_age_response;$authorID==$authorID;5m]
      $let[age;$trim[$messageContent[$channelID;$env[welcomer_age_response]]]]
      $if[$isNumber[$get[delay]]==true;$setGuildVar[join_role_delay;$get[delay];$guildID]]
      $if[$isNumber[$get[age]]==true;$setGuildVar[minimum_account_age;$get[age];$guildID]]
      $deleteMessages[$channelID;$get[prompt_delay];$env[welcomer_delay_response];$get[prompt_age];$env[welcomer_age_response]]
      $stop
    ]
    $if[$startsWith[$customID;welcomer_edit_]==true;
      $ephemeral
      $let[prompt_title;$interactionReply[Send the embed **title**, or send **false** to keep it unchanged.;true]]
      $awaitMessage[$channelID;welcomer_title_response;$authorID==$authorID;5m]
      $let[title;$trim[$messageContent[$channelID;$env[welcomer_title_response]]]]
      $let[prompt_description;$interactionFollowUp[Send the embed **description**, or send **false** to keep it unchanged.;true]]
      $awaitMessage[$channelID;welcomer_description_response;$authorID==$authorID;5m]
      $let[description;$trim[$messageContent[$channelID;$env[welcomer_description_response]]]]
      $let[prompt_author;$interactionFollowUp[Send the embed **author**, or send **false** to keep it unchanged.;true]]
      $awaitMessage[$channelID;welcomer_author_response;$authorID==$authorID;5m]
      $let[author;$trim[$messageContent[$channelID;$env[welcomer_author_response]]]]
      $let[prompt_footer;$interactionFollowUp[Send the embed **footer**, or send **false** to keep it unchanged.;true]]
      $awaitMessage[$channelID;welcomer_footer_response;$authorID==$authorID;5m]
      $let[footer;$trim[$messageContent[$channelID;$env[welcomer_footer_response]]]]
      $let[prompt_color;$interactionFollowUp[Send the embed **color** as a six-character hex code, or send **false** to keep it unchanged.;true]]
      $awaitMessage[$channelID;welcomer_color_response;$authorID==$authorID;5m]
      $let[color;$trim[$messageContent[$channelID;$env[welcomer_color_response]]]]
      $if[$toLowerCase[$get[title]]!=false;$setGuildVar[$get[section]_title;$get[title];$guildID]]
      $if[$toLowerCase[$get[description]]!=false;$setGuildVar[$get[section]_description;$get[description];$guildID]]
      $if[$toLowerCase[$get[author]]!=false;$setGuildVar[$get[section]_author;$get[author];$guildID]]
      $if[$toLowerCase[$get[footer]]!=false;$setGuildVar[$get[section]_footer;$get[footer];$guildID]]
      $if[$toLowerCase[$get[color]]!=false;$let[color;$toUpperCase[$replace[$get[color];#;]]]]
      $if[$length[$get[color]]==6;$setGuildVar[$get[section]_color;$get[color];$guildID]]
      $deleteMessages[$channelID;$get[prompt_title];$env[welcomer_title_response];$get[prompt_description];$env[welcomer_description_response];$get[prompt_author];$env[welcomer_author_response];$get[prompt_footer];$env[welcomer_footer_response];$get[prompt_color];$env[welcomer_color_response]]
      $stop
    ]
  `,
};
