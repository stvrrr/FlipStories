module.exports = {
  name: "marry",
  type: "messageCreate",
  code: `
    $let[target;$mentioned[0]]
    $onlyIf[$get[target]!=;$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Error!]
$description[Mention the person you want to marry.]
$color[010101]]
    $onlyIf[$get[target]!=$authorID;$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Error!]
$description[You cannot marry yourself.]
$color[010101]]
    $let[existing;$getUserVar[married_to;$authorID]]
    $onlyIf[$get[existing]==;$author[ran by $username[$authorID];$userAvatar[$authorID]]
$title[Already Married]
$description[You are already married.]
$color[010101]]
    $title[Marriage Proposal]
    $description[$username[$authorID] proposed to $username[$get[target]]!]
    $color[#FF4DA6]
    $addActionRow
    $addButton[marry-accept-$authorID-$get[target];Accept;Success;💍]
    $addButton[marry-decline-$authorID-$get[target];Decline;Danger;✖️]
    $reply[]
  `,
};
