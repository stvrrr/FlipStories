module.exports = {
  name: "marry-interaction",
  type: "interactionCreate",
  allowedInteractionTypes: ["button"],
  code: `
    $if[$startsWith[$customID;marry-]==false;$stop;]
    $deferUpdate
    $textSplit[$customID;-]
    $let[action;$arrayAt[splits;1]]
    $let[proposer;$arrayAt[splits;2]]
    $let[target;$arrayAt[splits;3]]
    $if[$authorID!=$get[target];$interactionReply[Only the person receiving the proposal can answer.]$stop;]
    $if[$get[action]==accept;$setUserVar[married_to;$get[target];$get[proposer]]$setUserVar[married_to;$get[proposer];$get[target]]$interactionUpdate[💍 $username[$get[proposer]] and $username[$get[target]] are now married!];$interactionUpdate[💔 The marriage proposal was declined.]]
  `,
};
