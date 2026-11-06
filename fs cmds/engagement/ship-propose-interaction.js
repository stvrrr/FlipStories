module.exports = {
  name: "ship-propose-interaction",
  type: "interactionCreate",
  allowedInteractionTypes: ["button"],
  code: `
    $if[$startsWith[$customID;ship-propose-]==false;$stop;]
    $deferUpdate
    $textSplit[$customID;-]
    $let[userOne;$arrayAt[splits;2]]
    $let[userTwo;$arrayAt[splits;3]]
    $let[allowed;$if[$authorID==$get[userOne];true;$if[$authorID==$get[userTwo];true;false]]]
    $if[$get[allowed]==false;$interactionReply[Only one of the shipped users can open a proposal.]$stop;]
    $let[target;$if[$authorID==$get[userOne];$get[userTwo];$get[userOne]]]
    $title[Marriage Proposal]
    $description[$username[$authorID] proposed to $username[$get[target]]!]
    $color[#FF4DA6]
    $addActionRow
    $addButton[marry-accept-$authorID-$get[target];Accept;Success;💍]
    $addButton[marry-decline-$authorID-$get[target];Decline;Danger;✖️]
    $interactionUpdate[Proposal sent.]
  `,
};
