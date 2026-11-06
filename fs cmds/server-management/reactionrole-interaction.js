module.exports = {
  name: "reactionrole-interaction",
  type: "interactionCreate",
  allowedInteractionTypes: ["roleSelectMenu"],
  code: `
    $if[$customID!=reactionrole-select;$stop;]
    $deferUpdate
    $let[role;$selectMenuValues[0]]
    $onlyIf[$roleExists[$guildID;$get[role]]==true;$interactionReply[That role no longer exists.]$stop]
    $if[$hasRoles[$guildID;$authorID;$get[role]]==true;
      $memberRemoveRoles[$guildID;$authorID;$get[role]]
      $interactionUpdate[Removed <@&$get[role]>.]
    ;
      $memberAddRoles[$guildID;$authorID;$get[role]]
      $interactionUpdate[Added <@&$get[role]>.]
    ]
  `,
};
